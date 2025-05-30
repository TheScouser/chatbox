import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, Zap, Database } from 'lucide-react'

export const Route = createFileRoute('/demo/vector-search')({
  component: VectorSearchDemo,
})

function VectorSearchDemo() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Get user's agents
  const agents = useQuery(api.agents.getAgentsForUser)
  
  // Get knowledge stats for selected agent
  const knowledgeStats = useQuery(
    api.vectorSearch.getKnowledgeStats,
    selectedAgentId ? { agentId: selectedAgentId as any } : 'skip'
  )

  // Actions (not mutations!)
  const generateEmbeddings = useAction(api.embeddings.generateEmbeddingsForAgent)
  const generateAllEmbeddings = useAction(api.embeddings.generateAllEmbeddings)
  const semanticSearch = useAction(api.vectorSearch.semanticSearch)
  
  // This is a query, so we'll call it directly in the handler
  const textSearchQuery = api.vectorSearch.searchKnowledge

  const handleGenerateEmbeddings = async () => {
    if (!selectedAgentId) return
    
    try {
      const result = await generateEmbeddings({ agentId: selectedAgentId as any })
      alert(`Success: ${result.message}`)
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  const handleGenerateAllEmbeddings = async () => {
    try {
      const result = await generateAllEmbeddings({})
      alert(`Success: ${result.message}`)
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  const handleSemanticSearch = async () => {
    if (!selectedAgentId || !searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const results = await semanticSearch({
        agentId: selectedAgentId as any,
        query: searchQuery,
        limit: 5
      })
      setSearchResults(results)
    } catch (error) {
      alert(`Error: ${error}`)
    } finally {
      setIsSearching(false)
    }
  }

  const handleTextSearch = async () => {
    if (!selectedAgentId || !searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      // For now, let's just show a message that text search is not implemented
      // In a real app, you'd want to create an action that wraps the query
      alert('Text search not implemented in this demo. Use Vector Search instead!')
      setSearchResults([])
    } catch (error) {
      alert(`Error: ${error}`)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Vector Search Demo</h1>
        <p className="text-muted-foreground">
          Test embedding generation and vector search functionality
        </p>
      </div>

      {/* Agent Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Agent Selection
          </CardTitle>
          <CardDescription>
            Choose an agent to work with
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            {agents?.map((agent) => (
              <Button
                key={agent._id}
                variant={selectedAgentId === agent._id ? "default" : "outline"}
                onClick={() => setSelectedAgentId(agent._id)}
                className="justify-start"
              >
                {agent.name}
                {agent.description && (
                  <span className="ml-2 text-muted-foreground">
                    - {agent.description}
                  </span>
                )}
              </Button>
            ))}
          </div>
          
          {!agents?.length && (
            <p className="text-muted-foreground text-center py-4">
              No agents found. Create an agent first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Knowledge Stats */}
      {selectedAgentId && knowledgeStats && (
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{knowledgeStats.totalEntries}</div>
                <div className="text-sm text-muted-foreground">Total Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {knowledgeStats.entriesWithEmbeddings}
                </div>
                <div className="text-sm text-muted-foreground">With Embeddings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {knowledgeStats.entriesNeedingEmbeddings}
                </div>
                <div className="text-sm text-muted-foreground">Need Embeddings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(knowledgeStats.embeddingProgress)}%
                </div>
                <div className="text-sm text-muted-foreground">Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Embedding Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Embedding Generation
          </CardTitle>
          <CardDescription>
            Generate embeddings for knowledge entries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateEmbeddings}
              disabled={!selectedAgentId}
              variant="outline"
            >
              Generate for Selected Agent
            </Button>
            <Button
              onClick={handleGenerateAllEmbeddings}
              variant="outline"
            >
              Generate for All Agents
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Knowledge
          </CardTitle>
          <CardDescription>
            Test both semantic (vector) and text-based search
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter your search query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSemanticSearch()}
            />
            <Button
              onClick={handleSemanticSearch}
              disabled={!selectedAgentId || !searchQuery.trim() || isSearching}
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Vector Search'}
            </Button>
            <Button
              onClick={handleTextSearch}
              disabled={!selectedAgentId || !searchQuery.trim() || isSearching}
              variant="outline"
            >
              Text Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              Found {searchResults.length} results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchResults.map((result, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {result.title || `Entry ${index + 1}`}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Score: {result._score?.toFixed(3) || 'N/A'}
                      </Badge>
                      <Badge variant="outline">
                        {result.source}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {result.content}
                  </p>
                  {result.sourceMetadata?.filename && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Source: {result.sourceMetadata.filename}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 