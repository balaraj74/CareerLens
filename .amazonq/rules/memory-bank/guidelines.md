# CareerLens Development Guidelines

## Code Quality Standards

### TypeScript Configuration
- **Strict Mode**: Enabled for type safety across all files
- **Target**: ES2020 for modern JavaScript features
- **Module System**: ESNext with bundler resolution
- **Path Aliases**: Use `@/*` for imports from `src/` directory
- **Type Definitions**: All functions, components, and variables must have explicit types
- **No Implicit Any**: Avoid `any` type; use proper type definitions or `unknown`

### File Organization
- **Component Files**: Use `.tsx` extension for React components
- **Service Files**: Use `.ts` extension for business logic
- **Naming Convention**: 
  - Components: PascalCase (e.g., `DynamicDashboard.tsx`)
  - Services: kebab-case (e.g., `learning-service.ts`)
  - Hooks: kebab-case with `use-` prefix (e.g., `use-toast.ts`)
  - API Routes: kebab-case (e.g., `college-recommendations/route.ts`)

### Import Organization
1. External dependencies (React, Next.js, third-party libraries)
2. Internal components from `@/components`
3. Hooks from `@/hooks`
4. Services from `@/lib/services`
5. Types from `@/lib/types`
6. Utilities from `@/lib`

Example:
```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { fetchEnhancedProfile } from '@/lib/enhanced-profile-service';
import type { EnhancedUserProfile } from '@/lib/types';
```

## React & Next.js Patterns

### Component Structure
- **Client Components**: Use `'use client'` directive at the top for interactive components
- **Server Components**: Default for data fetching and static content
- **Component Props**: Define explicit TypeScript interfaces for all props
- **State Management**: Use React hooks (useState, useEffect, useRef)
- **Context Usage**: Firebase context for auth and database access

### Component Pattern (5/5 files follow this):
```typescript
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface ComponentProps {
  // Explicit prop types
}

export function ComponentName({ prop }: ComponentProps) {
  const [state, setState] = useState<Type>(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return (
    // JSX
  );
}
```

### API Route Pattern (1/5 files):
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validation
    if (!data.required_field) {
      return NextResponse.json(
        { error: 'Missing required field' },
        { status: 400 }
      );
    }
    
    // Business logic
    const result = await processData(data);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal error', details: error.message },
      { status: 500 }
    );
  }
}
```

## Animation & UI Patterns

### Framer Motion Usage (2/5 files use extensively)
- **Initial State**: Always define `initial` prop for enter animations
- **Animate State**: Use `animate` prop for target animation state
- **Transitions**: Specify `transition` with duration, delay, and easing
- **Stagger Children**: Use `staggerChildren` in parent variants for sequential animations
- **Hover Effects**: Use `whileHover` for interactive feedback
- **Tap Effects**: Use `whileTap` for button press feedback

Example Pattern:
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2, duration: 0.5 }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  {content}
</motion.div>
```

### Infinite Animations (2/5 files):
```typescript
<motion.div
  animate={{
    scale: [1, 1.2, 1],
    opacity: [0.3, 0.5, 0.3],
  }}
  transition={{ duration: 8, repeat: Infinity }}
/>
```

### Conditional Styling Pattern (5/5 files):
```typescript
className={`base-classes ${
  isDarkMode
    ? 'dark-mode-classes'
    : 'light-mode-classes'
}`}
```

## State Management Patterns

### Local State (5/5 files):
- Use `useState` for component-level state
- Initialize with proper TypeScript types
- Use functional updates when state depends on previous value

### Effect Hooks (4/5 files):
- Always specify dependency arrays
- Clean up side effects in return function
- Use separate effects for different concerns

Example:
```typescript
useEffect(() => {
  const timer = setInterval(() => {
    // Logic
  }, 1000);
  
  return () => clearInterval(timer);
}, [dependency]);
```

### Ref Usage (2/5 files):
- Use `useRef` for DOM references and mutable values
- Type refs explicitly: `useRef<HTMLCanvasElement>(null)`
- Access current value: `ref.current`

## Data Fetching Patterns

### Async/Await Pattern (5/5 files):
```typescript
const loadData = async () => {
  if (!user || !db) return;
  
  try {
    setLoading(true);
    const data = await fetchData(db, user.uid);
    setData(data);
  } catch (error) {
    console.error('Error:', error);
    toast({
      title: 'Error',
      description: 'Failed to load data',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};
```

### Error Handling (5/5 files):
- Always wrap async operations in try-catch
- Log errors to console with descriptive messages
- Show user-friendly error messages via toast notifications
- Use `finally` block for cleanup (e.g., setLoading(false))

### Loading States (3/5 files):
```typescript
if (loading) {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin" />
      <p>Loading message...</p>
    </div>
  );
}
```

## Firebase Integration Patterns

### Authentication Check (3/5 files):
```typescript
const { user } = useAuth();
const { db } = useFirebase();

if (!user || !db) return;
```

### Firestore Operations:
- Use `setDoc` with `{ merge: true }` instead of `updateDoc` to avoid "No document to update" errors
- Always check for user authentication before database operations
- Use proper error handling for all Firebase operations

## Service Layer Patterns

### Service Function Structure (2/5 files):
```typescript
export async function serviceName(params: Type): Promise<ReturnType> {
  try {
    // Business logic
    const result = await externalAPI();
    return processedResult;
  } catch (error) {
    console.error('Service error:', error);
    return fallbackValue;
  }
}
```

### Mock Data Pattern (2/5 files):
- Provide comprehensive mock data for development and fallback
- Structure mock data to match production API responses
- Use TypeScript interfaces to ensure mock data consistency

## Canvas & Graphics Patterns (1/5 files)

### Canvas Setup:
```typescript
const canvasRef = useRef<HTMLCanvasElement>(null);

useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Resize handler
  const resizeCanvas = () => {
    canvas.width = container.width;
    canvas.height = container.height;
  };
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  return () => {
    window.removeEventListener('resize', resizeCanvas);
  };
}, [dependencies]);
```

### Animation Loop:
```typescript
let animationId: number;

const animate = () => {
  // Update logic
  render();
  animationId = requestAnimationFrame(animate);
};

animate();

return () => {
  cancelAnimationFrame(animationId);
};
```

## Custom Hooks Pattern (1/5 files)

### Hook Structure:
```typescript
export function useCustomHook() {
  const [state, setState] = React.useState<State>(initialState);
  
  React.useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    };
  }, []);
  
  return {
    state,
    actions: {
      action1: () => {},
      action2: () => {},
    },
  };
}
```

### Reducer Pattern (1/5 files):
```typescript
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ACTION_TYPE':
      return { ...state, updated: true };
    default:
      return state;
  }
};

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach(listener => listener(memoryState));
}
```

## UI Component Patterns

### Conditional Rendering (5/5 files):
```typescript
{condition && <Component />}
{condition ? <ComponentA /> : <ComponentB />}
```

### List Rendering (5/5 files):
```typescript
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.1 }}
  >
    {item.content}
  </motion.div>
))}
```

### Button Patterns:
```typescript
<Button
  asChild
  variant="outline"
  size="sm"
  className="custom-classes"
>
  <Link href="/path">
    <Icon className="w-4 h-4 mr-2" />
    Button Text
  </Link>
</Button>
```

## Styling Conventions

### Tailwind CSS Usage (5/5 files):
- Use utility classes for all styling
- Combine classes with template literals for conditional styling
- Use `backdrop-blur-xl` for glassmorphic effects
- Use gradient classes: `bg-gradient-to-br from-color to-color`
- Responsive classes: `md:`, `lg:` prefixes

### Color Scheme (5/5 files):
- Dark mode: `bg-slate-900`, `text-white`, `border-blue-500/30`
- Light mode: `bg-white`, `text-slate-900`, `border-blue-300`
- Accent colors: blue, purple, cyan, emerald, pink
- Opacity modifiers: `/20`, `/30`, `/40`, `/50` for transparency

### Spacing Pattern:
- Use consistent spacing: `gap-2`, `gap-4`, `gap-6`, `gap-8`
- Padding: `p-3`, `p-4`, `p-6`, `p-8`
- Margin: `mb-2`, `mb-4`, `mb-6`

## Performance Optimizations

### Memoization:
- Use `React.memo` for expensive components
- Use `useMemo` for expensive calculations
- Use `useCallback` for function references passed to children

### Lazy Loading:
- Use dynamic imports for large components
- Implement code splitting at route level
- Load heavy libraries only when needed

### Animation Performance:
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` CSS property sparingly

## Testing Considerations

### Console Logging (5/5 files):
- Use descriptive log messages with emojis for visibility
- Log important state changes and API calls
- Include error details in error logs
- Use `console.error` for errors, `console.log` for info

Example:
```typescript
console.log('✅ Generated recommendations:', count);
console.error('❌ Error in API:', error);
```

## Documentation Standards

### Function Documentation:
```typescript
/**
 * Brief description of function purpose
 * 
 * @param param1 - Description of parameter
 * @param param2 - Description of parameter
 * @returns Description of return value
 */
export async function functionName(param1: Type, param2: Type): Promise<ReturnType> {
  // Implementation
}
```

### Interface Documentation:
```typescript
/**
 * Description of interface purpose
 */
export interface InterfaceName {
  /** Description of property */
  property: Type;
}
```

## Common Patterns Summary

### Frequency Analysis:
- **5/5 files**: TypeScript with explicit types, conditional styling, error handling, async/await
- **4/5 files**: useEffect with cleanup, loading states
- **3/5 files**: Firebase integration, toast notifications
- **2/5 files**: Framer Motion animations, mock data patterns, canvas operations
- **1/5 files**: Custom hooks, reducer pattern, force-directed graphs

### Best Practices:
1. Always use TypeScript with strict mode
2. Implement proper error handling with user feedback
3. Use loading states for async operations
4. Clean up side effects in useEffect
5. Validate data before processing
6. Use path aliases for imports
7. Follow consistent naming conventions
8. Implement responsive design with Tailwind
9. Use Framer Motion for smooth animations
10. Provide fallback data for better UX

### Anti-Patterns to Avoid:
- Using `any` type without justification
- Missing error handling in async operations
- Forgetting cleanup in useEffect
- Hardcoding values that should be configurable
- Missing loading states for async operations
- Not validating user input
- Inconsistent naming conventions
- Missing TypeScript types for props and state
