import { createFileRoute } from "@tanstack/react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { ExternalLink, Globe } from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export const Route = createFileRoute(
	"/dashboard/agents/$agentId/knowledge/url",
)({
	component: AgentKnowledgeUrl,
});

function AgentKnowledgeUrl() {
	const { agentId } = Route.useParams();
	const [url, setUrl] = useState("");
	const [urlTitle, setUrlTitle] = useState("");
	const [isProcessingUrl, setIsProcessingUrl] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	// Queries and actions
	const knowledgeEntries = useQuery(api.knowledge.getKnowledgeForAgent, {
		agentId: agentId as any,
	});
	const processUrl = useAction(api.webCrawling.processUrlContent);
	const deleteKnowledgeEntry = useMutation(api.knowledge.deleteKnowledgeEntry);

	// Filter for URL entries only
	const urlEntries =
		knowledgeEntries?.filter((entry) => entry.source === "url") || [];

	const handleUrlSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!url.trim()) return;

		setIsProcessingUrl(true);
		setError(null);
		setSuccess(false);

		try {
			await processUrl({
				agentId: agentId as any,
				url: url.trim(),
				title: urlTitle.trim() || undefined,
			});

			// Reset form and show success
			setUrl("");
			setUrlTitle("");
			setSuccess(true);

			// Clear success message after 3 seconds
			setTimeout(() => setSuccess(false), 3000);
		} catch (error) {
			console.error("Error processing URL:", error);
			setError(
				error instanceof Error ? error.message : "Failed to process URL",
			);
		} finally {
			setIsProcessingUrl(false);
		}
	};

	const handleDelete = async (entryId: string) => {
		if (!confirm("Are you sure you want to delete this URL entry?")) return;

		try {
			await deleteKnowledgeEntry({ entryId: entryId as any });
		} catch (error) {
			console.error("Error deleting URL entry:", error);
			setError(
				error instanceof Error ? error.message : "Failed to delete URL entry",
			);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Website Content</h1>
				<p className="mt-1 text-sm text-gray-500">
					Add content from websites by providing URLs. The content will be
					automatically extracted and added to your knowledge base.
				</p>
			</div>

			{/* Error/Success Messages */}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-md p-4">
					<p className="text-sm text-red-600">{error}</p>
				</div>
			)}

			{success && (
				<div className="bg-green-50 border border-green-200 rounded-md p-4">
					<p className="text-sm text-green-600">
						URL content processed successfully!
					</p>
				</div>
			)}

			{/* Side-by-side layout */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
				{/* Left side - URL Form */}
				<div className="bg-white shadow rounded-lg">
					<div className="p-6">
						<h3 className="text-lg font-medium text-gray-900 flex items-center">
							<Globe className="h-5 w-5 mr-2" />
							Add Content from URL
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							Enter a webpage URL to automatically extract and add its content
							to your knowledge base.
						</p>
					</div>
					<form
						onSubmit={handleUrlSubmit}
						className="p-6 border-t border-gray-200 space-y-6"
					>
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<div className="flex items-start">
								<Globe className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
								<div>
									<h4 className="text-sm font-medium text-blue-800">
										How it works
									</h4>
									<p className="text-sm text-blue-700 mt-1">
										Enter a webpage URL to automatically extract and add its
										content to your knowledge base. The system will fetch the
										page content, extract the text, and make it searchable for
										your AI agent.
									</p>
								</div>
							</div>
						</div>

						<div>
							<label
								htmlFor="url"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Website URL
							</label>
							<Input
								type="url"
								id="url"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
								placeholder="https://example.com/page"
								required
							/>
							<p className="mt-1 text-sm text-gray-500">
								Enter the full URL including https:// or http://
							</p>
						</div>

						<div>
							<label
								htmlFor="urlTitle"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Custom Title (Optional)
							</label>
							<Input
								type="text"
								id="urlTitle"
								value={urlTitle}
								onChange={(e) => setUrlTitle(e.target.value)}
								placeholder="Leave blank to use the page title"
							/>
							<p className="mt-1 text-sm text-gray-500">
								If left blank, the page title will be used automatically
							</p>
						</div>

						<div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setUrl("");
									setUrlTitle("");
								}}
							>
								Clear
							</Button>
							<Button type="submit" disabled={isProcessingUrl || !url.trim()}>
								{isProcessingUrl ? "Processing..." : "Add from URL"}
							</Button>
						</div>
					</form>
				</div>

				{/* Right side - Existing URL Entries */}
				<div className="bg-white shadow rounded-lg">
					<div className="p-6">
						<h3 className="text-lg font-medium text-gray-900">
							Added Website Content
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							{urlEntries.length} website entries in your knowledge base
						</p>
					</div>
					{urlEntries.length === 0 ? (
						<div className="p-6 border-t border-gray-200 text-center">
							<Globe className="mx-auto h-12 w-12 text-gray-400" />
							<h3 className="mt-2 text-sm font-medium text-gray-900">
								No website content yet
							</h3>
							<p className="mt-1 text-sm text-gray-500">
								Add your first website content using the form.
							</p>
						</div>
					) : (
						<div className="border-t border-gray-200">
							<div className="divide-y divide-gray-200">
								{urlEntries.map((entry) => (
									<div key={entry._id} className="p-6">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<h4 className="text-sm font-medium text-gray-900 flex items-center">
													<ExternalLink className="h-4 w-4 mr-2" />
													{entry.title || "Untitled URL"}
												</h4>
												{entry.sourceMetadata?.url && (
													<p className="mt-1 text-sm text-blue-600 hover:text-blue-800">
														<a
															href={entry.sourceMetadata.url}
															target="_blank"
															rel="noopener noreferrer"
															className="hover:underline"
														>
															{entry.sourceMetadata.url}
														</a>
													</p>
												)}
												<div
													className="mt-2 text-sm text-gray-600"
													dangerouslySetInnerHTML={{
														__html:
															entry.content.length > 200
																? entry.content.substring(0, 200) + "..."
																: entry.content,
													}}
												/>
												<div className="mt-2 text-xs text-gray-500">
													Added{" "}
													{new Date(entry._creationTime).toLocaleDateString()}
												</div>
											</div>
											<div className="flex items-center space-x-2 ml-4">
												{entry.sourceMetadata?.url && (
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															window.open(entry.sourceMetadata.url, "_blank")
														}
													>
														Visit
													</Button>
												)}
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleDelete(entry._id)}
													className="text-red-600 hover:text-red-700"
												>
													Delete
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
