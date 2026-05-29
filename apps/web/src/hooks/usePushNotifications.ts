import { useState, useEffect, useCallback } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@backend/api";

export function usePushNotifications() {
	const [isSupported, setIsSupported] = useState(false);
	const [permission, setPermission] = useState<NotificationPermission>("default");
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const registerSub = useMutation(api.pushSubscriptions.register);
	const unregisterSub = useMutation(api.pushSubscriptions.unregister);
	const getPublicKey = useAction(api.pushSubscriptions.getPublicKey);

	// Convert base64 url-safe string to Uint8Array
	const urlBase64ToUint8Array = (base64String: string) => {
		const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding)
			.replace(/\-/g, "+")
			.replace(/_/g, "/");
		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);
		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	};

	// Check subscription state on mount
	const checkSubscription = useCallback(async () => {
		if (
			typeof window === "undefined" ||
			!("serviceWorker" in navigator) ||
			!("PushManager" in window)
		) {
			setIsSupported(false);
			setIsLoading(false);
			return;
		}

		setIsSupported(true);
		setPermission(Notification.permission);

		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();
			setIsSubscribed(!!subscription);
		} catch (e) {
			console.error("Error checking push subscription status:", e);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		checkSubscription();
	}, [checkSubscription]);

	const subscribe = async () => {
		if (!isSupported) return;

		setIsLoading(true);
		try {
			// 1. Get VAPID public key from backend
			const publicKeyB64 = await getPublicKey();
			if (!publicKeyB64) {
				throw new Error("VAPID public key not configured on backend");
			}

			// 2. Register service worker explicitly (if not already registered)
			await navigator.serviceWorker.register("/push-notifications.sw.js");
			const registration = await navigator.serviceWorker.ready;

			// 3. Request browser notification permission
			const perm = await Notification.requestPermission();
			setPermission(perm);

			if (perm !== "granted") {
				throw new Error("Notification permission not granted");
			}

			// 4. Subscribe with push manager
			const applicationServerKey = urlBase64ToUint8Array(publicKeyB64);
			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey,
			});

			// 5. Send subscription payload to Convex backend
			const subJson = subscription.toJSON();
			if (subJson.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
				await registerSub({
					endpoint: subJson.endpoint,
					keys: {
						p256dh: subJson.keys.p256dh,
						auth: subJson.keys.auth,
					},
				});
				setIsSubscribed(true);
			} else {
				throw new Error("Push subscription missing required fields");
			}
		} catch (err) {
			console.error("Failed to subscribe to push notifications:", err);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const unsubscribe = async () => {
		if (!isSupported) return;

		setIsLoading(true);
		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();

			if (subscription) {
				// 1. Call unregister mutation on backend
				await unregisterSub({ endpoint: subscription.endpoint });
				// 2. Unsubscribe locally
				await subscription.unsubscribe();
				setIsSubscribed(false);
			}
		} catch (err) {
			console.error("Failed to unsubscribe from push notifications:", err);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isSupported,
		permission,
		isSubscribed,
		isLoading,
		subscribe,
		unsubscribe,
		refresh: checkSubscription,
	};
}
