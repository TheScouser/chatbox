import { render } from '@testing-library/react'
import type React from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'

export function renderWithProviders(ui: React.ReactElement, options?: Parameters<typeof render>[1]) {
  return render(<ThemeProvider>{ui}</ThemeProvider>, options)
}


