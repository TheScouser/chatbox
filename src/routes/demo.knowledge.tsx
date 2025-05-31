import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/demo/knowledge")({
	component: KnowledgeDemo,
});

function KnowledgeDemo() {
	const agents = useQuery(api.agents.getAgentsForUser);
	const firstAgent = agents?.[0];

	return (
		<Authenticated>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4">
					<div className="bg-white rounded-lg shadow p-6">
						<h1 className="text-2xl font-bold text-gray-900 mb-6">
							Knowledge Base Demo
						</h1>

						{!firstAgent ? (
							<div className="text-center py-8">
								<p className="text-gray-600">
									You need to create an agent first to test the knowledge base.
								</p>
								<a
									href="/dashboard/agents/new"
									className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
								>
									Create Agent
								</a>
							</div>
						) : (
							<div>
								<p className="text-gray-600 mb-4">
									Testing knowledge base functionality with agent:{" "}
									<strong>{firstAgent.name}</strong>
								</p>
								<a
									href={`/dashboard/agents/${firstAgent._id}`}
									className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
								>
									Go to Agent Knowledge Base
								</a>
							</div>
						)}

						<div className="mt-8 pt-8 border-t border-gray-200">
							<h2 className="text-lg font-medium text-gray-900 mb-4">
								Phase 4 Completed Features
							</h2>
							<ul className="space-y-2 text-sm text-gray-600">
								<li className="flex items-center">
									<span className="text-green-500 mr-2">✓</span>
									Task 4.1: Rich Text Editor Integration
								</li>
								<li className="flex items-center">
									<span className="text-green-500 mr-2">✓</span>
									Task 4.2: Knowledge Entry Form
								</li>
								<li className="flex items-center">
									<span className="text-green-500 mr-2">✓</span>
									Task 4.3: Display Knowledge Entries List
								</li>
								<li className="flex items-center">
									<span className="text-green-500 mr-2">✓</span>
									Task 4.4: Edit Knowledge Entries
								</li>
								<li className="flex items-center">
									<span className="text-green-500 mr-2">✓</span>
									Task 4.5: Delete Knowledge Entries
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</Authenticated>
	);
}
