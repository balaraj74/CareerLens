# Career Graph Feature - Technical Documentation

## 🎯 Overview

The **Adaptive Career Graph** is a next-generation career development tracking system that visualizes your learning journey with a GitHub contribution-style heatmap and interactive skill network graph. It uses AI to provide personalized recommendations based on your activity patterns.

## 🏗️ Architecture

### Data Model

#### Core Types (`src/lib/types.ts`)

```typescript
CareerActivity {
  id: string
  userId: string
  type: 'skill_added' | 'course_completed' | 'project_added' | 'experience_added' | 'profile_updated' | 'interview_completed' | 'learning_session'
  timestamp: Date
  metadata: { skillName?, courseName?, duration?, intensity? }
  impact: number (1-10)
}

SkillNode {
  id: string
  name: string
  category: 'technical' | 'soft' | 'domain' | 'tool' | 'language'
  weight: number (0-100) // Proficiency level
  frequency: number // Practice count
  recency: number // Days since last activity
  connections: string[] // Related skill IDs
}

CareerGraphData {
  userId: string
  currentRole?: string
  targetRole?: string
  skills: SkillNode[]
  activities: CareerActivity[]
  readinessScore: number (0-100)
  lastUpdated: Date
}

HeatmapDay {
  date: string
  count: number // Activity count
  intensity: number (0-4) // Color scale
  activities: CareerActivity[]
}
```

### Firestore Collections

```
/users/{userId} - User profiles
/careerActivities - Activity logs (with userId index)
/careerGraphs/{userId} - Computed career graph state
```

## 🧮 Algorithms

### Skill Weight Calculation

**Formula:**
```
weight = frequencyScore + recencyScore + intensityScore

frequencyScore = min(activityCount × 2, 40)
recencyScore = max(30 - daysSinceLatest / 10, 0)
intensityScore = averageImpact × 3

Total: max(weight, 100)
```

### Readiness Score

**Formula:**
```
readinessScore = averageSkillWeight + diversityBonus + recencyBonus

averageSkillWeight = Σ(skillWeights) / totalSkills
diversityBonus = min(uniqueCategories × 5, 20)
recencyBonus = min(recentSkillsCount × 2, 15)

Total: max(score, 100)
```

### Skill Connections

Skills are connected based on **co-occurrence within the same week**:
- Activities with different skills within 7 days create connections
- Connection strength based on frequency of co-occurrence

## 🎨 Components

### 1. CareerHeatmap (`src/components/career-graph/CareerHeatmap.tsx`)

GitHub contribution-style heatmap visualization.

**Features:**
- ✅ 365 days of activity history
- ✅ 5-level intensity scale (0-4)
- ✅ Interactive hover tooltips with activity details
- ✅ Current/longest streak tracking
- ✅ Statistics dashboard (total activities, active days, streaks)

**Color Scale:**
- `intensity 0`: Empty (bg-white/5)
- `intensity 1`: Light green (bg-emerald-500/20)
- `intensity 2`: Medium green (bg-emerald-500/40)
- `intensity 3`: Dark green (bg-emerald-500/60)
- `intensity 4`: Darkest green (bg-emerald-500/80)

### 2. SkillGraph (`src/components/career-graph/SkillGraph.tsx`)

Interactive force-directed graph of skills and their connections.

**Features:**
- ✅ Canvas-based rendering with force simulation
- ✅ Node size proportional to proficiency
- ✅ Color-coded by category (5 colors)
- ✅ Zoom and pan controls
- ✅ Click to select and view details
- ✅ Connection lines showing related skills

**Force Simulation:**
- Repulsion force between nodes (collision avoidance)
- Attraction along connections (related skills pull together)
- Gravity toward center (keeps graph centered)
- Velocity damping (smooth movement)

### 3. CareerInsights (`src/components/career-graph/CareerInsights.tsx`)

AI-powered insights and recommendations dashboard.

**Features:**
- ✅ Readiness score with progress bar
- ✅ Top 5 skills ranked by proficiency
- ✅ Emerging skills (high frequency, recent activity)
- ✅ AI recommendations (skills, courses, projects, certifications)
- ✅ Quick stats grid

### 4. CareerGraphPage (`src/components/career-graph/page.tsx`)

Main page component with tabs and navigation.

**Features:**
- ✅ Three-tab layout (Overview, Heatmap, Skills Network)
- ✅ Refresh button to recompute graph
- ✅ Share functionality (native share API)
- ✅ Empty state for new users
- ✅ Loading states with skeleton screens

## 🔄 Activity Tracking Integration

### Profile Updates (`profile-page-v2.tsx`)

```typescript
// Logs when user:
- Adds a new skill → 'skill_added' (impact: 5)
- Updates profile → 'profile_updated' (impact: 3)
- Adds experience → 'experience_added' (impact: 7)
```

### AI Interviewer (`ai-interviewer/page.tsx`)

```typescript
// Logs when:
- Interview completes → 'interview_completed' (impact: 8)
- Includes duration metadata
```

### Future Integration Points

```typescript
// To be added:
- Course completion → 'course_completed' (impact: 9)
- Project addition → 'project_added' (impact: 8)
- Learning session → 'learning_session' (impact: 4-7)
```

## 🚀 Usage

### Basic Usage

```typescript
import { logCareerActivity } from '@/lib/career-graph-service';

// Log an activity
await logCareerActivity(db, userId, {
  type: 'skill_added',
  metadata: { skillName: 'React' },
  impact: 5,
});

// Fetch career graph
const graph = await fetchCareerGraph(db, userId);

// Generate heatmap data
const heatmap = generateHeatmapData(graph.activities);
```

### Navigation

Users can access the Career Graph from:
- **Sidebar**: "Career Graph" menu item (Activity icon)
- **Direct URL**: `/career-graph`

### User Journey

1. **Initial Visit**: Empty state prompts user to complete profile
2. **Profile Completion**: Activities logged, graph starts building
3. **Continued Use**: Heatmap fills up, skills network grows
4. **AI Insights**: Recommendations appear based on activity patterns

## 🎯 Impact Scoring Guide

| Activity Type         | Impact | Rationale                                  |
|-----------------------|--------|--------------------------------------------|
| course_completed      | 9      | High learning investment                   |
| interview_completed   | 8      | Practical application                      |
| project_added         | 8      | Portfolio building                         |
| experience_added      | 7      | Career progression                         |
| learning_session      | 4-7    | Varies by duration                         |
| skill_added           | 5      | Skill expansion                            |
| profile_updated       | 3      | Maintenance activity                       |

## 🔮 Future Enhancements

### Phase 2: AI Recommendations Engine

```typescript
// src/ai/flows/career-graph-recommendations.ts
- Analyze skill gaps vs target role
- Suggest learning paths based on job market data
- Integrate with LinkedIn Learning / Coursera APIs
- Personalized course recommendations
- Project ideas based on skill combinations
```

### Phase 3: External Integrations

- **GitHub API**: Auto-track coding activity
- **LinkedIn API**: Import experience and skills
- **Coursera/Udemy API**: Auto-log course completions
- **Calendar API**: Schedule learning sessions

### Phase 4: Advanced Analytics

- Skill decay prediction (skills not practiced recently)
- Learning velocity tracking
- Comparative analytics (vs peers/industry)
- Career trajectory prediction

## 📊 Performance Considerations

### Optimization Strategies

1. **Activity Pagination**: Limit to 365 days (configurable)
2. **Graph Caching**: Store computed graphs in Firestore
3. **Incremental Updates**: Only recompute on new activities
4. **Canvas Rendering**: Hardware-accelerated for smooth animations

### Firestore Costs

- **Reads**: ~3-5 per page load (profile, activities, graph)
- **Writes**: 1-3 per user action (activity log + graph update)
- **Storage**: ~10KB per user career graph

## 🧪 Testing

### Manual Testing Checklist

- [ ] Heatmap renders correctly with activities
- [ ] Hover tooltips show activity details
- [ ] Skill graph displays nodes and connections
- [ ] Zoom and pan controls work
- [ ] Readiness score calculates correctly
- [ ] Activity logging fires on profile updates
- [ ] Empty state shows for new users
- [ ] Refresh updates the graph
- [ ] Share functionality works

### Mock Data Generation

```typescript
// For testing, add mock activities:
for (let i = 0; i < 100; i++) {
  await logCareerActivity(db, userId, {
    type: 'learning_session',
    metadata: {
      skillName: ['React', 'TypeScript', 'Python'][Math.floor(Math.random() * 3)],
      duration: 30 + Math.random() * 90,
    },
    impact: Math.floor(Math.random() * 5) + 3,
  });
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Empty Heatmap**
   - Check if activities exist in Firestore
   - Verify userId matches auth user
   - Check date range (last 365 days)

2. **Graph Not Rendering**
   - Ensure skills exist in profile
   - Check browser console for canvas errors
   - Verify Firestore security rules allow reads

3. **Readiness Score = 0**
   - User needs to add skills to profile
   - Activities need to be logged
   - Check skill weight calculation

## 📝 Code Quality

- ✅ TypeScript strict mode
- ✅ Error handling with try/catch
- ✅ Loading states for async operations
- ✅ Toast notifications for user feedback
- ✅ Responsive design (mobile-friendly)
- ✅ Accessibility (keyboard navigation)
- ✅ Performance optimized (canvas, debouncing)

## 🎨 Design System

**Colors:**
- Primary: Violet/Purple gradient
- Success: Emerald green
- Warning: Yellow/Amber
- Error: Red
- Background: Dark blue gradient (#090E24 → #1A1F40)

**Typography:**
- Headings: Bold, text-glow effect
- Body: Inter/System UI
- Monospace: For code/stats

**Spacing:**
- Grid: 4px base unit
- Cards: 1.5rem padding
- Gaps: 1rem - 2rem

---

## 🚀 Deployment

No additional deployment steps required. The feature is part of the main Next.js app.

**Environment Variables:**
- Uses existing Firebase and Gemini API keys
- No new variables needed

**Database Migration:**
- No migration needed
- Collections auto-created on first write

---

**Built with ❤️ for CareerLens AI**
