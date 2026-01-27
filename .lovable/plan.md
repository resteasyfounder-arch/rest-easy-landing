
# Plan: Remove Sync Status Indicator and Manual Refresh Button

## Summary

Remove the visible sync status indicator (the wifi/refresh icons near logout) and the manual Refresh button from the Dashboard. The data synchronization will continue to work seamlessly in the background without exposing these implementation details to users.

## Changes

### File: `src/pages/Dashboard.tsx`

**1. Remove sync status indicator near logout button**

Delete lines 96-107:
```tsx
{/* Sync status indicator */}
<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
  {syncStatus === "syncing" && (
    <RefreshCw className="h-3 w-3" />
  )}
  {syncStatus === "synced" && (
    <Wifi className="h-3 w-3 text-emerald-500" />
  )}
  {syncStatus === "error" && (
    <WifiOff className="h-3 w-3 text-destructive" />
  )}
</div>
```

**2. Remove the manual Refresh button**

Delete lines 229-237:
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={() => refresh()}
  className="gap-1.5 text-muted-foreground"
>
  <RefreshCw className="h-3.5 w-3.5" />
  Refresh
</Button>
```

**3. Clean up unused imports**

Remove `RefreshCw`, `Wifi`, and `WifiOff` from the lucide-react imports (line 8), and remove `syncStatus` and `refresh` from the useAssessmentState destructuring (lines 40-43).

## What Remains Working

| Feature | Status |
|---------|--------|
| Auto-refresh every 30 seconds | Continues working |
| Refresh when tab becomes visible | Continues working |
| Refresh after profile updates | Continues working |
| Start Fresh button | Remains available |

## Result

The header area will be cleaner with just the logout button. Users won't see any syncing indicators - the data will simply stay up to date automatically in the background.
