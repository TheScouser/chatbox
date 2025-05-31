import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import RichTextEditor from "../components/RichTextEditor";

export const Route = createFileRoute("/demo/rich-text")({
	component: RichTextDemo,
});

function RichTextDemo() {
	const [content, setContent] = useState(
		"<p>Welcome to the rich text editor! Try formatting this text.</p>",
	);

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="bg-white rounded-lg shadow p-6">
					<h1 className="text-2xl font-bold text-gray-900 mb-6">
						Rich Text Editor Demo
					</h1>

					<div className="space-y-6">
						<div>
							<h2 className="text-lg font-medium text-gray-900 mb-4">Editor</h2>
							<RichTextEditor
								content={content}
								onChange={setContent}
								placeholder="Start typing to test the rich text editor..."
							/>
						</div>

						<div>
							<h2 className="text-lg font-medium text-gray-900 mb-4">
								HTML Output
							</h2>
							<div className="bg-gray-100 p-4 rounded-lg">
								<pre className="text-sm text-gray-800 whitespace-pre-wrap">
									{content}
								</pre>
							</div>
						</div>

						<div>
							<h2 className="text-lg font-medium text-gray-900 mb-4">
								Rendered Output
							</h2>
							<div
								className="prose prose-sm max-w-none border border-gray-200 rounded-lg p-4"
								dangerouslySetInnerHTML={{ __html: content }}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
