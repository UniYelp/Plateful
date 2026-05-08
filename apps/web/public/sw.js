self.addEventListener("push", (event) => {
	const data = event.data ? event.data.json() : {};
	const title = data.title || "Plateful Notification";
	const options = {
		body: data.body || "Something happened!",
		icon: "/apple-touch-icon.png",
		badge: "/favicon-32x32.png",
	};

	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	event.waitUntil(clients.openWindow("/dashboard/recipes/gen"));
});
