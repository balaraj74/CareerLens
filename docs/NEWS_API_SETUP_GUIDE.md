# 📰 News API Setup Guide

## Overview
This guide will help you set up the **NewsAPI.org** integration for the CareerLens News feature.

## 🔗 Get Your API Key

### **NewsAPI.org** (Recommended - FREE Tier Available)

1. **Visit**: [https://newsapi.org/register](https://newsapi.org/register)

2. **Sign Up** with your email address

3. **Verify your email** - Check your inbox and click the verification link

4. **Get Your API Key** - After verification, you'll see your API key on the dashboard at:
   - [https://newsapi.org/account](https://newsapi.org/account)

5. **Copy your API Key** - It will look something like this:
   ```
   a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

### Free Tier Limits
- ✅ **1,000 requests per day**
- ✅ **Live news coverage**
- ✅ **Access to 150,000+ sources**
- ✅ **Search historical articles** (up to 1 month)
- ⚠️ Development use only (cannot be used in production with free tier)

---

## 🔧 Add API Key to Your Project

### Option 1: Manual Addition (Recommended)

1. Open the file: `.env.local` in your CareerLens project root

2. Add this line at the end of the file:
   ```bash
   # News API Key (from newsapi.org)
   NEWS_API_KEY=YOUR_API_KEY_HERE
   ```

3. Replace `YOUR_API_KEY_HERE` with your actual API key from NewsAPI.org

4. **Save the file**

### Option 2: Using Terminal

Run this command from your project root (replace with your actual key):

```bash
echo "
# News API Key (from newsapi.org)
NEWS_API_KEY=YOUR_ACTUAL_API_KEY_HERE" >> .env.local
```

---

## 🧪 Testing the Integration

### 1. Restart Your Development Server

Press `Ctrl+C` in your terminal running `npm run dev`, then restart:

```bash
npm run dev
```

### 2. Visit the News Page

Open your browser and navigate to:
```
http://localhost:3000/news
```

### 3. Check for Success

You should see:
- ✅ News articles loading
- ✅ Different categories (Technology, Business, Sports, etc.)
- ✅ Indian and Global news options
- ✅ Search functionality working

### 4. Common Issues

**Error: "News API is not configured"**
- ✅ **Solution**: Make sure you added `NEWS_API_KEY` to `.env.local`
- ✅ **Solution**: Restart your dev server after adding the key
- ✅ **Solution**: Verify no typos in the key or variable name

**Error: "API key invalid"**
- ✅ **Solution**: Double-check you copied the entire API key
- ✅ **Solution**: Verify your email on NewsAPI.org
- ✅ **Solution**: Make sure the key is still active on your dashboard

**Error: "Rate limit exceeded"**
- ✅ **Solution**: You've hit the 1,000 requests/day limit on free tier
- ✅ **Solution**: Wait until tomorrow or upgrade your plan

---

## 📚 API Features Being Used

The news integration uses:

1. **Everything Endpoint** - For flexible news searches
   - Search by keywords
   - Filter by language (English)
   - Sort by publish date
   - Up to 20 articles per request

2. **Categories Supported**:
   - General
   - Technology
   - Business
   - Sports
   - Entertainment
   - Science
   - Health

3. **Regions**:
   - Indian news (searches for India-specific content)
   - Global news

---

## 🔒 Security Best Practices

1. ✅ **Never commit `.env.local` to Git** - It's already in `.gitignore`

2. ✅ **Use environment variables** - Don't hardcode API keys in code

3. ✅ **Rotate keys periodically** - You can regenerate keys on NewsAPI.org dashboard

4. ✅ **Monitor usage** - Check your API usage on the NewsAPI dashboard

---

## 📖 Alternative Option: GNews API

If you prefer a different provider, you can also use **GNews.io**:

1. **Visit**: [https://gnews.io/register](https://gnews.io/register)
2. **Free Tier**: 100 requests/day
3. **Setup**: Similar process, but you'd need to modify `/src/app/api/news/route.ts`

---

## 🎯 Next Steps

After setup:

1. ✅ Test the news page at `http://localhost:3000/news`
2. ✅ Try different categories
3. ✅ Test the search functionality
4. ✅ Switch between Indian and Global news
5. ✅ Check article links open correctly

---

## 📞 Need Help?

If you encounter any issues:

1. Check the browser console for errors (F12)
2. Check the terminal/server logs
3. Verify your `.env.local` file has the correct format
4. Make sure there are no extra spaces or quotes around the API key

---

## ✅ Example `.env.local` Entry

Your `.env.local` file should look like this (with your actual key):

```bash
# ... other environment variables ...

# News API Key (from newsapi.org)
NEWS_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

**🎉 That's it! Your News API integration is ready!**
