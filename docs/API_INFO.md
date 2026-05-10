# CareerLens Data Scraping & API Info

You requested information about the API used to scrape career websites.

## Current Implementation
We are using the **Google Custom Search JSON API** to "scrape" results from various job portals. This is a legitimate and reliable way to get search results from specific websites without violating their direct scraping policies (which often leads to IP bans).

### How it works
Instead of visiting `linkedin.com` directly (which blocks bots), we ask Google: *"Show me the latest job pages from site:linkedin.com/jobs"*. Google returns the title, snippet, and link, which we then process.

## API Details
- **Name**: Google Custom Search JSON API
- **Cost**: Free for the first 100 queries/day. Paid after that ($5 per 1000 queries).
- **Documentation**: [https://developers.google.com/custom-search/v1/overview](https://developers.google.com/custom-search/v1/overview)

### How to get your own Key (for free)
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  Enable the **"Custom Search API"**.
4.  Go to **Credentials** and create an **API Key**.
5.  Go to [Programmable Search Engine](https://programmablesearchengine.google.com/).
6.  Create a search engine, select "Search the entire web" (or specific sites), and get your **Search Engine ID (cx)**.

## Updating the App
If you have a new key, update your `.env.local` file:

```bash
GOOGLE_CUSTOM_SEARCH_API_KEY=AIzaSy... (Your New Key)
GOOGLE_SEARCH_ENGINE_ID=012345... (Your New Search Engine ID)
```

## Alternative "Real" Scraping APIs
If you want to scrape the actual HTML content of pages (not just Google results), you would need a specialized scraping API. These usually have a free tier but are paid for higher volume.

1.  **Bright Data**: [https://brightdata.com/](https://brightdata.com/)
2.  **ScrapingBee**: [https://www.scrapingbee.com/](https://www.scrapingbee.com/)
3.  **ZenRows**: [https://www.zenrows.com/](https://www.zenrows.com/)

To use these, we would need to rewrite the `fetchGoogleCareerSearch` function to call these APIs instead.
