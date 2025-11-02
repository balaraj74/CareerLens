# Quick Start Guide - New Features

## 🚀 Getting Started

Start the development server:
```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## 1️⃣ Community Reviews (`/community`)

### What You Can Do:
- ✅ Browse student reviews for KCET, NEET, JEE, COMEDK, GATE exams
- ✅ Read college reviews from verified students
- ✅ Submit your own review (with AI moderation)
- ✅ Vote on helpful reviews (upvote/downvote)
- ✅ Search for specific colleges or keywords

### How to Use:

**Browse Reviews:**
1. Visit `/community`
2. Click category tabs (KCET, NEET, JEE, etc.) to filter
3. Use search bar to find specific colleges
4. Read reviews and vote on helpful ones

**Submit a Review:**
1. Click "Share Your Review" button
2. Fill out the form:
   - Title (e.g., "KCET 2024 - My Experience")
   - Category (KCET, NEET, JEE, etc.)
   - Rating (1-5 stars)
   - College (optional)
   - Year (optional)
   - Review content (your experience)
3. Click "Submit Review"
4. AI will moderate content (blocks spam/hate)
5. Review appears instantly if approved

**Mock Data:**
- 5 demo reviews pre-loaded for testing
- Try different categories to see examples

---

## 2️⃣ Free Resource Hub (`/resources`)

### What You Can Do:
- ✅ Get AI-powered course recommendations based on your profile
- ✅ Browse 10+ curated free courses
- ✅ Filter by provider (NPTEL, Coursera, AWS, GCP, edX)
- ✅ Filter by difficulty (Beginner, Intermediate, Advanced)
- ✅ Search for specific topics
- ✅ Enroll directly with one click

### How to Use:

**Get AI Recommendations:**
1. Visit `/resources`
2. Click "AI Recommendations" button (requires login)
3. AI analyzes your profile:
   - Current skills
   - Career goals
   - Skill gaps
4. Recommends 5 best-fit courses
5. Marked with "AI Pick" badge

**Browse Curated Courses:**
1. View 10 pre-loaded courses
2. Click provider buttons to filter (NPTEL, Coursera, AWS, GCP, edX)
3. Click difficulty buttons (Beginner, Intermediate, Advanced)
4. Use search bar for keywords (e.g., "machine learning", "cloud")
5. Click "View Course" to enroll

**Course Platforms:**
- **NPTEL** - Indian government, free certificates
- **Coursera** - Audit option, free access
- **AWS Educate** - Cloud computing, free
- **Google Cloud Skills Boost** - GCP, free
- **edX** - MIT, Harvard courses

**Sample Courses:**
- Data Structures and Algorithms (NPTEL)
- Machine Learning (Coursera - Andrew Ng)
- Google IT Support (Free)
- CS50 (Harvard)
- AWS Cloud Practitioner

---

## 3️⃣ Mentor Chat (`/mentors`)

### What You Can Do:
- ✅ Browse industry experts from Google, Microsoft, Amazon, Meta, Netflix
- ✅ Chat in real-time with mentors
- ✅ Book mentorship sessions
- ✅ Auto-sync sessions with AI Calendar
- ✅ Get meeting links for video calls

### How to Use:

**Browse Mentors:**
1. Visit `/mentors`
2. View mentor cards:
   - Profile photo
   - Name, title, company
   - Expertise (System Design, ML, DevOps, etc.)
   - Rating (out of 5 stars)
   - Sessions completed
   - Hourly rate (or FREE)
   - Availability status

**Start a Chat:**
1. Click "Chat" button on mentor card
2. Real-time chat opens
3. Send messages instantly
4. Mentor replies appear in real-time (Firestore onSnapshot)
5. Chat history saved automatically

**Book a Session:**
1. Click "Book" button on mentor card OR
2. Click "Book Session" in active chat
3. Fill booking form:
   - Session title
   - Date & time
   - Duration (30/60/90 minutes)
   - Notes/agenda
4. Click "Book Session"
5. Session auto-adds to AI Calendar (`/calendar`)
6. Receive Google Meet link

**Available Mentors:**

1. **Dr. Rajesh Kumar** (Google)
   - System Design, Backend
   - 4.9★ | ₹2000/hr | Available

2. **Priya Sharma** (Microsoft)
   - Machine Learning, AI
   - 4.8★ | FREE | Available

3. **Amit Patel** (Amazon)
   - Full Stack, AWS
   - 4.7★ | ₹1500/hr | Available

4. **Sneha Reddy** (Meta)
   - Product Management
   - 4.9★ | FREE | Available

5. **Karthik Menon** (Netflix)
   - DevOps, Kubernetes
   - 4.6★ | ₹1800/hr | Busy

**Chat Features:**
- Real-time messaging (Firestore)
- Message history
- Timestamp display
- User vs mentor bubble design
- Active conversations list
- AI-powered chat summaries

---

## 🔐 Authentication

**Required for:**
- Submitting reviews
- AI recommendations
- Chatting with mentors
- Booking sessions

**Not Required for:**
- Browsing reviews
- Viewing resources
- Viewing mentor profiles

---

## 🤖 AI Features

### 1. Content Moderation (Reviews)
- Automatically checks review content
- Blocks spam, hate speech, inappropriate content
- Uses Gemini AI safety filters
- Try submitting spam to test!

### 2. Course Recommendations (Resources)
- Analyzes your profile data
- Identifies skill gaps
- Recommends 5 best courses
- Prioritizes free options
- Uses Gemini 2.5 Flash

### 3. Chat Summaries (Mentor Chat)
- Coming soon: Summarize long conversations
- Extract key action items
- Track mentorship progress

---

## 📱 Navigation

Find the new features in the sidebar:

```
├─ Dashboard
├─ Profile
├─ AI Calendar
├─ ...
├─ Community          ← NEW! (Users icon)
├─ Resources          ← NEW! (GraduationCap icon)
└─ Find Mentor        ← NEW! (MessageCircle icon)
```

---

## 🔥 Real-Time Features

**What's Real-Time:**
- ✅ Community reviews (instant voting updates)
- ✅ Mentor chat messages (instant delivery)
- ✅ Chat room list updates
- ✅ Resource recommendations (cached)

**Powered by:**
- Firestore onSnapshot listeners
- Real-time database synchronization

---

## 🧪 Testing Tips

### Test Community Reviews:
```bash
# Try these:
1. Browse different categories
2. Submit a review with clean content (should work)
3. Submit spam like "Buy now! Click here!" (AI blocks it)
4. Vote on existing reviews (upvote/downvote)
5. Search for "IIT" or "Engineering"
```

### Test Resource Hub:
```bash
# Try these:
1. Browse all courses
2. Filter by NPTEL only
3. Filter by Beginner level
4. Search for "machine learning"
5. Click "AI Recommendations" (requires login)
6. Click "View Course" to visit platform
```

### Test Mentor Chat:
```bash
# Try these:
1. Browse all 5 mentors
2. Click "Chat" on Priya Sharma (FREE mentor)
3. Send a message: "Hello! Need career advice"
4. Check "My Chats" tab
5. Click "Book Session" to schedule
6. Check AI Calendar (/calendar) for new event
```

---

## 🐛 Troubleshooting

**Reviews not appearing?**
- Check if AI moderation blocked it (spam content)
- Ensure you're logged in
- Check browser console for errors

**AI Recommendations not working?**
- Ensure you're logged in
- Check if Gemini API key is in `.env.local`
- Verify profile has skills and goals filled

**Chat messages not real-time?**
- Check Firebase connection
- Verify Firestore rules are deployed
- Ensure user is authenticated

**Build errors?**
- Run `npm install` to install dependencies
- Check `.env.local` has all required keys
- Clear `.next` folder and rebuild

---

## 📊 Data Flow

### Community Reviews:
```
User → Submit Review → AI Moderation (Gemini) → Firestore → Display
                ↓
        Blocked if unsafe
```

### Resource Hub:
```
User → Click "AI Recommendations" → Fetch Profile → Gemini Analysis → 5 Courses
                                                              ↓
                                                        Cache in Firestore
```

### Mentor Chat:
```
User → Send Message → Firestore → Real-time Listener → Mentor Receives
                         ↓
                  onSnapshot updates UI instantly
```

---

## 🚀 Next Steps

1. **Try all 3 features** to see them in action
2. **Test real-time chat** by opening two browser windows
3. **Submit reviews** with different content (clean vs spam)
4. **Get AI recommendations** based on your profile
5. **Book a mentor session** and check AI Calendar

---

## 💡 Pro Tips

**Community:**
- Use specific categories to find relevant reviews
- Search for your target college name
- Upvote helpful reviews to build community trust

**Resources:**
- Get AI recommendations for personalized learning paths
- Filter by "Beginner" if you're just starting
- NPTEL courses have Indian context and free certificates

**Mentors:**
- Start with FREE mentors (Priya, Sneha)
- Book sessions during weekdays for better availability
- Prepare questions before booking sessions
- Check mentor expertise before chatting

---

## 📞 Support

Need help?
- Check `/docs/NEW_FEATURES_SUMMARY.md` for detailed docs
- Review service files in `/src/lib/` for backend logic
- Check page files in `/src/app/` for UI code

---

**Happy Learning! 🎓**
