import { ThemeProvider } from "@/contexts/ThemeContext";
import { render } from "@testing-library/react";
import type React from "react";

export function renderWithProviders(
	ui: React.ReactElement,
	options?: Parameters<typeof render>[1],
) {
	return render(<ThemeProvider>{ui}</ThemeProvider>, options);
}
