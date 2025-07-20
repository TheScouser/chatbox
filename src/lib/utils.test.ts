import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
	it("combines classes correctly", () => {
		const result = cn("btn", "btn-primary");
		expect(result).toBe("btn btn-primary");
	});

	it("handles conditional classes", () => {
		const isActive = true;
		const result = cn("btn", isActive && "btn-active");
		expect(result).toBe("btn btn-active");
	});

	it("handles falsy conditional classes", () => {
		const isActive = false;
		const result = cn("btn", isActive && "btn-active");
		expect(result).toBe("btn");
	});

	it("merges conflicting Tailwind classes correctly", () => {
		const result = cn("px-2 py-1", "px-4");
		expect(result).toBe("py-1 px-4");
	});

	it("handles arrays of classes", () => {
		const result = cn(["btn", "btn-primary"], "px-4");
		expect(result).toBe("btn btn-primary px-4");
	});

	it("handles empty inputs", () => {
		const result = cn();
		expect(result).toBe("");
	});

	it("handles undefined and null inputs", () => {
		const result = cn("btn", undefined, null, "px-4");
		expect(result).toBe("btn px-4");
	});
});
