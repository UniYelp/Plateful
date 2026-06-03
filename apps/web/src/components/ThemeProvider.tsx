import { createContext, use, useEffect, useState } from "react";

import { toggle } from "@plateful/utils";

export type Theme = "dark" | "light" | "system";

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: VoidFunction;
	toggleFullTheme: VoidFunction;
};

const initialState: ThemeProviderState = {
	theme: "light",
	setTheme: () => null,
	toggleTheme: () => null,
	toggleFullTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const applyThemeWithoutTransitions = (theme: Theme) => {
	const root = window.document.documentElement;
	root.classList.add("no-transitions");
	root.classList.remove("light", "dark");

	if (theme === "system") {
		const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
			.matches
			? "dark"
			: "light";

		root.classList.add(systemTheme);
	} else {
		root.classList.add(theme);
	}

	// Force reflow to flush styles instantly
	window.getComputedStyle(root).opacity;

	root.classList.remove("no-transitions");
};

export function ThemeProvider({
	children,
	defaultTheme = "light",
	storageKey = "plateful-ui-theme",
	...props
}: {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
}) {
	const [theme, setTheme] = useState<Theme>(
		() => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
	);

	useEffect(() => {
		applyThemeWithoutTransitions(theme);
	}, [theme]);

	// Listen to system preference changes when theme is set to 'system'
	useEffect(() => {
		if (theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			applyThemeWithoutTransitions("system");
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	const setThemeValue = (theme: Theme) => {
		localStorage.setItem(storageKey, theme);
		setTheme(theme);
	};

	const toggleTheme = () => {
		const [nextTheme] = toggle<Theme>(["dark", "light"], theme);
		if (!nextTheme) return;
		setThemeValue(nextTheme);
	};

	const toggleFullTheme = () => {
		const [nextTheme] = toggle<Theme>(["system", "dark", "light"], theme);
		if (!nextTheme) return;
		setThemeValue(nextTheme);
	};

	const value = {
		theme,
		setTheme: setThemeValue,
		toggleTheme,
		toggleFullTheme,
	};

	return (
		<ThemeProviderContext {...props} value={value}>
			{children}
		</ThemeProviderContext>
	);
}

export const useTheme = () => {
	const context = use(ThemeProviderContext);

	if (context === undefined)
		throw new Error("useTheme must be used within a ThemeProvider");

	return context;
};
