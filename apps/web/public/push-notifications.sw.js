/**
 * @file Service worker for handling device push notifications.
 * Handles incoming push events, decodes JSON payloads, displays notifications,
 * and handles notification click interactions.
 */

/* global self, clients */

/**
 * Event listener for incoming push notifications.
 * Extracts the payload and displays the notification with appropriate options.
 *
 * @param {PushEvent} event - The push event triggered by the browser push service.
 */
self.addEventListener("push", (event) => {
	if (!event.data) {
		console.warn("Push event received with no payload data.");
		return;
	}

	/** @type {Promise<void>} */
	let showNotificationPromise;

	try {
		/**
		 * @typedef {Object} PushPayload
		 * @property {string} [title] - The notification title.
		 * @property {string} [body] - The message body.
		 * @property {string} [icon] - URL to the notification icon.
		 * @property {string} [badge] - URL to the badge icon.
		 * @property {Object} [data] - Custom structured metadata.
		 * @property {string} [data.url] - Target redirect URL on click.
		 */

		/** @type {PushPayload} */
		const payload = event.data.json();
		const title = payload.title || "Plateful Notification";
		const options = {
			body: payload.body || "",
			icon: payload.icon || "/apple-touch-icon.png",
			badge: payload.badge || "/favicon-32x32.png",
			data: payload.data || {},
			vibrate: [100, 50, 100],
		};

		showNotificationPromise = self.registration.showNotification(title, options);
	} catch (err) {
		// Fallback to text payload if JSON decoding fails
		const text = event.data.text();
		showNotificationPromise = self.registration.showNotification("Plateful", {
			body: text,
			icon: "/apple-touch-icon.png",
			badge: "/favicon-32x32.png",
		});
	}

	event.waitUntil(showNotificationPromise);
});

/**
 * Event listener for user interaction with notifications (clicks).
 * Closes the notification and navigates/focuses to the target URL.
 *
 * @param {NotificationEvent} event - The notification click event.
 */
self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	/** @type {string} */
	const urlToOpen = event.notification.data?.url || "/dashboard";

	/** @type {Promise<void>} */
	const clickPromise = clients
		.matchAll({ type: "window", includeUncontrolled: true })
		.then((windowClients) => {
			// Search for an existing window/tab matching the URL and focus it if found
			for (let i = 0; i < windowClients.length; i++) {
				const client = windowClients[i];
				if (client.url.includes(urlToOpen) && "focus" in client) {
					return client.focus();
				}
			}
			// Otherwise open a new window
			if (clients.openWindow) {
				return clients.openWindow(urlToOpen);
			}
		});

	event.waitUntil(clickPromise);
});
