# Testing Guide: Widget Designer (Phase 2)

This guide will help you test the Widget Designer implementation.

## Prerequisites

1. **Convex Backend Running**
   ```bash
   npx convex dev
   ```
   This should be running in a separate terminal. It will:
   - Deploy your schema changes
   - Sync your Convex functions
   - Provide real-time database access

2. **Frontend Development Server**
   ```bash
   npm run dev
   # or
   bunx --bun run start
   ```
   Frontend will be available at `http://localhost:3000`

3. **Authentication Setup**
   - Make sure Clerk is configured (check `.env.local` for `VITE_CLERK_PUBLISHABLE_KEY`)
   - You need to be logged in to access the dashboard

4. **Have an Agent Created**
   - Navigate to `/dashboard/agents`
   - Create a new agent if you don't have one
   - Note the agent ID from the URL

## Testing Steps

### 1. Access Widget Designer

**URL Pattern:** `/dashboard/agents/{agentId}/widget`

**Steps:**
1. Log in to the application
2. Navigate to `/dashboard/agents`
3. Click on an agent (or create one)
4. Navigate to the widget designer:
   - Look for a "Widget" tab/link in the agent settings
   - Or directly visit: `http://localhost:3000/dashboard/agents/{your-agent-id}/widget`

**Expected Result:**
- Page loads without errors
- If no widgets exist, a default widget should be auto-created
- You should see:
  - Left panel: Settings tabs (Branding, Interface, Texts, Configure)
  - Right panel: Live preview of the widget

### 2. Test Widget Creation

**Steps:**
1. Click the "New" button in the header
2. A new widget should be created named "New Widget"

**Expected Result:**
- New widget appears in the dropdown
- Widget is selected automatically
- Preview updates to show the new widget

### 3. Test Branding Tab

**Steps:**
1. Click on the "Branding" tab
2. Test each field:

   **Logo Upload:**
   - Click "Click to upload" or drag & drop an image
   - Upload a JPG/PNG/WEBP/GIF file (< 1MB)
   - Preview should appear

   **Colors:**
   - Change primary color using color picker
   - Change foreground color
   - Preview should update immediately

   **Header Icon:**
   - Toggle "Show icon" on/off
   - Toggle "Circular shape" on/off
   - Preview header should reflect changes

   **Bot Avatar:**
   - Toggle "Circular shape"
   - Switch between "Logo" and "Custom"
   - If "Custom" selected, upload an avatar image

**Expected Result:**
- All changes reflect in the preview panel immediately
- Save button becomes enabled (shows "dirty" state)
- No console errors

### 4. Test Interface Tab

**Steps:**
1. Click on the "Interface" tab
2. Test each setting:

   **Position:**
   - Switch between "Bottom Right" and "Bottom Left"
   - Preview should show widget in different position

   **Offset:**
   - Adjust Offset X slider (0-100px)
   - Adjust Offset Y slider (0-100px)
   - Preview should move accordingly

   **Size:**
   - Change Width (300px, 350px, 400px, 450px)
   - Change Height (400px, 450px, 500px, 550px, 600px)
   - Preview should resize

**Expected Result:**
- Preview updates in real-time
- All values persist when switching tabs
- Save button enabled

### 5. Test Texts Tab

**Steps:**
1. Click on the "Texts" tab
2. Test each field:

   **Header Title:**
   - Change the header title
   - Preview header should update

   **Input Placeholder:**
   - Change placeholder text
   - Preview input should show new placeholder

   **Greeting Messages:**
   - Click "Add Message"
   - Select type (Text/Image/Video)
   - Enter content
   - Add multiple messages
   - Remove messages using X button
   - Preview should show greeting messages

   **Quick Replies:**
   - Click "Add Quick Reply"
   - Enter text
   - Add multiple replies
   - Remove replies
   - (Note: Quick replies may not show in preview yet)

   **Footer Text:**
   - Enter footer text
   - Preview should show footer

   **Offline Message:**
   - Enter offline message text

**Expected Result:**
- All text changes reflect in preview
- Can add/remove multiple items
- Character counter works for text messages

### 6. Test Configure Tab

**Steps:**
1. Click on the "Configure" tab
2. Test each toggle:

   **General:**
   - Toggle "Hide Powered by Chatbox" (may be disabled if plan doesn't support)
   - Toggle "Display rating for AI responses"
   - Toggle "Allow users to download chat transcript" (may be disabled)

   **Voice Input:**
   - Toggle "Enable"
   - If enabled, set max duration (5-120 seconds)

   **AI Response Sources:**
   - Toggle "Enable" to show knowledge sources

   **Hovering Message:**
   - Toggle "Enable on desktop"
   - Toggle "Enable on mobile"

   **Auto-open Chat:**
   - Toggle "Enable"
   - If enabled, set delay (0-60 seconds)

**Expected Result:**
- All toggles work
- Conditional fields appear when parent toggle is on
- Feature-gated options show upgrade prompts if disabled

### 7. Test Save Functionality

**Steps:**
1. Make changes across multiple tabs
2. Click "Save" button
3. Refresh the page
4. Verify changes persisted

**Expected Result:**
- Save button disabled after successful save
- Changes persist after page refresh
- No console errors

### 8. Test Widget Selector

**Steps:**
1. Create multiple widgets (click "New" multiple times)
2. Use dropdown to switch between widgets
3. Each widget should have its own configuration

**Expected Result:**
- Can switch between widgets
- Each widget maintains its own settings
- Preview updates when switching widgets

### 9. Test Embed Route

**Steps:**
1. Note your agent ID and a widget ID (from widget designer)
2. Test embed URLs:

   **Default Widget:**
   ```
   http://localhost:3000/embed/{agentId}
   ```

   **Specific Widget:**
   ```
   http://localhost:3000/embed/{agentId}?widgetId={widgetId}
   ```

   **With Locale:**
   ```
   http://localhost:3000/embed/{agentId}?lang=es
   ```

**Expected Result:**
- Widget loads with correct configuration
- Colors match branding settings
- Texts match configured locale (or default)
- Widget displays correctly

### 10. Test Edge Cases

**Steps:**
1. **No Widgets:**
   - Delete all widgets (if delete function exists)
   - Try to access widget designer
   - Should auto-create a default widget

2. **Invalid Widget ID:**
   - Try embed route with invalid widgetId
   - Should fall back to default widget

3. **File Upload Limits:**
   - Try uploading file > 1MB
   - Should show error message

4. **Invalid Locale:**
   - Try embed with unsupported locale
   - Should fall back to default locale

## Troubleshooting

### Widget Designer Not Loading

**Check:**
- Convex dev server is running (`npx convex dev`)
- Schema changes are deployed (check Convex dashboard)
- Browser console for errors
- Network tab for failed API calls

### Preview Not Updating

**Check:**
- Browser console for React errors
- Local state updates (check React DevTools)
- Component re-renders

### Save Not Working

**Check:**
- Browser console for errors
- Convex dashboard for mutation errors
- Network tab for failed requests
- User permissions (need editor role)

### Embed Route Not Loading Widget Config

**Check:**
- Widget exists in database (check Convex dashboard)
- Widget is default or widgetId is correct
- Browser console for query errors
- Network tab for failed queries

## Database Verification

You can verify data in Convex Dashboard:

1. Go to `https://dashboard.convex.dev`
2. Select your deployment
3. Check tables:
   - `widgetConfigurations` - Should have widget configs
   - `widgetTexts` - Should have locale texts

## Common Issues

### Schema Not Deployed
**Solution:** Run `npx convex dev` and wait for schema sync

### Type Errors
**Solution:** Run `npm run build` to check TypeScript errors

### Missing UI Components
**Solution:** Check if all shadcn components are installed:
```bash
pnpx shadcn@latest add slider  # if missing
```

### Access Denied Errors
**Solution:** Ensure you have editor role in the organization

## Next Steps After Testing

If all tests pass:
1. ✅ Phase 2 is complete
2. Ready for Phase 3 (Multi-Language Support)
3. Consider adding:
   - Widget duplication
   - Widget deletion
   - Set default widget functionality
   - Export/import widget configs

## Quick Test Checklist

- [ ] Widget designer route loads
- [ ] Can create new widget
- [ ] Branding tab works (colors, logo, avatar)
- [ ] Interface tab works (position, size, offset)
- [ ] Texts tab works (greetings, quick replies)
- [ ] Configure tab works (all toggles)
- [ ] Preview updates in real-time
- [ ] Save functionality works
- [ ] Changes persist after refresh
- [ ] Embed route loads widget config
- [ ] Multiple widgets can be created
- [ ] Widget selector works
