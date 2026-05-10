# 🚀 Quick Start - News API Setup

## ⚡ 3-Step Setup

### Step 1️⃣: Get Your API Key
**Go to**: [https://newsapi.org/register](https://newsapi.org/register)

1. Enter your email
2. Click "Sign Up"
3. Check your email and verify
4. Copy your API key from [https://newsapi.org/account](https://newsapi.org/account)

---

### Step 2️⃣: Add to Environment File

Open `.env.local` and replace this line:

```bash
NEWS_API_KEY=
```

With your actual key:

```bash
NEWS_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

### Step 3️⃣: Restart Server

In your terminal:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✅ Test It

Visit: **http://localhost:3000/news**

You should see news articles loading!

---

## 📋 What You Get (FREE Tier)

- ✅ 1,000 requests per day
- ✅ 150,000+ news sources
- ✅ Global & Indian news
- ✅ Multiple categories
- ✅ Search functionality
- ✅ Real-time updates

---

## ❌ Troubleshooting

**Still seeing error?**

1. ✅ Check `.env.local` file has no typos
2. ✅ Make sure you restarted the dev server
3. ✅ Verify your email on NewsAPI.org
4. ✅ Check no extra spaces around the API key

**Invalid API key?**

1. ✅ Copy the entire key from NewsAPI dashboard
2. ✅ Make sure email is verified
3. ✅ Try generating a new key

---

## 📖 Full Documentation

For detailed instructions, see: **NEWS_API_SETUP_GUIDE.md**

---

**That's it! 🎉**
