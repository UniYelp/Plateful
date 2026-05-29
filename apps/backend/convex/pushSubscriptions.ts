"use node";

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { internal } from "./_generated/api";
import {
	action,
	internalAction,
	internalQuery,
	query,
} from "./_generated/server";
import { ENV } from "./configs/env.config";
import { internalMutation } from "./functions";
import { vv } from "./schema";
import { authedMutation } from "./with_auth";

// #region Helpers

/**
 * Reads the VAPID private key from env or PEM file path.
 */
function getPrivateKeyPem(): string | null {
	// 1. Try env variable directly
	let key = ENV.VAPID_PRIVATE_KEY;
	if (key) {
		if (key.includes("\\n")) {
			key = key.replace(/\\n/g, "\n");
		}
		return key;
	}

	// 2. Try env variable file path
	const keyPath = ENV.VAPID_PRIVATE_KEY_PATH;
	if (keyPath) {
		try {
			const resolved = path.resolve(keyPath);
			if (fs.existsSync(resolved)) {
				return fs.readFileSync(resolved, "utf8");
			}
		} catch (e) {
			console.error("Failed to read private key from path:", keyPath, e);
		}
	}

	return null;
}

/**
 * Derives the base64url-encoded VAPID public key from the private key PEM.
 */
function derivePublicKey(privateKeyPem: string): string {
	const privateKey = crypto.createPrivateKey(privateKeyPem);
	const publicKey = crypto.createPublicKey(privateKey);
	const jwk = publicKey.export({ format: "jwk" });

	if (!jwk.x || !jwk.y) {
		throw new Error("Invalid JWK coordinates");
	}

	const x = Buffer.from(jwk.x, "base64url");
	const y = Buffer.from(jwk.y, "base64url");
	const uncompressedPubKey = Buffer.concat([Buffer.from([0x04]), x, y]);

	return uncompressedPubKey.toString("base64url");
}

/**
 * Encrypts a payload for Web Push (RFC 8291 / RFC 8188)
 */
function encryptPayload(
	payload: string,
	p256dhBase64Url: string,
	authBase64Url: string,
) {
	const payloadBuffer = Buffer.from(payload, "utf-8");
	const clientPublicKeyBuf = Buffer.from(p256dhBase64Url, "base64url");
	const clientAuthBuf = Buffer.from(authBase64Url, "base64url");

	if (clientPublicKeyBuf[0] !== 0x04 || clientPublicKeyBuf.length !== 65) {
		throw new Error("Invalid client public key format");
	}

	const clientX = clientPublicKeyBuf.subarray(1, 33);
	const clientY = clientPublicKeyBuf.subarray(33, 65);

	const clientPublicKey = crypto.createPublicKey({
		key: {
			kty: "EC",
			crv: "P-256",
			x: clientX.toString("base64url"),
			y: clientY.toString("base64url"),
		},
		format: "jwk",
	});

	// Generate ephemeral EC key pair
	const ephemeral = crypto.generateKeyPairSync("ec", {
		namedCurve: "prime256v1",
	});
	const ephemeralJwk = ephemeral.publicKey.export({ format: "jwk" });
	const ephemeralX = Buffer.from(ephemeralJwk.x!, "base64url");
	const ephemeralY = Buffer.from(ephemeralJwk.y!, "base64url");
	const ephemeralRawPub = Buffer.concat([
		Buffer.from([0x04]),
		ephemeralX,
		ephemeralY,
	]);

	// Compute shared secret (ECDH)
	const sharedSecret = crypto.diffieHellman({
		privateKey: ephemeral.privateKey,
		publicKey: clientPublicKey,
	});

	// Derive IKM
	const infoBuf = Buffer.concat([
		Buffer.from("WebPush: info\0", "utf-8"),
		clientPublicKeyBuf,
		ephemeralRawPub,
	]);
	const ikm = crypto.hkdfSync(
		"sha256",
		sharedSecret,
		clientAuthBuf,
		infoBuf,
		32,
	);

	// Generate random salt
	const salt = crypto.randomBytes(16);

	// Derive CEK and Nonce
	const cek = crypto.hkdfSync(
		"sha256",
		ikm,
		salt,
		Buffer.from("Content-Encoding: aes128gcm\0", "utf-8"),
		16,
	);
	const nonce = crypto.hkdfSync(
		"sha256",
		ikm,
		salt,
		Buffer.from("Content-Encoding: nonce\0", "utf-8"),
		12,
	);

	// Pad and encrypt: final record gets 0x02 delimiter
	const plaintext = Buffer.concat([payloadBuffer, Buffer.from([0x02])]);

	const cipher = crypto.createCipheriv("aes-128-gcm", cek, nonce);
	const ciphertext = Buffer.concat([
		cipher.update(plaintext),
		cipher.final(),
		cipher.getAuthTag(),
	]);

	// RFC 8188 Header (21 bytes): salt (16 bytes) + recordSize (4 bytes: 4096) + idLen (1 byte: 0)
	const rsBuf = Buffer.alloc(4);
	rsBuf.writeUInt32BE(4096, 0);
	const header = Buffer.concat([salt, rsBuf, Buffer.from([0])]);

	return Buffer.concat([header, ciphertext]);
}

/**
 * Generates the VAPID Authorization header (RFC 8292)
 */
function generateVapidHeader(
	endpoint: string,
	privateKeyPem: string,
	publicKeyB64Url: string,
	subject: string,
) {
	const url = new URL(endpoint);
	const audience = `${url.protocol}//${url.host}`;
	const now = Math.floor(Date.now() / 1000);
	const expiry = now + 12 * 60 * 60; // 12 hours

	const payload = {
		aud: audience,
		exp: expiry,
		sub: subject,
	};

	const header = {
		alg: "ES256",
		typ: "JWT",
	};

	const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
		"base64url",
	);
	const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
		"base64url",
	);
	const tokenInput = `${encodedHeader}.${encodedPayload}`;

	const privateKey = crypto.createPrivateKey(privateKeyPem);
	const signature = crypto.sign("sha256", Buffer.from(tokenInput), {
		key: privateKey,
		dsaEncoding: "ieee-p1363",
	});

	const token = `${tokenInput}.${signature.toString("base64url")}`;

	return `vapid t=${token}, k=${publicKeyB64Url}`;
}

// #endregion

// #region Actions

/**
 * Action to return the public VAPID key to the client.
 */
export const getPublicKey = action({
	args: {},
	handler: async () => {
		const pem = getPrivateKeyPem();
		if (!pem) {
			console.warn("VAPID private key is not configured");
			return null;
		}
		try {
			return derivePublicKey(pem);
		} catch (e) {
			console.error("Failed to derive public key", e);
			return null;
		}
	},
});

/**
 * Internal Action to send a push notification to a specific user's active subscriptions.
 */
export const sendNotificationToUser = internalAction({
	args: {
		userId: vv.id("users"),
		title: vv.string(),
		body: vv.string(),
		url: vv.optional(vv.string()),
	},
	handler: async (ctx, args) => {
		const pem = getPrivateKeyPem();
		if (!pem) {
			console.warn(
				"Skipping push notification: VAPID private key not configured",
			);
			return;
		}

		const subject =
			ENV.VAPID_SUBJECT || "mailto:support@plateful-web-kappa.vercel.app";
		let publicKeyB64Url: string;
		try {
			publicKeyB64Url = derivePublicKey(pem);
		} catch (e) {
			console.error("Failed to derive VAPID public key", e);
			return;
		}

		// Retrieve subscriptions from database (can run custom mutation or queries to fetch them)
		const subscriptions = await ctx.runQuery(
			internal.pushSubscriptions.getSubscriptionsForUser,
			{ userId: args.userId },
		);

		if (!subscriptions || subscriptions.length === 0) {
			return;
		}

		const payloadStr = JSON.stringify({
			title: args.title,
			body: args.body,
			icon: "/apple-touch-icon.png",
			badge: "/favicon-32x32.png",
			data: {
				url: args.url || "/dashboard",
			},
		});

		const sendPromises = subscriptions.map(async (sub) => {
			try {
				const encryptedBody = encryptPayload(
					payloadStr,
					sub.keys.p256dh,
					sub.keys.auth,
				);

				const vapidHeader = generateVapidHeader(
					sub.endpoint,
					pem,
					publicKeyB64Url,
					subject,
				);

				const res = await fetch(sub.endpoint, {
					method: "POST",
					headers: {
						Authorization: vapidHeader,
						"Content-Type": "application/octet-stream",
						"Content-Encoding": "aes128gcm",
						TTL: "86400",
					},
					body: encryptedBody,
				});

				if (!res.ok) {
					console.error(
						`Push service returned status ${res.status} for endpoint ${sub.endpoint}`,
					);
					if (res.status === 410 || res.status === 404) {
						// Subscription is expired or invalid, remove it
						await ctx.runMutation(
							internal.pushSubscriptions.removeSubscription,
							{
								endpoint: sub.endpoint,
							},
						);
					}
				}
			} catch (err) {
				console.error(
					`Failed to send push notification to subscription ${sub.endpoint}:`,
					err,
				);
			}
		});

		await Promise.all(sendPromises);
	},
});

// #endregion

// #region Mutations

/**
 * Mutation to add or update a push subscription.
 */
export const register = authedMutation({
	args: {
		endpoint: vv.string(),
		keys: vv.object({
			p256dh: vv.string(),
			auth: vv.string(),
		}),
	},
	handler: async (ctx, args) => {
		const userId = ctx.user._id;
		const now = Date.now();

		const existing = await ctx.db
			.query("pushSubscriptions")
			.withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
			.unique();

		if (existing) {
			await ctx.db.patch("pushSubscriptions", existing._id, {
				userId,
				keys: args.keys,
				updatedAt: now,
			});
		} else {
			await ctx.db.insert("pushSubscriptions", {
				userId,
				endpoint: args.endpoint,
				keys: args.keys,
				createdAt: now,
				updatedAt: now,
			});
		}
	},
});

/**
 * Mutation to remove a push subscription.
 */
export const unregister = authedMutation({
	args: {
		endpoint: vv.string(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("pushSubscriptions")
			.withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
			.unique();

		if (existing) {
			await ctx.db.delete("pushSubscriptions", existing._id);
		}
	},
});

// #region Internal Queries and Mutations (for actions)

/**
 * Internal Query to get active subscriptions for a user.
 */
export const getSubscriptionsForUser = internalQuery({
	args: {
		userId: vv.id("users"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("pushSubscriptions")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();
	},
});

/**
 * Internal Mutation to remove a subscription when the push service flags it.
 */
export const removeSubscription = internalMutation({
	args: {
		endpoint: vv.string(),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("pushSubscriptions")
			.withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
			.unique();

		if (existing) {
			await ctx.db.delete("pushSubscriptions", existing._id);
		}
	},
});

/**
 * Internal Query to get ingredients expiring soon (within 3 days) that haven't been notified in the last 24h.
 */
export const getExpiringIngredients = internalQuery({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();
		const warningThreshold = now + 3 * 24 * 60 * 60 * 1000; // 3 days

		const ingredients = await ctx.db.query("ingredients").collect();

		return ingredients.filter((ing) => {
			if (ing.deletedAt) return false;

			const hasExpiringQuantity = ing.quantities.some((q) => {
				if (!q.expiresAt) return false;
				return q.expiresAt > now && q.expiresAt <= warningThreshold;
			});

			if (!hasExpiringQuantity) return false;

			if (ing.lastNotifiedExpiryAt) {
				const age = now - ing.lastNotifiedExpiryAt;
				if (age < 24 * 60 * 60 * 1000) {
					return false;
				}
			}

			return true;
		});
	},
});

/**
 * Internal Query to get active household member user IDs.
 */
export const getHouseholdMemberIds = query({
	args: {
		householdId: vv.id("households"),
	},
	handler: async (ctx, args) => {
		const members = await ctx.db
			.query("householdMembers")
			.withIndex("by_household_and_user", (q) =>
				q.eq("householdId", args.householdId),
			)
			.collect();

		return members.filter((m) => !m.deletedAt).map((m) => m.userId);
	},
});

/**
 * Internal Mutation to update the lastNotifiedExpiryAt field.
 */
export const updateLastNotifiedExpiry = internalMutation({
	args: {
		ingredientId: vv.id("ingredients"),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch("ingredients", args.ingredientId, {
			lastNotifiedExpiryAt: Date.now(),
		});
	},
});

/**
 * Action triggered by the daily cron to notify households about expiring ingredients.
 */
export const checkExpiringIngredientsAction = internalAction({
	args: {},
	handler: async (ctx) => {
		const expiring = await ctx.runQuery(
			internal.pushSubscriptions.getExpiringIngredients,
		);

		if (!expiring || expiring.length === 0) {
			return;
		}

		for (const ing of expiring) {
			try {
				// Get household members
				const memberIds = await ctx.runQuery(
					internal.pushSubscriptions.getHouseholdMemberIds,
					{ householdId: ing.householdId },
				);

				if (memberIds && memberIds.length > 0) {
					// Schedule push notifications for each member
					for (const userId of memberIds) {
						await ctx.scheduler.runAfter(
							0,
							internal.pushSubscriptions.sendNotificationToUser,
							{
								userId,
								title: "Ingredient Expiring! ⚠️",
								body: `Your ingredient "${ing.name}" is expiring soon. Use it up!`,
								url: "/dashboard",
							},
						);
					}
				}

				// Mark as notified today
				await ctx.runMutation(
					internal.pushSubscriptions.updateLastNotifiedExpiry,
					{ ingredientId: ing._id },
				);
			} catch (err) {
				console.error(
					`Failed to process expiring notification for ingredient ${ing._id}:`,
					err,
				);
			}
		}
	},
});

// #endregion
