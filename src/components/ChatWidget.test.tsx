import { describe, expect, it, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import ChatWidget from './ChatWidget'
import { renderWithProviders } from '@/test/render'
import { useQuery, useAction } from 'convex/react'

vi.mock('convex/react')

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows empty state and uses agent name in placeholder', async () => {
    // First useQuery call -> agent, second -> messages undefined (skip)
    vi.mocked(useQuery).mockImplementationOnce(() => ({
      _id: 'test-agent-id' as any,
      name: 'Test Agent',
      description: 'Assistant for testing',
      organizationId: 'org-1' as any,
    }) as any)
    vi.mocked(useQuery).mockImplementationOnce(() => undefined as any)

    renderWithProviders(
      <ChatWidget agentId={'test-agent-id' as any} />,
    )

    expect(
      await screen.findByText('Start a conversation'),
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Message Test Agent...'),
    ).toBeInTheDocument()
  })

  it('disables send button when input is empty', async () => {
    vi.mocked(useQuery).mockImplementationOnce(() => ({ name: 'Agent' }) as any)
    vi.mocked(useQuery).mockImplementationOnce(() => undefined as any)

    renderWithProviders(<ChatWidget agentId={'a1' as any} />)

    const sendButton = screen.getByRole('button')
    expect(sendButton).toBeDisabled()
  })

  it.skip('creates a conversation and generates AI response on send', async () => {
    const user = userEvent.setup()

    // Agent + no messages yet
    vi.mocked(useQuery).mockImplementationOnce(() => ({ name: 'Agent' }) as any)
    vi.mocked(useQuery).mockImplementationOnce(() => undefined as any)

    const startConversation = vi.fn(async () => ({ conversationId: 'conv-1' as any }))
    const generateAIResponse = vi.fn(async () => ({ messageId: 'msg-1' as any, content: 'Hello!' }))
    // ChatWidget calls useAction twice in order
    let callIndex = 0
    vi.mocked(useAction).mockImplementation(() => {
      const fn = callIndex++ === 0 ? startConversation : generateAIResponse
      return fn as any
    })

    renderWithProviders(
      <ChatWidget agentId={'agent-1' as any} onConversationCreate={vi.fn()} />,
    )

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Hi there' } })
    const send = screen.getByRole('button')
    expect(send).toBeEnabled()

    await user.click(send)

    await waitFor(() => expect(startConversation).toHaveBeenCalledWith({
      agentId: 'agent-1',
      initialMessage: 'Hi there',
    }))
    await waitFor(() => expect(generateAIResponse).toHaveBeenCalledWith({
      conversationId: 'conv-1',
      userMessage: 'Hi there',
    }))

    // Input clears after send
    expect((input as HTMLInputElement).value).toBe('')
  })
})


