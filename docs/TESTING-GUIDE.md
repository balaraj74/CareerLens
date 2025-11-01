# CareerLens Testing Guide

## 🧪 Complete Feature Testing Checklist

This guide provides step-by-step instructions to test all newly implemented features.

---

## Prerequisites

### 1. Start the Development Server
```bash
cd /home/balaraj/CareerLens
npm run dev
```

### 2. Ensure Firebase Authentication
- Have a test account created
- Be logged in to the application
- Profile data should be populated

---

## Test Suite 1: Resume Evaluator

### Test 1.1: File Upload
**Objective**: Verify file upload and validation

**Steps**:
1. Navigate to `http://localhost:3000/resume`
2. Click the "Evaluate" tab
3. Test drag-and-drop:
   - Drag a PDF file → Should show file name
   - Drag a DOCX file → Should show file name
   - Drag a TXT file → Should show file name
   - Drag an image file → Should show error message
   - Drag a file > 10MB → Should show size error

**Expected Results**:
- ✅ Valid files (PDF/DOCX/TXT) accepted
- ✅ Invalid file types rejected
- ✅ Files over 10MB rejected
- ✅ File name displayed correctly

### Test 1.2: Resume Analysis
**Objective**: Test AI-powered resume analysis

**Steps**:
1. Upload a valid resume file
2. Click "Analyze Resume"
3. Wait for AI processing (15-30 seconds)
4. Review the analysis results

**Expected Results**:
- ✅ Loading state shows progress
- ✅ 6 score cards displayed (ATS, Impact, Keywords, Structure, Readability, Overall)
- ✅ Each score has a percentage and progress bar
- ✅ Score colors match ranges:
  - Red: < 50
  - Yellow: 50-79
  - Green: ≥ 80

### Test 1.3: Suggestions Tab
**Objective**: Verify categorized suggestions

**Steps**:
1. After analysis, click "Suggestions" tab
2. Review all suggestions

**Expected Results**:
- ✅ Suggestions grouped by priority:
  - 🔴 Critical (red badge)
  - 🟡 Important (yellow badge)
  - 🟢 Optional (green badge)
- ✅ Each suggestion has a description
- ✅ "Rewrite with AI" button visible
- ✅ Section indicator shown (e.g., "Experience", "Skills")

### Test 1.4: AI Rewrite Feature
**Objective**: Test inline content rewriting

**Steps**:
1. Click "Rewrite with AI" on any suggestion
2. Wait for AI processing (10-20 seconds)
3. Review before/after comparison

**Expected Results**:
- ✅ Loading spinner appears
- ✅ "Before" section shows original text
- ✅ "After" section shows improved text
- ✅ Improvement explanation provided
- ✅ Can copy improved text

### Test 1.5: Keywords Tab
**Objective**: Test keyword analysis

**Steps**:
1. Click "Keywords" tab
2. Review all three categories

**Expected Results**:
- ✅ **Present Keywords** section with green badges
- ✅ **Missing Keywords** section with amber badges
- ✅ **Overused Keywords** section with red badges
- ✅ Keywords are relevant to the role

### Test 1.6: Strengths Tab
**Objective**: Verify positive feedback

**Steps**:
1. Click "Strengths" tab
2. Review strengths list

**Expected Results**:
- ✅ List of positive aspects
- ✅ Green checkmark icons
- ✅ Constructive feedback

### Test 1.7: Sections Tab
**Objective**: Test section-by-section analysis

**Steps**:
1. Click "Sections" tab
2. Expand each section (Experience, Education, Skills, Projects)

**Expected Results**:
- ✅ Each section has feedback
- ✅ Strengths listed with green checkmarks
- ✅ Improvements listed with amber arrows
- ✅ Relevant and specific feedback

### Test 1.8: Career Graph Integration
**Objective**: Verify activity logging

**Steps**:
1. Complete a resume analysis
2. Navigate to `/profile` or Career Graph page
3. Check recent activities

**Expected Results**:
- ✅ "Resume Analyzed" activity logged
- ✅ Timestamp is correct
- ✅ Impact score (0-10) calculated from overall score
- ✅ Activity appears in heatmap

---

## Test Suite 2: Resume Generator

### Test 2.1: Profile Loading
**Objective**: Verify automatic profile data loading

**Steps**:
1. Navigate to `/resume`
2. Click "Generate" tab
3. Observe content overview

**Expected Results**:
- ✅ Profile data loads automatically
- ✅ Content overview shows:
  - Experience count
  - Education count
  - Skills count
  - Projects count
- ✅ "Ready to Generate" message if data exists
- ✅ Error message if profile is incomplete

### Test 2.2: Theme Selection
**Objective**: Test theme customization

**Steps**:
1. Click through all 4 themes:
   - Formal
   - Modern
   - Creative
   - Minimal
2. Observe color preview for each

**Expected Results**:
- ✅ Each theme has distinct color scheme
- ✅ Color preview box displays theme color
- ✅ Theme names descriptive
- ✅ Selected theme highlighted

### Test 2.3: Tone Selection
**Objective**: Test tone variations

**Steps**:
1. Click through all 4 tones:
   - Formal
   - Impact-Driven
   - Creative
   - Academic
2. Read descriptions

**Expected Results**:
- ✅ Each tone has unique description
- ✅ Selected tone highlighted
- ✅ Descriptions match writing style

### Test 2.4: AI Summary Generation
**Objective**: Test AI professional summary

**Steps**:
1. Click "Generate AI Summary"
2. Wait for AI processing (10-20 seconds)
3. Review generated summary

**Expected Results**:
- ✅ Loading state shows progress
- ✅ Summary appears in text area
- ✅ Summary is 2-4 sentences
- ✅ Summary highlights key strengths
- ✅ Can edit summary before generating PDF

### Test 2.5: PDF Generation
**Objective**: Test PDF creation and download

**Steps**:
1. Select a theme (e.g., Modern)
2. Select a tone (e.g., Impact-Driven)
3. Generate AI summary (optional)
4. Click "Download Resume PDF"
5. Wait for generation (5-10 seconds)

**Expected Results**:
- ✅ Loading state appears
- ✅ PDF downloads automatically
- ✅ File name: `{FirstName}_{LastName}_Resume.pdf`
- ✅ PDF opens correctly in viewer
- ✅ Theme colors applied correctly
- ✅ All sections included:
  - Header with contact info
  - Professional Summary
  - Experience
  - Education
  - Skills
  - Projects
- ✅ Multi-page layout if content exceeds one page
- ✅ Clickable links work (email, phone, LinkedIn, GitHub)

### Test 2.6: Theme Variations
**Objective**: Test all themes produce valid PDFs

**Steps**:
1. Generate PDF with Formal theme
2. Generate PDF with Modern theme
3. Generate PDF with Creative theme
4. Generate PDF with Minimal theme

**Expected Results**:
- ✅ Formal: Navy blue headers, Times New Roman font
- ✅ Modern: Blue headers, Helvetica font
- ✅ Creative: Purple headers, clean design
- ✅ Minimal: Black/gray, simple layout

### Test 2.7: Career Graph Integration
**Objective**: Verify generation logging

**Steps**:
1. Generate a resume PDF
2. Navigate to Career Graph
3. Check recent activities

**Expected Results**:
- ✅ "Resume Generated" activity logged
- ✅ Metadata includes theme and tone
- ✅ Impact score = 5 (moderate impact)
- ✅ Activity appears in heatmap

---

## Test Suite 3: Dynamic Project Builder

### Test 3.1: Profile & Skill Gap Detection
**Objective**: Verify automatic skill gap identification

**Steps**:
1. Navigate to `/roadmap`
2. Click "Project Builder" tab
3. Observe initial state

**Expected Results**:
- ✅ Profile data loads automatically
- ✅ Skill gap message shows missing skills
- ✅ "Get AI Suggestions" button enabled
- ✅ Error message if profile incomplete

### Test 3.2: AI Project Suggestions
**Objective**: Test AI-powered project generation

**Steps**:
1. Click "Get AI Suggestions"
2. Wait for AI processing (20-40 seconds)
3. Review suggested projects

**Expected Results**:
- ✅ Loading state with message
- ✅ 5 project cards displayed
- ✅ Each card shows:
  - Project title
  - Brief description
  - Difficulty badge (Beginner/Intermediate/Advanced)
  - Estimated hours
  - Market value indicator
  - 3-5 skill tags
  - Impact statement
- ✅ "View Details" button on each card
- ✅ Projects relevant to skill gaps

### Test 3.3: Project Detail - Overview Tab
**Objective**: Test comprehensive overview

**Steps**:
1. Click "View Details" on any project
2. Review "Overview" tab (default)

**Expected Results**:
- ✅ Project description (2-3 paragraphs)
- ✅ Learning Objectives (5-7 bullet points)
- ✅ Prerequisites (3-5 items)
- ✅ Potential Challenges (3-5 items)
- ✅ Extension Ideas (3-5 items)
- ✅ Clear, actionable content

### Test 3.4: Project Detail - Tech Stack Tab
**Objective**: Test technology breakdown

**Steps**:
1. Click "Tech Stack" tab
2. Review all categories

**Expected Results**:
- ✅ **Frontend** section (if applicable)
- ✅ **Backend** section (if applicable)
- ✅ **Database** section (if applicable)
- ✅ **Tools** section (dev tools, deployment, etc.)
- ✅ Each technology has description
- ✅ Relevant to project goals

### Test 3.5: Project Detail - Steps Tab
**Objective**: Test phase-by-phase guide

**Steps**:
1. Click "Steps" tab
2. Expand each phase

**Expected Results**:
- ✅ 5-8 development phases
- ✅ Each phase has:
  - Phase title (e.g., "Phase 1: Setup & Configuration")
  - Duration estimate
  - 3-7 specific tasks
- ✅ Checkboxes for tracking progress
- ✅ Logical progression from setup to deployment

### Test 3.6: Project Detail - Resources Tab
**Objective**: Test learning resources

**Steps**:
1. Click "Resources" tab
2. Review resource list

**Expected Results**:
- ✅ 8-12 resources listed
- ✅ Each resource has:
  - Title
  - Clickable URL
  - Type badge (Documentation/Tutorial/Video/Article)
- ✅ Links open in new tab
- ✅ Resources relevant to tech stack
- ✅ Mix of official docs and tutorials

### Test 3.7: Project Detail - Structure Tab
**Objective**: Test file structure guide

**Steps**:
1. Click "Structure" tab
2. Review file tree

**Expected Results**:
- ✅ 10-15 files/folders listed
- ✅ Hierarchical structure (folders and files)
- ✅ Each item has description
- ✅ Realistic project structure
- ✅ Follows best practices for tech stack

### Test 3.8: Download Blueprint
**Objective**: Test Markdown export

**Steps**:
1. In project detail view, click "Download Blueprint"
2. Check downloaded file

**Expected Results**:
- ✅ Markdown file downloads
- ✅ File name: `{ProjectTitle}_Blueprint.md`
- ✅ Contains all sections:
  - Overview
  - Learning Objectives
  - Tech Stack
  - Steps
  - Resources
  - File Structure
  - Challenges
  - Extensions
- ✅ Proper Markdown formatting
- ✅ Can open in text editor or VS Code

### Test 3.9: Start Building Action
**Objective**: Test Career Graph integration

**Steps**:
1. Click "Start Building" button
2. Navigate to Career Graph
3. Check recent activities

**Expected Results**:
- ✅ Success toast notification
- ✅ "Project Started" activity logged
- ✅ Project title in metadata
- ✅ Impact score = 7 (high impact)
- ✅ Activity appears in heatmap

### Test 3.10: Back to Suggestions
**Objective**: Test navigation

**Steps**:
1. In project detail view, click "← Back to Suggestions"
2. Verify navigation

**Expected Results**:
- ✅ Returns to suggestion list
- ✅ Previous suggestions still visible
- ✅ Can click different project
- ✅ No data lost

---

## Test Suite 4: Integration Tests

### Test 4.1: Career Graph Heatmap
**Objective**: Verify all activities appear in Career Graph

**Steps**:
1. Perform all three actions:
   - Analyze a resume
   - Generate a resume PDF
   - Start building a project
2. Navigate to Career Graph page
3. Check heatmap visualization

**Expected Results**:
- ✅ All 3 activities visible in timeline
- ✅ Heatmap shows activity on today's date
- ✅ Activity list shows all 3 events
- ✅ Impact scores displayed correctly
- ✅ Can click on activities for details

### Test 4.2: Navigation Flow
**Objective**: Test smooth navigation between features

**Steps**:
1. Navigate: Home → Resume → Evaluate
2. Upload and analyze resume
3. Navigate: Resume → Roadmap → Project Builder
4. Get project suggestions
5. Navigate: Roadmap → Learning Roadmap tab
6. Generate learning roadmap

**Expected Results**:
- ✅ All navigation links work
- ✅ State preserved during navigation
- ✅ No console errors
- ✅ Smooth transitions

### Test 4.3: Error Handling
**Objective**: Test graceful error handling

**Steps**:
1. **Resume Evaluator**: Upload corrupted file
2. **Resume Generator**: Try to generate without profile
3. **Project Builder**: Disconnect internet during AI call

**Expected Results**:
- ✅ User-friendly error messages
- ✅ No application crashes
- ✅ Can retry after fixing issue
- ✅ Console logs helpful debugging info

### Test 4.4: Responsive Design
**Objective**: Test mobile and tablet layouts

**Steps**:
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

**Expected Results**:
- ✅ All components responsive
- ✅ Tabs stack on mobile
- ✅ Cards adjust to screen size
- ✅ Buttons remain clickable
- ✅ Text readable at all sizes

---

## Test Suite 5: Performance Tests

### Test 5.1: AI Response Times
**Objective**: Measure AI processing speed

**Expected Times**:
- Resume Analysis: 15-30 seconds
- AI Rewrite: 10-20 seconds
- AI Summary: 10-20 seconds
- Project Suggestions: 20-40 seconds
- Project Plan: 25-45 seconds

**Acceptable Range**: ±10 seconds

### Test 5.2: File Upload Limits
**Objective**: Test file size handling

**Steps**:
1. Upload 1MB file → Should work
2. Upload 5MB file → Should work
3. Upload 10MB file → Should work
4. Upload 15MB file → Should be rejected

**Expected Results**:
- ✅ Files ≤ 10MB accepted
- ✅ Files > 10MB rejected with error
- ✅ Error message shows size limit

### Test 5.3: PDF Generation Speed
**Objective**: Measure PDF generation time

**Steps**:
1. Generate simple resume (1 page)
2. Generate complex resume (2+ pages)

**Expected Times**:
- 1 page: < 5 seconds
- 2+ pages: < 10 seconds

### Test 5.4: Concurrent Operations
**Objective**: Test multiple simultaneous operations

**Steps**:
1. Open two browser tabs
2. Tab 1: Start resume analysis
3. Tab 2: Generate project suggestions (immediately)
4. Wait for both to complete

**Expected Results**:
- ✅ Both operations complete successfully
- ✅ No errors or conflicts
- ✅ Results appear in correct tabs

---

## Bug Reporting Template

If you find issues during testing, report them using this template:

```markdown
### Bug Report

**Feature**: [Resume Evaluator / Resume Generator / Project Builder]
**Severity**: [Critical / High / Medium / Low]

**Description**:
[Clear description of the issue]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Environment**:
- Browser: [Chrome / Firefox / Safari]
- Version: [Browser version]
- OS: [Windows / macOS / Linux]

**Console Errors**:
```
[Paste any console errors here]
```

**Screenshots**:
[Attach screenshots if applicable]
```

---

## Success Criteria

All features pass testing when:
- ✅ No critical bugs
- ✅ All AI calls return valid responses
- ✅ PDFs generate correctly with all themes
- ✅ Career Graph logs all activities
- ✅ UI is responsive on mobile/tablet/desktop
- ✅ Error handling works gracefully
- ✅ Performance is within acceptable ranges

---

## Testing Tools

### Browser DevTools
- **Console**: Check for errors
- **Network**: Monitor API calls
- **Performance**: Measure load times
- **Responsive**: Test mobile layouts

### VS Code Extensions
- **ESLint**: Check code quality
- **Prettier**: Verify formatting
- **TypeScript**: Check types

### Testing Commands
```bash
# Run development server
npm run dev

# Build production bundle
npm run build

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

---

## Post-Testing Checklist

After completing all tests:
- [ ] All test suites passed
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Production build successful
- [ ] Firebase rules configured
- [ ] Environment variables set
- [ ] README updated with feature list

---

## 🎉 Ready to Ship!

Once all tests pass, your CareerLens application is production-ready!

**Next Steps**:
1. Deploy to Firebase Hosting
2. Monitor user feedback
3. Iterate on AI prompts based on results
4. Add analytics to track usage
5. Plan next feature: Voice Mode or Gamification!
