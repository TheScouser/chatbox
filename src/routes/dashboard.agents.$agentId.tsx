import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Authenticated, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import DashboardLayout from '../components/DashboardLayout'
import { useState } from 'react'
import { ArrowLeft, Bot, BookOpen, MessageSquare, Settings, Globe } from 'lucide-react'

export const Route = createFileRoute('/dashboard/agents/$agentId')({
  component: AgentDetail,
})

function AgentDetail() {
  const navigate = useNavigate()
  const { agentId } = Route.useParams()
  
  // For now, we'll use a placeholder since we can't query by ID easily
  // In a real implementation, we'd have a getAgentById query
  const agents = useQuery(api.agents.getAgentsForUser)
  const agent = agents?.find(a => a._id === agentId)
  
  const [activeTab, setActiveTab] = useState<'overview' | 'knowledge' | 'conversations' | 'settings' | 'deploy'>('overview')

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Bot },
    { id: 'knowledge', name: 'Knowledge Base', icon: BookOpen },
    { id: 'conversations', name: 'Conversations', icon: MessageSquare },
    { id: 'deploy', name: 'Deploy', icon: Globe },
    { id: 'settings', name: 'Settings', icon: Settings },
  ] as const

  if (agents === undefined) {
    return (
      <Authenticated>
        <DashboardLayout>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </DashboardLayout>
      </Authenticated>
    )
  }

  if (!agent) {
    return (
      <Authenticated>
        <DashboardLayout>
          <div className="text-center py-12">
            <Bot className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Agent not found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The agent you're looking for doesn't exist or you don't have access to it.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate({ to: '/dashboard/agents' })}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Agents
              </button>
            </div>
          </div>
        </DashboardLayout>
      </Authenticated>
    )
  }

  return (
    <Authenticated>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate({ to: '/dashboard/agents' })}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Agents
              </button>
            </div>
          </div>

          {/* Agent Header */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Bot className="h-7 w-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {agent.description || 'No description provided'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created {new Date(agent._creationTime).toLocaleDateString()} • 
                    Last updated {new Date(agent._creationTime).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon
                        className={`mr-2 h-5 w-5 ${
                          activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <BookOpen className="h-8 w-8 text-blue-500" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Knowledge Entries</p>
                          <p className="text-2xl font-semibold text-gray-900">0</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <MessageSquare className="h-8 w-8 text-green-500" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Conversations</p>
                          <p className="text-2xl font-semibold text-gray-900">0</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Globe className="h-8 w-8 text-purple-500" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Deployments</p>
                          <p className="text-2xl font-semibold text-gray-900">0</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <button
                        onClick={() => setActiveTab('knowledge')}
                        className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <BookOpen className="h-6 w-6 text-blue-500 mb-2" />
                        <h4 className="font-medium text-gray-900">Add Knowledge</h4>
                        <p className="text-sm text-gray-600">Upload documents or add text content</p>
                      </button>
                      <button
                        onClick={() => setActiveTab('deploy')}
                        className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <Globe className="h-6 w-6 text-purple-500 mb-2" />
                        <h4 className="font-medium text-gray-900">Deploy Agent</h4>
                        <p className="text-sm text-gray-600">Get embed code for your website</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'knowledge' && (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No knowledge entries yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start by adding some knowledge to train your agent.
                  </p>
                  <div className="mt-6">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      Add Knowledge
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'conversations' && (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Conversations will appear here once users start chatting with your agent.
                  </p>
                </div>
              )}

              {activeTab === 'deploy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Embed Your Agent</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Copy the code below to embed this agent on your website.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <code className="text-sm text-gray-800">
                      {`<iframe src="https://your-domain.com/chat/${agent._id}" width="400" height="600"></iframe>`}
                    </code>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Copy Embed Code
                  </button>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Agent Settings</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Configure your agent's behavior and appearance.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600">Settings panel coming soon...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </Authenticated>
  )
} 