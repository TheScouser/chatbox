import { describe, expect, it } from "vitest";
import { buttonVariants } from "./button";

describe("Button Variants", () => {
	it("returns correct default classes", () => {
		const result = buttonVariants();
		expect(result).toContain("bg-primary");
		expect(result).toContain("text-primary-foreground");
	});

	it("applies destructive variant correctly", () => {
		const result = buttonVariants({ variant: "destructive" });
		expect(result).toContain("bg-destructive");
		expect(result).toContain("text-white");
	});

	it("applies outline variant correctly", () => {
		const result = buttonVariants({ variant: "outline" });
		expect(result).toContain("border");
		expect(result).toContain("bg-background");
	});

	it("applies small size correctly", () => {
		const result = buttonVariants({ size: "sm" });
		expect(result).toContain("h-8");
	});

	it("applies large size correctly", () => {
		const result = buttonVariants({ size: "lg" });
		expect(result).toContain("h-10");
	});

	it("combines variant and size correctly", () => {
		const result = buttonVariants({ variant: "destructive", size: "lg" });
		expect(result).toContain("bg-destructive");
		expect(result).toContain("h-10");
	});
});
