import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import { useAction } from "convex/react";
import {
	AlertCircle,
	CheckCircle,
	ExternalLink,
	FileText,
	Globe,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/demo/web-crawling")({
	component: WebCrawlingDemo,
});

function WebCrawlingDemo() {
	const [url, setUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	const fetchUrlContent = useAction(api.webCrawling.fetchUrlContent);

	const handleFetchUrl = async () => {
		if (!url.trim()) return;

		setIsLoading(true);
		setError(null);
		setResult(null);

		try {
			const data = await fetchUrlContent({ url: url.trim() });
			setResult(data);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to fetch URL content",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const exampleUrls = [
		"https://docs.convex.dev/",
		"https://www.wikipedia.org/",
		"https://github.com/get-convex/convex-js",
		"https://tailwindcss.com/docs",
	];

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="space-y-8">
				{/* Header */}
				<div className="text-center">
					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						Web Crawling Demo
					</h1>
					<p className="text-lg text-gray-600">
						Test URL content extraction and see how web pages are processed for
						knowledge bases
					</p>
				</div>

				{/* URL Input */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Globe className="h-5 w-5 text-blue-600" />
							URL Content Fetcher
						</CardTitle>
						<CardDescription>
							Enter a URL to extract and preview its text content
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-2">
							<Input
								type="url"
								placeholder="https://example.com"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
								className="flex-1"
							/>
							<Button
								onClick={handleFetchUrl}
								disabled={isLoading || !url.trim()}
								className="min-w-[120px]"
							>
								{isLoading ? "Fetching..." : "Fetch Content"}
							</Button>
						</div>

						{/* Example URLs */}
						<div>
							<p className="text-sm text-gray-600 mb-2">
								Try these example URLs:
							</p>
							<div className="flex flex-wrap gap-2">
								{exampleUrls.map((exampleUrl) => (
									<button
										key={exampleUrl}
										onClick={() => setUrl(exampleUrl)}
										className="text-sm text-blue-600 hover:text-blue-800 underline"
									>
										{new URL(exampleUrl).hostname}
									</button>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Error Display */}
				{error && (
					<Card className="border-red-200 bg-red-50">
						<CardContent className="pt-6">
							<div className="flex items-start gap-3">
								<AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
								<div>
									<h3 className="text-sm font-medium text-red-800">
										Error fetching content
									</h3>
									<p className="text-sm text-red-700 mt-1">{error}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Results Display */}
				{result && (
					<div className="space-y-6">
						{/* Success Message */}
						<Card className="border-green-200 bg-green-50">
							<CardContent className="pt-6">
								<div className="flex items-start gap-3">
									<CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
									<div>
										<h3 className="text-sm font-medium text-green-800">
											Content extracted successfully
										</h3>
										<p className="text-sm text-green-700 mt-1">
											{result.contentLength.toLocaleString()} characters
											extracted from {result.url}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Metadata */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Page Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-gray-700">
											Title
										</label>
										<p className="text-sm text-gray-900 mt-1">{result.title}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">
											URL
										</label>
										<div className="flex items-center gap-2 mt-1">
											<p className="text-sm text-gray-900 truncate">
												{result.url}
											</p>
											<a
												href={result.url}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:text-blue-800"
											>
												<ExternalLink className="h-4 w-4" />
											</a>
										</div>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">
											Content Length
										</label>
										<p className="text-sm text-gray-900 mt-1">
											{result.contentLength.toLocaleString()} characters
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">
											Fetched At
										</label>
										<p className="text-sm text-gray-900 mt-1">
											{new Date(result.fetchedAt).toLocaleString()}
										</p>
									</div>
								</div>
								{result.description && (
									<div>
										<label className="text-sm font-medium text-gray-700">
											Description
										</label>
										<p className="text-sm text-gray-900 mt-1">
											{result.description}
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Content Preview */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5" />
									Extracted Content Preview
								</CardTitle>
								<CardDescription>
									First 2000 characters of the extracted text content
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
									<pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
										{result.content.substring(0, 2000)}
										{result.content.length > 2000 && "..."}
									</pre>
								</div>
								{result.content.length > 2000 && (
									<p className="text-sm text-gray-500 mt-2">
										Showing first 2000 of{" "}
										{result.contentLength.toLocaleString()} characters
									</p>
								)}
							</CardContent>
						</Card>
					</div>
				)}

				{/* Instructions */}
				<Card>
					<CardHeader>
						<CardTitle>How it works</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-gray-600">
						<div>
							<strong>1. URL Validation:</strong> The system validates the URL
							format and ensures it uses HTTP/HTTPS protocol.
						</div>
						<div>
							<strong>2. Content Fetching:</strong> The page is fetched with
							appropriate headers and a 30-second timeout.
						</div>
						<div>
							<strong>3. HTML Processing:</strong> Script and style tags are
							removed, HTML tags are stripped, and entities are decoded.
						</div>
						<div>
							<strong>4. Text Extraction:</strong> Clean text content is
							extracted along with the page title and meta description.
						</div>
						<div>
							<strong>5. Validation:</strong> The system ensures sufficient
							content (minimum 50 characters) was extracted.
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
