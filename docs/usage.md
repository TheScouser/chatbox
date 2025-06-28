# Usage Dashboard Requirements

## Overview
Build a comprehensive usage dashboard that allows users to monitor their credit consumption, agent usage, and usage patterns over time. The dashboard should provide both high-level metrics and detailed breakdowns.

## Layout & Navigation

### Header Navigation
- Display three main tabs: **Agents**, **Usage** (active), **Settings**
- Usage tab should be highlighted/active when on this page
- Tabs should be clickable and navigate to respective sections

### Page Title
- Display "Usage" as the main page heading
- Should be prominent and clearly visible

## Core Components

### 1. Usage Overview Cards (Top Section)

#### Credits Usage Card
- **Visual**: Circular progress indicator (donut chart)
- **Primary Metric**: Display current credits used vs. total available
  - Format: "X / Y" (e.g., "3 / 100")
  - Large, prominent font for the numbers
- **Label**: "Credits used" below the metric
- **Progress Visual**: 
  - Circular progress ring showing percentage used
  - Should use appropriate color coding (e.g., blue for normal usage)
  - Ring should be partially filled based on usage percentage

#### Agents Usage Card
- **Visual**: Circular progress indicator (donut chart)
- **Primary Metric**: Display current agents used vs. total allowed
  - Format: "X / Y" (e.g., "1 / 1")
  - Large, prominent font for the numbers
- **Label**: "Agents used" below the metric
- **Progress Visual**:
  - Circular progress ring showing percentage used
  - Should use appropriate color coding
  - Ring should be partially filled based on usage percentage

### 2. Date Range Selector
- **Position**: Top right of the usage section
- **Default Range**: Display current date range (e.g., "Jun 01, 2025 - Jun 28, 2025")
- **Functionality**: 
  - Clickable date picker/selector
  - Should allow users to select custom date ranges
  - Should have common presets (Last 7 days, Last 30 days, Last 90 days, etc.)
- **Visual**: Calendar icon with date range text

### 3. Agent Filter Dropdown
- **Position**: Top left, next to date range selector
- **Default**: "All agents"
- **Functionality**:
  - Dropdown menu to filter usage by specific agents
  - Should list all available agents
  - "All agents" option to show combined usage
- **Visual**: Dropdown arrow indicator

### 4. Usage History Chart

#### Chart Type & Layout
- **Chart Type**: Vertical bar chart
- **Title**: "Usage history"
- **Position**: Left side of the lower section

#### Chart Features
- **X-Axis**: Time periods (days/weeks based on selected range)
  - Show dates (e.g., "Jun 1", "Jun 3", "Jun 5", etc.)
  - Appropriate spacing and labeling
- **Y-Axis**: Usage amount (credits consumed)
  - Should auto-scale based on data range
- **Bars**: 
  - Blue colored bars (#3b82f6 or similar)
  - Should show usage for each time period
  - Bars should have subtle rounded corners
- **Interactivity**:
  - Hover tooltips showing exact values
  - Click to drill down (optional)

#### Data Requirements
- Should aggregate usage data by time period
- Handle different time granularities (daily, weekly, monthly)
- Show zero usage as empty/minimal bars

### 5. Credits Used Per Agent

#### Chart Type & Layout
- **Chart Type**: Pie chart (donut style)
- **Title**: "Credits used per agent"
- **Position**: Right side of the lower section

#### Chart Features
- **Visual Style**: Donut/pie chart with distinct colors for each agent
- **Legend**: 
  - List agents with color indicators
  - Show agent name/identifier
  - Display exact credit usage count
  - Include timestamp of last usage (e.g., "Agent 5/13/2025, 7:32:50 PM")
- **Colors**: Use distinct, accessible colors for each agent slice

#### Data Requirements
- Show breakdown of credit usage by individual agents
- Display exact usage numbers
- Include timestamps for context
- Handle cases with many agents (scrollable legend, etc.)

## Responsive Design Requirements

### Desktop Layout
- Two-column layout for overview cards at top
- Two-column layout for charts at bottom
- Adequate spacing and padding

### Tablet Layout
- Stack overview cards vertically if needed
- Maintain chart visibility and interaction
- Adjust chart sizes appropriately

### Mobile Layout
- Single column layout
- Stack all components vertically
- Ensure charts remain readable and interactive
- Consider horizontal scrolling for time-based charts

## Data Integration Requirements

### API Endpoints Needed
- `/api/usage/overview` - Get current usage summary
- `/api/usage/history` - Get usage history for date range
- `/api/usage/by-agent` - Get usage breakdown by agent
- `/api/agents` - Get list of available agents for filtering

### Data Models

#### Usage Overview
```typescript
interface UsageOverview {
  creditsUsed: number;
  creditsLimit: number;
  agentsUsed: number;
  agentsLimit: number;
}
```

#### Usage History
```typescript
interface UsageHistoryPoint {
  date: string; // ISO date
  creditsUsed: number;
}

interface UsageHistory {
  data: UsageHistoryPoint[];
  dateRange: {
    start: string;
    end: string;
  };
}
```

#### Agent Usage
```typescript
interface AgentUsage {
  agentId: string;
  agentName: string;
  creditsUsed: number;
  lastUsed: string; // ISO timestamp
}

interface AgentUsageBreakdown {
  agents: AgentUsage[];
  totalCredits: number;
}
```
