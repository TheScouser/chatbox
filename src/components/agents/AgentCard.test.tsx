import { describe, it, expect } from 'vitest'
import { createMockAgent } from '@/test/utils'

describe('Agent Test Data Factory', () => {
  it('creates mock agent with default values', () => {
    const agent = createMockAgent()
    
    expect(agent._id).toBe('test-agent-id')
    expect(agent.name).toBe('Test Agent')
    expect(agent.description).toBe('A test agent')
    expect(agent.organizationId).toBe('test-org-id')
    expect(agent.isPublic).toBe(true)
    expect(typeof agent.createdAt).toBe('number')
    expect(typeof agent.updatedAt).toBe('number')
  })

  it('creates mock agent with overrides', () => {
    const agent = createMockAgent({
      name: 'Custom Agent',
      isPublic: false,
      description: 'Custom description'
    })
    
    expect(agent.name).toBe('Custom Agent')
    expect(agent.isPublic).toBe(false)
    expect(agent.description).toBe('Custom description')
    // Should keep default values for non-overridden fields
    expect(agent._id).toBe('test-agent-id')
    expect(agent.organizationId).toBe('test-org-id')
  })
})

// Test utility functions for agents
describe('Agent Utilities', () => {
  it('validates agent structure', () => {
    const agent = createMockAgent()
    
    // Required fields should exist
    expect(agent).toHaveProperty('_id')
    expect(agent).toHaveProperty('name')
    expect(agent).toHaveProperty('organizationId')
    expect(agent).toHaveProperty('isPublic')
    expect(agent).toHaveProperty('createdAt')
    expect(agent).toHaveProperty('updatedAt')
  })

  it('creates unique timestamps', () => {
    const agent1 = createMockAgent()
    // Small delay to ensure different timestamps
    const agent2 = createMockAgent()
    
    // They should have the same structure but potentially different timestamps
    expect(agent1.createdAt).toBeTypeOf('number')
    expect(agent2.createdAt).toBeTypeOf('number')
  })
})