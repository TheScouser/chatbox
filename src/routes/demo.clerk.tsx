import { createFileRoute } from '@tanstack/react-router'
import { SignInButton, UserButton } from '@clerk/clerk-react'
import { Authenticated, Unauthenticated, AuthLoading, useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/demo/clerk')({
  component: App,
})

function App() {
  return (
    <div className="p-4">
      <Unauthenticated>
        <div>
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <SignInButton />
        </div>
      </Unauthenticated>
      <Authenticated>
        <div>
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold">Authenticated Content</h1>
            <UserButton />
          </div>
          <Content />
        </div>
      </Authenticated>
      <AuthLoading>
        <div>Loading authentication...</div>
      </AuthLoading>
    </div>
  )
}

function Content() {
  const currentUser = useQuery(api.users.getCurrentUser)
  const createUser = useMutation(api.users.createUser)
  const agents = useQuery(api.agents.getAgentsForUser)
  const createAgent = useMutation(api.agents.createAgent)
  const createKnowledgeEntry = useMutation(api.knowledge.createKnowledgeEntry)
  
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const knowledgeEntries = useQuery(
    api.knowledge.getKnowledgeForAgent, 
    selectedAgentId ? { agentId: selectedAgentId as any } : "skip"
  )
  
  // Automatically create user record on first login
  useEffect(() => {
    if (currentUser && !currentUser.dbUser) {
      createUser()
    }
  }, [currentUser, createUser])
  
  // Auto-select first agent when agents load
  useEffect(() => {
    if (agents && agents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(agents[0]._id)
    }
  }, [agents, selectedAgentId])
  
  const handleCreateAgent = () => {
    createAgent({
      name: `Test Agent ${Date.now()}`,
      description: "A test agent created from the demo page"
    })
  }
  
  const handleCreateKnowledge = () => {
    if (!selectedAgentId) return
    
    createKnowledgeEntry({
      agentId: selectedAgentId as any,
      content: `This is sample knowledge content created at ${new Date().toLocaleString()}. This could be information about products, services, or any other relevant data for the AI agent.`,
      source: "text",
      sourceMetadata: {
        filename: undefined,
        url: undefined,
        chunkIndex: undefined,
      }
    })
  }
  
  if (currentUser === undefined) {
    return <div>Loading user data...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Current User from Convex:</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Clerk ID:</strong> {currentUser.id}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p><strong>Name:</strong> {currentUser.name}</p>
          <p><strong>Database User:</strong> {currentUser.dbUser ? '✅ Created' : '🔄 Creating...'}</p>
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold">Agents:</h2>
        <div className="bg-blue-50 p-4 rounded">
          <div className="flex items-center gap-4 mb-3">
            <span><strong>Count:</strong> {agents?.length || 0}</span>
            <button 
              onClick={handleCreateAgent}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Test Agent
            </button>
          </div>
          {agents && agents.length > 0 ? (
            <div className="space-y-2">
              {agents.map((agent) => (
                <div 
                  key={agent._id} 
                  className={`bg-white p-3 rounded border cursor-pointer ${
                    selectedAgentId === agent._id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAgentId(agent._id)}
                >
                  <p><strong>Name:</strong> {agent.name}</p>
                  <p><strong>Description:</strong> {agent.description || 'No description'}</p>
                  <p><strong>Created:</strong> {new Date(agent._creationTime).toLocaleString()}</p>
                  {selectedAgentId === agent._id && (
                    <p className="text-blue-600 text-sm mt-1">✓ Selected for knowledge testing</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No agents created yet. Click the button to create one!</p>
          )}
        </div>
      </div>
      
      {selectedAgentId && (
        <div>
          <h2 className="text-lg font-semibold">Knowledge Entries:</h2>
          <div className="bg-green-50 p-4 rounded">
            <div className="flex items-center gap-4 mb-3">
              <span><strong>Count:</strong> {knowledgeEntries?.length || 0}</span>
              <button 
                onClick={handleCreateKnowledge}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Add Test Knowledge
              </button>
            </div>
            {knowledgeEntries && knowledgeEntries.length > 0 ? (
              <div className="space-y-2">
                {knowledgeEntries.map((entry) => (
                  <div key={entry._id} className="bg-white p-3 rounded border">
                    <p><strong>Source:</strong> {entry.source}</p>
                    <p><strong>Content:</strong> {entry.content.substring(0, 100)}...</p>
                    <p><strong>Created:</strong> {new Date(entry._creationTime).toLocaleString()}</p>
                    <p><strong>Embeddings:</strong> {entry.embeddings ? '✅ Generated' : '❌ Not generated'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No knowledge entries yet. Click the button to add some!</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
