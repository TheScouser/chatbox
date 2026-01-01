import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMutation } from "convex/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FileUpload from "./FileUpload";

vi.mock("convex/react");

describe("FileUpload", () => {
	const originalFetch = global.fetch;

	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		global.fetch = originalFetch as any;
	});

	it("uploads a valid file and calls onUploadComplete", async () => {
		const user = userEvent.setup();
		const onComplete = vi.fn();

		// First mutation -> generateUploadUrl, second -> saveFileMetadata
		const generateUploadUrl = vi.fn(async () => "/upload");
		const saveFileMetadata = vi.fn(async () => "file-1");
		vi.mocked(useMutation)
			.mockImplementationOnce(() => generateUploadUrl as any)
			.mockImplementationOnce(() => saveFileMetadata as any);

		// Mock fetch for the upload URL
		global.fetch = vi.fn(
			async () =>
				({
					ok: true,
					json: async () => ({ storageId: "stor-1" }),
				}) as any,
		);

		const { container } = render(
			<FileUpload agentId={"agent-1"} onUploadComplete={onComplete} />,
		);

		const input = container.querySelector("#file-upload") as HTMLInputElement;
		const file = new File(["hello"], "doc.txt", { type: "text/plain" });

		await user.upload(input, file);

		// generateUploadUrl called without args
		expect(generateUploadUrl).toHaveBeenCalled();
		// save metadata called with values
		expect(saveFileMetadata).toHaveBeenCalledWith({
			storageId: "stor-1",
			agentId: "agent-1",
			filename: "doc.txt",
			contentType: "text/plain",
			size: file.size,
		});
		expect(onComplete).toHaveBeenCalledWith("file-1");
	});

	it("rejects files exceeding max size", async () => {
		const user = userEvent.setup();
		const onError = vi.fn();

		// Provide dummy mutations (should not be called)
		vi.mocked(useMutation)
			.mockImplementationOnce(() => vi.fn() as any)
			.mockImplementationOnce(() => vi.fn() as any);

		const { container } = render(
			<FileUpload
				agentId={"agent-1"}
				onUploadError={onError}
				maxSize={0.000001}
			/>,
		);

		const input = container.querySelector("#file-upload") as HTMLInputElement;
		const file = new File(["hello"], "doc.txt", { type: "text/plain" });

		await user.upload(input, file);

		await waitFor(() => expect(onError).toHaveBeenCalled());
		expect(onError.mock.calls[0][0]).toMatch(/File size must be less than/i);
	});
});
