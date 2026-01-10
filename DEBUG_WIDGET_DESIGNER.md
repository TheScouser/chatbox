# Debugging Widget Designer Issues

## Quick Fixes Applied

1. ✅ Fixed empty state handling - shows "Create Widget" button when no widgets exist
2. ✅ Fixed data extraction - properly separates config from texts
3. ✅ Added fallback for texts if no default locale found

## Common Issues & Solutions

### Issue 1: Page Shows Loading Spinner Forever

**Symptoms:** Widget designer page shows spinner and never loads

**Check:**
1. Open browser console (F12)
2. Look for errors in Console tab
3. Check Network tab for failed requests

**Common Causes:**
- Convex schema not deployed - Run `npx convex dev` and wait for schema sync
- Missing widget texts - Widget was created but texts weren't created
- Authentication error - Check if you're logged in

**Fix:**
```bash
# Make sure Convex is running
npx convex dev

# Check Convex dashboard for errors
# Visit: https://dashboard.convex.dev
```

### Issue 2: "Widget configuration not found" Error

**Symptoms:** Error message appears when loading widget

**Check:**
1. Browser console for full error message
2. Convex dashboard → Data → `widgetConfigurations` table
3. Verify widget exists for your agent

**Fix:**
- Create a new widget using the "New" button
- Or check if agentId in URL matches your agent

### Issue 3: Preview Not Updating

**Symptoms:** Changes don't reflect in preview panel

**Check:**
1. Browser console for React errors
2. Verify `localConfig` and `localTexts` state updates
3. Check if Save button becomes enabled (indicates state change)

**Fix:**
- Refresh the page
- Check React DevTools for component state
- Verify onChange handlers are being called

### Issue 4: Save Button Doesn't Work

**Symptoms:** Clicking Save doesn't save changes

**Check:**
1. Browser console for mutation errors
2. Network tab for failed POST requests
3. Verify you have editor role in organization

**Common Errors:**
- "Insufficient permissions" - Need editor role
- "Widget configuration not found" - Widget was deleted
- Network error - Convex server not running

**Fix:**
```bash
# Check Convex logs
# In Convex dev terminal, look for errors

# Verify permissions
# Check your role in organization settings
```

### Issue 5: Can't Create Widget

**Symptoms:** "New" button doesn't create widget

**Check:**
1. Browser console for errors
2. Network tab for failed mutation
3. Convex logs for backend errors

**Common Causes:**
- Missing default texts creation
- Agent doesn't exist
- Permission denied

**Fix:**
- Check Convex dashboard logs
- Verify agent exists: `/dashboard/agents`
- Check organization permissions

### Issue 6: Tabs Not Switching

**Symptoms:** Clicking tabs doesn't change content

**Check:**
1. Browser console for errors
2. Verify Tabs component is rendering
3. Check if activeTab state is updating

**Fix:**
- Check React DevTools for state
- Verify tab buttons are clickable
- Refresh page

### Issue 7: File Upload Not Working

**Symptoms:** Can't upload logo or avatar

**Check:**
1. Browser console for upload errors
2. File size (must be < 1MB)
3. File type (must be image)

**Common Errors:**
- "File size must be less than 1MB"
- "File type not supported"
- Upload URL generation failed

**Fix:**
- Use smaller image files
- Use JPG/PNG/WEBP/GIF formats
- Check Convex storage is configured

## Debugging Steps

### Step 1: Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Copy error messages for investigation

### Step 2: Check Network Requests

1. Open DevTools → Network tab
2. Reload page
3. Look for failed requests (red)
4. Click on failed request to see details

### Step 3: Check Convex Dashboard

1. Visit https://dashboard.convex.dev
2. Select your deployment
3. Check Functions tab for errors
4. Check Data tab for widget data

### Step 4: Check React Component State

1. Install React DevTools extension
2. Open DevTools → Components tab
3. Find WidgetDesigner component
4. Check state values:
   - `widgets` - Should be array
   - `selectedWidgetId` - Should be ID string
   - `localConfig` - Should be object
   - `localTexts` - Should be object

## Quick Test Commands

```bash
# Check if Convex is running
curl http://localhost:3000

# Check Convex deployment
npx convex dev --once

# Check TypeScript errors
npm run build

# Check linting errors
npm run lint
```

## Expected Console Logs

When working correctly, you should see:
- No red errors in console
- Successful Convex queries in Network tab
- Widget data loading successfully

## Getting Help

If issues persist:

1. **Collect Information:**
   - Browser console errors (screenshot)
   - Network tab failed requests (screenshot)
   - Convex dashboard errors (screenshot)
   - Steps to reproduce

2. **Check Common Issues:**
   - Is Convex dev server running?
   - Are you logged in?
   - Do you have editor permissions?
   - Does the agent exist?

3. **Verify Setup:**
   ```bash
   # Terminal 1: Convex
   npx convex dev
   
   # Terminal 2: Frontend
   npm run dev
   ```

## Manual Testing Checklist

- [ ] Page loads without errors
- [ ] Can see widget designer UI
- [ ] Can create new widget
- [ ] Can switch between tabs
- [ ] Preview updates when changing settings
- [ ] Can save changes
- [ ] Changes persist after refresh
- [ ] No console errors
