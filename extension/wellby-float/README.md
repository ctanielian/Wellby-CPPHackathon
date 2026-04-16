# Wellby Float

This is the Chrome extension that was meant to come over with the extension branch.

## What it does

- Adds a small floating Wellby launcher on most websites
- Opens the local Wellby app at `http://localhost:3000`
- Reuses the existing Wellby tab if it is already open
- Syncs quick mood and stress check-ins into the local Wellby app
- Mirrors your active planner tasks and theme into the extension UI

## Load it in Chrome

1. Open `chrome://extensions`
2. Turn on `Developer mode`
3. Click `Load unpacked`
4. Select this folder:

```text
C:\Users\tanie\Desktop\CodexProjects\extension\wellby-float
```

## Notes

- It will not appear on restricted Chrome pages like `chrome://` URLs or the Chrome Web Store
- Wellby should be running locally at `http://localhost:3000`
- This version opens and focuses the main app in a browser tab rather than using a side panel
