# 🔧 Enable Places API - Quick Guide

## ⚠️ Current Issue

The Library Finder feature is showing this error:
```
Places API has not been used in project 202306950137 before or it is disabled
```

## ✅ Solution: Enable Places API

### **Step 1: Open Google Cloud Console**

Click this direct link to enable Places API:
```
https://console.cloud.google.com/apis/library/places-backend.googleapis.com?project=202306950137
```

Or manually:
1. Go to: https://console.cloud.google.com/
2. Select project: **careerlens-1** (ID: 202306950137)
3. Navigate to: **APIs & Services** → **Library**
4. Search for: **"Places API"**

### **Step 2: Enable the API**

1. Click on **"Places API"** in the search results
2. Click the **"Enable"** button
3. Wait for the confirmation message
4. ✅ You should see "API enabled" status

### **Step 3: Verify Other Required APIs**

Make sure these APIs are also enabled:

#### **1. Maps JavaScript API**
Direct link:
```
https://console.cloud.google.com/apis/library/maps-backend.googleapis.com?project=202306950137
```

#### **2. Geolocation API** (for location detection)
Direct link:
```
https://console.cloud.google.com/apis/library/geolocation.googleapis.com?project=202306950137
```

### **Step 4: Wait for Propagation**

⏰ **Important:** After enabling APIs, wait **2-3 minutes** for changes to propagate across Google's systems.

### **Step 5: Test the Feature**

1. Refresh your browser: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
2. Go to: http://localhost:3000/library-finder
3. Click **"Find Libraries Near Me"**
4. Allow location permission
5. ✅ Libraries should now appear on the map!

---

## 🔑 API Key Configuration

Your API key is already configured in `.env`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCCovOlhJubYYE5iZ5I2AGk_roWOUVa5LU
```

### **Restrict API Key (Security Best Practice)**

To prevent unauthorized use:

1. Go to: https://console.cloud.google.com/apis/credentials?project=202306950137
2. Click on your API key
3. Under **"API restrictions"**, select **"Restrict key"**
4. Check these APIs:
   - ✅ Maps JavaScript API
   - ✅ Places API
   - ✅ Geolocation API
5. Under **"Application restrictions"**, select **"HTTP referrers"**
6. Add these referrers:
   ```
   http://localhost:3000/*
   https://careerlens-1.web.app/*
   https://careerlens--careerlens-1.us-central1.hosted.app/*
   ```
7. Click **"Save"**

---

## 💰 Billing Requirements

Google Maps Platform requires billing to be enabled, but offers:
- 💵 **$200 free credit per month**
- 🆓 **Places API**: First 28,000 requests/month free
- 🆓 **Maps JavaScript API**: Free (unlimited)
- 🆓 **Geolocation API**: 40,000 requests/month free

### **Enable Billing:**

1. Go to: https://console.cloud.google.com/billing?project=202306950137
2. Link a billing account
3. Set up budget alerts (recommended):
   - Budget: $10/month
   - Alert threshold: 50%, 90%, 100%

---

## 🐛 Troubleshooting

### **"API key not valid" error**

**Solution:**
1. Check if API key is correct in `.env`
2. Verify API key restrictions don't block localhost
3. Try creating a new API key

### **"Request denied" error**

**Solution:**
1. Ensure Places API is enabled (Step 1)
2. Wait 2-3 minutes after enabling
3. Check billing is active
4. Clear browser cache and refresh

### **"Quota exceeded" error**

**Solution:**
1. Check quota limits: https://console.cloud.google.com/apis/api/places-backend.googleapis.com/quotas?project=202306950137
2. Increase quotas if needed
3. Wait for quota reset (resets daily)

### **No libraries showing on map**

**Possible causes:**
- Location permission denied
- No libraries within 5km radius
- API quota exceeded
- Invalid API key

**Solution:**
1. Enable location permission in browser
2. Try searching in a city center
3. Check browser console for errors
4. Verify API key is valid

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] Places API enabled in Google Cloud Console
- [ ] Maps JavaScript API enabled
- [ ] Geolocation API enabled (optional, but recommended)
- [ ] Billing account linked
- [ ] API key configured in `.env`
- [ ] Waited 2-3 minutes after enabling APIs
- [ ] Browser refreshed with hard reload
- [ ] Location permission allowed in browser

---

## 📊 API Usage Monitoring

Monitor your API usage:
```
https://console.cloud.google.com/apis/api/places-backend.googleapis.com/metrics?project=202306950137
```

Set up alerts:
1. Go to: https://console.cloud.google.com/monitoring?project=202306950137
2. Create alert policy
3. Metric: API requests
4. Threshold: 80% of quota
5. Notification: Email

---

## 🔗 Useful Links

- **Google Cloud Console:** https://console.cloud.google.com/
- **Places API Documentation:** https://developers.google.com/maps/documentation/places/web-service
- **Maps JavaScript API:** https://developers.google.com/maps/documentation/javascript
- **Pricing Calculator:** https://mapsplatform.google.com/pricing/
- **Billing Dashboard:** https://console.cloud.google.com/billing?project=202306950137

---

## 📝 Summary

**Quick Steps:**
1. ✅ Enable Places API: https://console.cloud.google.com/apis/library/places-backend.googleapis.com?project=202306950137
2. ⏰ Wait 2-3 minutes
3. 🔄 Refresh browser
4. 🧪 Test at: http://localhost:3000/library-finder

**Status After Fix:**
- ✅ Places API enabled
- ✅ Location detection working
- ✅ Libraries showing on map
- ✅ Get Directions working

---

**Last Updated:** November 15, 2025
**Project:** CareerLens (careerlens-1)
**Project ID:** 202306950137
