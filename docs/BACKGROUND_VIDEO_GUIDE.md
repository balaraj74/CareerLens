# 🎥 Global Background Video Setup Guide

## ✅ What Has Been Implemented

I've updated your CareerLens app to include a persistent global background video that plays continuously behind all screens.

## 📁 Where to Add Your Video

**Place your video file here:**
```
/home/balaraj/CareerLens/public/background-video.mp4
```

### Steps to Add Your Video:

1. **Copy your video to the public folder:**
   ```bash
   cp /path/to/your/Video_Generation_From_Image.mp4 /home/balaraj/CareerLens/public/background-video.mp4
   ```

2. **Verify the file exists:**
   ```bash
   ls -lh /home/balaraj/CareerLens/public/background-video.mp4
   ```

## 🏗️ Implementation Architecture

### Files Modified/Created:

#### 1. **`/src/components/global-background-video.tsx`** (NEW)
- Creates the video component
- Handles autoplay, loop, mute
- Adds dark overlay for text visibility
- Uses `position: fixed` for persistence

#### 2. **`/src/app/layout.tsx`** (UPDATED)
- Imports and renders `GlobalBackgroundVideo` at root level
- Ensures video is mounted once and persists across routes
- Proper z-index layering:
  - Video: z-index -10 (bottom)
  - Mesh wave overlay: z-index 1 (subtle effect)
  - App content: z-index 10 (top)

#### 3. **`/src/app/globals.css`** (UPDATED)
- Added `.global-video-background` styles
- Video performance optimizations
- Ensures proper video covering and centering

## 🎨 Z-Index Layering Structure

```
┌─────────────────────────────────────┐
│  App Content (z-index: 10)          │ ← All UI, cards, buttons
│  - Glassmorphic components          │
│  - Navigation                        │
│  - Dashboard                         │
├─────────────────────────────────────┤
│  Mesh Wave Overlay (z-index: 1)     │ ← Subtle animated gradient
│  - opacity: 30%                      │
├─────────────────────────────────────┤
│  Dark Overlay (z-index: 0)          │ ← Improves text readability
│  - bg-black/40                       │
├─────────────────────────────────────┤
│  Background Video (z-index: -1)     │ ← Your video plays here
│  - autoplay, loop, muted             │
│  - object-fit: cover                 │
└─────────────────────────────────────┘
```

## ⚡ Performance Optimizations

The implementation includes several optimizations:

1. **Single Mount Point** - Video component is mounted once in root layout, never unmounts
2. **Hardware Acceleration** - Uses `will-change: transform` and `backface-visibility: hidden`
3. **No Re-renders** - Video stays fixed and doesn't re-render on route changes
4. **Lazy Loading** - Video loads asynchronously
5. **Fallback** - Gradient background if video fails to load

## 🎯 Key Features

✅ **Persistent Playback** - Video never restarts when navigating
✅ **Fixed Position** - Always stays in place, doesn't scroll
✅ **Autoplay** - Starts automatically on page load
✅ **Looping** - Plays continuously
✅ **Muted** - Silent playback (required for autoplay)
✅ **Full Viewport** - Covers entire screen with `object-fit: cover`
✅ **Glassmorphic UI** - All content appears on top with transparency
✅ **No Breaking Changes** - All existing features work unchanged

## 🎬 Video Requirements

For best results, your video should be:

- **Format**: MP4 (H.264 codec)
- **Resolution**: 1920x1080 (Full HD) minimum
- **File Size**: < 10MB for best performance
- **Duration**: 10-30 seconds (will loop)
- **Aspect Ratio**: 16:9 or match your design
- **Optimization**: Compressed for web (use HandBrake or similar)

### Optional: Create Multiple Versions

You can create responsive versions:

```
public/
├── background-video.mp4      # Desktop (1920x1080)
├── background-video-tablet.mp4  # Tablet (1280x720)
└── background-video-mobile.mp4  # Mobile (720x480)
```

Then update the component to use appropriate video based on screen size.

## 🔧 Customization Options

### Adjust Dark Overlay Opacity

In `/src/components/global-background-video.tsx`, change:

```typescript
className="fixed top-0 left-0 w-full h-full pointer-events-none bg-black/40"
//                                                                        ↑
//                                                    Change 40 to any value (0-100)
```

- `bg-black/20` - Lighter overlay (more video visible)
- `bg-black/60` - Darker overlay (better text contrast)

### Disable Mesh Wave Overlay

In `/src/app/layout.tsx`, remove or comment out:

```typescript
{/* Mesh Wave Overlay on top of video for extra visual depth */}
<div className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
  <div className="mesh-wave-bg absolute inset-0 opacity-30" />
</div>
```

### Change Video Playback Speed

Add to the `<video>` tag in `global-background-video.tsx`:

```typescript
playbackRate={0.5}  // 0.5 = half speed, 2.0 = double speed
```

## 🐛 Troubleshooting

### Video Not Playing?

1. **Check file exists:**
   ```bash
   ls -lh /home/balaraj/CareerLens/public/background-video.mp4
   ```

2. **Check browser console** (F12) for errors

3. **Check video format** - Must be MP4 with H.264 codec

4. **Clear browser cache** (Ctrl+Shift+R)

### Video Appears on Top of UI?

Check z-index values in `/src/app/layout.tsx` - ensure:
- Video container: negative z-index (-10 or -1)
- Content wrapper: positive z-index (10 or higher)

### Video Causing Performance Issues?

1. **Reduce video file size** - Compress using HandBrake
2. **Lower resolution** - Use 1280x720 instead of 1920x1080
3. **Reduce video quality** - 70-80% quality is usually sufficient

### Video Restarts When Navigating?

This should NOT happen with the current implementation. If it does:
- Ensure `GlobalBackgroundVideo` is in `layout.tsx`, not `page.tsx`
- Check that you're not wrapping it in any client components that re-render

## 📊 Testing Checklist

- [ ] Video file copied to `/public/background-video.mp4`
- [ ] Video plays automatically on page load
- [ ] Video loops continuously
- [ ] Video stays fixed when scrolling
- [ ] Video doesn't restart when navigating between pages
- [ ] All UI elements visible on top of video
- [ ] Text is readable with dark overlay
- [ ] Dashboard glassmorphic cards look good
- [ ] Performance is acceptable (no lag/stuttering)
- [ ] Works on different screen sizes

## 🎨 Alternative: Use Different Videos for Different Pages

If you want page-specific videos, create:

```typescript
// /src/components/page-background-video.tsx
export function PageBackgroundVideo({ videoSrc }: { videoSrc: string }) {
  // Same implementation but accepts dynamic video source
}
```

Then use in individual pages:
```typescript
<PageBackgroundVideo videoSrc="/videos/dashboard-bg.mp4" />
```

## 💡 Pro Tips

1. **Use a loading placeholder**: Add a poster image to show before video loads
   ```typescript
   <video poster="/video-placeholder.jpg" ... >
   ```

2. **Optimize for mobile**: Consider using a static image on mobile devices to save bandwidth

3. **Add blur filter**: For extra glassmorphic effect, add `filter: blur(2px)` to video

4. **Color overlay**: Change overlay color for different moods
   ```typescript
   bg-blue-900/40  // Blue tint
   bg-purple-900/40  // Purple tint
   ```

## 🚀 Next Steps

1. Copy your video file to the public folder
2. Refresh your browser
3. Navigate between different pages to verify video persistence
4. Adjust overlay opacity if needed
5. Fine-tune performance if necessary

---

**Need help?** The video component is fully encapsulated and won't break existing features. All your glassmorphic UI will automatically appear on top!
