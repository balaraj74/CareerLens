# 🌊 Mesh Wave Animation Guide

## Overview
The mesh wave animation creates a dynamic, flowing gradient background using multiple radial gradients that animate smoothly across the screen. This adds depth and visual interest while maintaining readability.

## Current Implementation
**Location**: `src/app/layout.tsx`
```tsx
<div className="mesh-wave-bg absolute inset-0" />
```

## 🎨 Customization Options

### 1. Animation Speed

#### Default Speed (20 seconds)
```tsx
<div className="mesh-wave-bg absolute inset-0" />
```

#### Fast Animation (10 seconds)
```tsx
<div className="mesh-wave-bg mesh-wave-bg-fast absolute inset-0" />
```

#### Slow Animation (30 seconds)
```tsx
<div className="mesh-wave-bg mesh-wave-bg-slow absolute inset-0" />
```

### 2. Color Intensity

#### Default Intensity (Subtle)
```tsx
<div className="mesh-wave-bg absolute inset-0" />
```

#### High Intensity (More Vivid)
```tsx
<div className="mesh-wave-bg-intense absolute inset-0" />
```

### 3. Blur Amount

Edit in `src/app/globals.css`:

```css
.mesh-wave-bg {
  filter: blur(60px);  /* Default - smooth and subtle */
}

/* Options: */
filter: blur(40px);   /* Sharper edges */
filter: blur(80px);   /* Very soft and diffused */
filter: blur(100px);  /* Maximum smoothness */
```

### 4. Custom Colors

Edit the radial gradients in `src/app/globals.css`:

```css
.mesh-wave-bg {
  background: 
    /* Position | Color with opacity | Spread */
    radial-gradient(at 10% 20%, rgba(0, 229, 255, 0.15) 0px, transparent 50%),
    radial-gradient(at 80% 10%, rgba(165, 124, 255, 0.15) 0px, transparent 50%),
    radial-gradient(at 90% 80%, rgba(0, 255, 198, 0.1) 0px, transparent 50%),
    radial-gradient(at 20% 90%, rgba(0, 229, 255, 0.12) 0px, transparent 50%),
    radial-gradient(at 50% 50%, rgba(165, 124, 255, 0.08) 0px, transparent 50%);
}
```

**Color Values:**
- `rgba(0, 229, 255, 0.15)` - Neon Cyan with 15% opacity
- `rgba(165, 124, 255, 0.15)` - Neon Purple with 15% opacity
- `rgba(0, 255, 198, 0.1)` - Neon Emerald with 10% opacity

**Opacity Range:**
- `0.05` - Very subtle
- `0.15` - Balanced (current)
- `0.25` - Strong presence
- `0.35` - Very vibrant

### 5. Animation Pattern

The wave moves through 4 stages over the animation duration. Edit in `src/app/globals.css`:

```css
@keyframes mesh-wave-animation {
  0%, 100% { /* Start/End position */ }
  25% { /* First quarter */ }
  50% { /* Halfway */ }
  75% { /* Final quarter */ }
}
```

## 🎯 Pre-made Configurations

### Configuration 1: Subtle & Professional
```css
/* In globals.css */
.mesh-wave-bg {
  background: 
    radial-gradient(at 10% 20%, rgba(0, 229, 255, 0.08) 0px, transparent 50%),
    radial-gradient(at 80% 10%, rgba(165, 124, 255, 0.08) 0px, transparent 50%),
    radial-gradient(at 90% 80%, rgba(0, 255, 198, 0.05) 0px, transparent 50%);
  filter: blur(80px);
  animation: mesh-wave-animation 30s ease infinite;
}
```

### Configuration 2: Vibrant & Dynamic
```css
/* In globals.css */
.mesh-wave-bg {
  background: 
    radial-gradient(at 10% 20%, rgba(0, 229, 255, 0.25) 0px, transparent 50%),
    radial-gradient(at 80% 10%, rgba(165, 124, 255, 0.25) 0px, transparent 50%),
    radial-gradient(at 90% 80%, rgba(0, 255, 198, 0.2) 0px, transparent 50%),
    radial-gradient(at 20% 90%, rgba(0, 229, 255, 0.22) 0px, transparent 50%);
  filter: blur(60px);
  animation: mesh-wave-animation 15s ease infinite;
}
```

### Configuration 3: Futuristic (Purple Dominant)
```css
/* In globals.css */
.mesh-wave-bg {
  background: 
    radial-gradient(at 20% 30%, rgba(165, 124, 255, 0.2) 0px, transparent 50%),
    radial-gradient(at 70% 20%, rgba(165, 124, 255, 0.18) 0px, transparent 50%),
    radial-gradient(at 80% 70%, rgba(0, 229, 255, 0.12) 0px, transparent 50%),
    radial-gradient(at 30% 80%, rgba(165, 124, 255, 0.15) 0px, transparent 50%);
  filter: blur(70px);
  animation: mesh-wave-animation 20s ease infinite;
}
```

### Configuration 4: Ocean Wave (Cyan Dominant)
```css
/* In globals.css */
.mesh-wave-bg {
  background: 
    radial-gradient(at 15% 25%, rgba(0, 229, 255, 0.2) 0px, transparent 50%),
    radial-gradient(at 75% 15%, rgba(0, 229, 255, 0.18) 0px, transparent 50%),
    radial-gradient(at 85% 75%, rgba(0, 255, 198, 0.15) 0px, transparent 50%),
    radial-gradient(at 25% 85%, rgba(0, 229, 255, 0.17) 0px, transparent 50%);
  filter: blur(65px);
  animation: mesh-wave-animation 18s ease infinite;
}
```

## 🔧 Combining with Static Background

The mesh wave works great with your custom background image. Layer structure:

```tsx
{/* Layer 1 (-z-30): Mesh Wave - Animated base */}
<div className="mesh-wave-bg absolute inset-0" />

{/* Layer 2 (-z-20): Custom Image - Your JPG/GIF */}
<div style={{ backgroundImage: 'url(/background.jpg)', opacity: 0.15 }} />

{/* Layer 3 (-z-10): Gradient Overlay - Blends everything */}
<div className="animated-gradient opacity-80" />
```

## 🎮 Interactive Controls (Optional)

To add user-controlled speed, create a settings component:

```tsx
// components/BackgroundSettings.tsx
const [speed, setSpeed] = useState('normal');

// Then in layout.tsx:
<div className={`mesh-wave-bg mesh-wave-bg-${speed} absolute inset-0`} />
```

## 📱 Performance Considerations

- **Desktop**: All configurations work smoothly
- **Mobile**: Consider using slower animation (30s) or less blur
- **Low-end devices**: Reduce blur to 40px and opacity to 0.08

### Disable on Low Performance
```tsx
{/* Check for reduced motion preference */}
<div 
  className="mesh-wave-bg absolute inset-0"
  style={{
    animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      ? 'none' 
      : undefined
  }}
/>
```

## 🌟 Tips

1. **Start subtle**: Use lower opacity (0.08-0.12) and adjust up
2. **Match theme**: Adjust colors to match your brand
3. **Test readability**: Ensure text is readable on all pages
4. **Combine effects**: Mesh wave + custom image creates depth
5. **Performance**: Monitor FPS on target devices

## 🚀 Quick Tweaks

| Want to... | Change this... |
|------------|----------------|
| Slower waves | `20s` → `30s` in animation |
| Faster waves | `20s` → `10s` in animation |
| More blur | `blur(60px)` → `blur(80px)` |
| Sharper | `blur(60px)` → `blur(40px)` |
| More color | Opacity `0.15` → `0.25` |
| Less color | Opacity `0.15` → `0.08` |
| Add more orbs | Add more `radial-gradient()` lines |

## 🎨 Color Reference

Current neon palette:
- **Cyan**: `rgba(0, 229, 255, ...)` - #00E5FF
- **Purple**: `rgba(165, 124, 255, ...)` - #A57CFF
- **Emerald**: `rgba(0, 255, 198, ...)` - #00FFC6

Adjust the 4th value (alpha) to control intensity: 0.0 to 1.0
