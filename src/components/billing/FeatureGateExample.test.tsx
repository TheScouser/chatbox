import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { FeatureGate } from './FeatureGateExample'
import { renderWithProviders } from '@/test/render'
import { useQuery } from 'convex/react'

vi.mock('convex/react')

describe('FeatureGate', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders fallback when access is denied', async () => {
    // Hook returns access object with hasAccess false
    vi.mocked(useQuery).mockImplementationOnce(() => ({
      hasAccess: false,
      suggestedPlan: 'Pro',
    }) as any)

    renderWithProviders(
      <FeatureGate feature="custom_domains">
        <div>Hidden Content</div>
      </FeatureGate>,
    )

    expect(await screen.findByText('Premium Feature')).toBeInTheDocument()
    expect(screen.getByText('Upgrade to Pro plan to unlock this feature')).toBeInTheDocument()
  })

  it('renders children when access is allowed', async () => {
    vi.mocked(useQuery).mockImplementationOnce(() => ({
      hasAccess: true,
    }) as any)

    renderWithProviders(
      <FeatureGate feature="advanced_analytics">
        <div>Visible Content</div>
      </FeatureGate>,
    )

    expect(await screen.findByText('Visible Content')).toBeInTheDocument()
  })
})


