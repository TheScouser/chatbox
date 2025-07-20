import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	const handleThemeChange = () => {
		switch (theme) {
			case "light":
				setTheme("dark");
				break;
			case "dark":
				setTheme("system");
				break;
			case "system":
				setTheme("light");
				break;
		}
	};

	const getIcon = () => {
		switch (theme) {
			case "light":
				return <Sun className="h-4 w-4" />;
			case "dark":
				return <Moon className="h-4 w-4" />;
			case "system":
				return <Monitor className="h-4 w-4" />;
		}
	};

	const getLabel = () => {
		switch (theme) {
			case "light":
				return "Light mode";
			case "dark":
				return "Dark mode";
			case "system":
				return "System theme";
		}
	};

	return (
		<button
			type="button"
			onClick={handleThemeChange}
			className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
			title={getLabel()}
			aria-label={getLabel()}
		>
			{getIcon()}
		</button>
	);
}

// Minimal theme toggle for compact spaces
export function ThemeToggleCompact() {
	const { theme, setTheme } = useTheme();

	const handleThemeChange = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<button
			type="button"
			onClick={handleThemeChange}
			className="p-2 text-muted-foreground hover:text-foreground transition-colors"
			title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
			aria-label={
				theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
			}
		>
			{theme === "dark" ? (
				<Sun className="h-4 w-4" />
			) : (
				<Moon className="h-4 w-4" />
			)}
		</button>
	);
}
