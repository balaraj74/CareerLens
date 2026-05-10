# 🎨 Custom Background Setup Guide

## How to Add Your Background Image

### Step 1: Prepare Your Image
1. Choose your background image (JPG or GIF)
2. Recommended specifications:
   - **Resolution**: 1920x1080 or higher
   - **File size**: Keep under 2MB for JPG, 5MB for GIF
   - **Format**: JPG for static images, GIF for animated backgrounds

### Step 2: Add to Public Folder
1. Place your image in the `public` folder at the root of the project
2. Rename it to one of these:
   - `background.jpg` - for static images
   - `background.gif` - for animated backgrounds
   - `background.png` - also supported

**File location:** `/public/background.jpg` or `/public/background.gif`

### Step 3: Update the Configuration (Optional)
The background is already configured in `src/app/layout.tsx`. If you want to customize:

```tsx
<div 
  className="fixed top-0 left-0 w-full h-full -z-20 bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: 'url(/background.jpg)', // Change to your filename
    opacity: 0.15, // Adjust opacity (0.1 to 0.3 recommended)
  }}
/>
```

### Step 4: Adjust Opacity (Optional)
You can change the background visibility by modifying the `opacity` value:
- `0.1` - Very subtle (10%)
- `0.15` - Balanced (15%) ← **Current setting**
- `0.2` - More visible (20%)
- `0.3` - Strong presence (30%)

**Location to edit:** `src/app/layout.tsx` line ~24

### Background Position Options
You can also adjust how the image is positioned:

```tsx
// In layout.tsx, modify the className:
className="fixed top-0 left-0 w-full h-full -z-20 bg-cover bg-center bg-no-repeat"

// Change bg-center to:
// - bg-top (align to top)
// - bg-bottom (align to bottom)
// - bg-left (align to left)
// - bg-right (align to right)

// Change bg-cover to:
// - bg-contain (fit entire image without cropping)
// - bg-cover (fill area, may crop) ← Current setting
```

### Background Size Options
```tsx
// Add to the style prop:
style={{
  backgroundImage: 'url(/background.jpg)',
  opacity: 0.15,
  backgroundSize: 'cover', // or 'contain', '100% 100%', 'auto'
}}
```

## 🎯 Recommended Background Types

### Static Backgrounds (JPG/PNG)
- **Abstract patterns**: Geometric shapes, gradients
- **Tech-themed**: Circuit boards, code patterns, digital grids
- **Space/Nebula**: Cosmic themes, stars, galaxies
- **Minimalist**: Subtle textures, noise patterns

### Animated Backgrounds (GIF)
- **Subtle animations**: Slow-moving particles, gentle waves
- **Matrix-style**: Falling code, digital rain
- **Space themes**: Rotating planets, star fields
- **Abstract motion**: Gradient flows, geometric patterns

⚠️ **Note**: Heavy GIFs may impact performance on slower devices.

## 🔧 Advanced Customization

### Using Multiple Backgrounds
Edit `src/app/layout.tsx` to add patterns or overlays:

```tsx
<div 
  className="fixed top-0 left-0 w-full h-full -z-20"
  style={{
    background: `
      linear-gradient(rgba(14, 15, 18, 0.7), rgba(14, 15, 18, 0.7)),
      url(/background.jpg)
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
/>
```

### Different Backgrounds Per Page
Create a background component in each page:

```tsx
// In any page.tsx
<div className="relative min-h-screen">
  <div 
    className="absolute inset-0 -z-10"
    style={{
      backgroundImage: 'url(/page-specific-bg.jpg)',
      opacity: 0.2,
    }}
  />
  {/* Your page content */}
</div>
```

## 📁 Current Structure
```
CareerLens/
├── public/
│   ├── background.jpg  ← Add your image here
│   ├── background.gif  ← Or animated GIF here
│   └── ...
├── src/
│   ├── app/
│   │   ├── layout.tsx  ← Background configured here
│   │   └── globals.css
│   └── ...
```

## 🎨 Testing Your Background
1. Add image to `/public/` folder
2. Restart dev server: `npm run dev`
3. Open browser: `http://localhost:3000`
4. Adjust opacity in `layout.tsx` if needed
5. Refresh page to see changes

## 💡 Tips
- Use darker images for better text readability
- Lower opacity keeps UI elements clearly visible
- Test on different screen sizes
- Optimize image file size for faster loading
- GIFs should be subtle to avoid distraction

## 🚀 Example Images to Try
You can use free resources from:
- **Unsplash**: https://unsplash.com
- **Pexels**: https://pexels.com
- **Pixabay**: https://pixabay.com
- **Giphy** (for GIFs): https://giphy.com

Search terms: "abstract tech", "circuit board", "space nebula", "geometric pattern"
