import { toast } from "sonner";

export const requestNotificationPermission = async () => {
	if (!("Notification" in window)) {
		return false;
	}

	if (Notification.permission === "granted") {
		return true;
	}

	if (Notification.permission !== "denied") {
		const permission = await Notification.requestPermission();
		return permission === "granted";
	}

	return false;
};

interface SendNotificationOptions {
	body?: string;
	icon?: string;
}

export const sendNotification = (
	title: string,
	options?: SendNotificationOptions,
) => {
	// Always show toast
	if (options?.body) {
		toast(title, { description: options.body });
	} else {
		toast(title);
	}

	// Show browser notification if possible and page is hidden
	if (
		"Notification" in window &&
		Notification.permission === "granted" &&
		document.visibilityState === "hidden"
	) {
		new Notification(title, {
			body: options?.body,
			icon: options?.icon || "/apple-touch-icon.png",
		});
	}
};
