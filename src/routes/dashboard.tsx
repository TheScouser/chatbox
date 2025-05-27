import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Authenticated } from 'convex/react'
import DashboardLayout from '../components/DashboardLayout'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <Authenticated>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </Authenticated>
  )
} 