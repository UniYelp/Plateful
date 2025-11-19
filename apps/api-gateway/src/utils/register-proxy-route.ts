import { Hono } from "hono";
import { proxy } from "hono/proxy";
import { baseRoutePath } from "hono/route";
import type { BlankEnv, BlankSchema } from "hono/types";

import { PLATEFUL_KEY_HEADER } from "@plateful/http";

type ProxyProps = {
	originUrl: string;
	apiKey: string;
};

/**
 * @see {@link https://hono.dev/docs/helpers/proxy}
 */
export const registerProxyRoute =
	<const P extends string = string>(routePath: P) =>
	<const R extends BlankSchema>({
		originUrl,
		apiKey,
	}: ProxyProps): [P, Hono<BlankEnv, R>] => {
		const route = new Hono<BlankEnv, R>().all("*", (c) => {
			const url = c.req.url;
			const basePath = baseRoutePath(c);
			const proxyPath = url.split(`${basePath}${routePath}`)[1];

			console.debug(
				`${url}[${c.req.method}]: ${basePath} for ${routePath} to ${proxyPath}`,
			);

			return proxy(`${originUrl}${proxyPath}`, {
				...c.req,
				headers: {
					...c.req.header(),
					"X-Forwarded-For": "127.0.0.1",
					"X-Forwarded-Host": c.req.header("host"),
					Authorization: undefined, // do not propagate request headers contained in c.req.header('Authorization')
					[PLATEFUL_KEY_HEADER]: apiKey,
				},
			});
		});

		return [routePath, route];
	};
