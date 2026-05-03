/**
 * /api/social-stats
 * Fetches live stats from YouTube Data API v3 and returns cached fallbacks
 * for Instagram (no public API without paid scraping service).
 * 
 * Required env vars (set in Netlify UI → Site config → Environment variables):
 *   YOUTUBE_API_KEY   — Google Cloud Console, YouTube Data API v3
 *   YT_CHANNEL_ID     — Justin's YouTube channel ID
 */

export default async (req) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, s-maxage=3600", // cache 1 hour on CDN
  };

  const YT_KEY = Netlify.env.get("YOUTUBE_API_KEY");
  const YT_CHANNEL = Netlify.env.get("YT_CHANNEL_ID") || "UCJustinHarveyChannel";

  // Fallback values — manually updated when API not available
  const fallback = {
    instagram: {
      followers: "64k",
      weekly_reach: "750k",
      engagement_rate: "48.9%",
      male_audience: "55%",
    },
    youtube: {
      subscribers: "5.5k",
      views_total: null,
    },
    updated: new Date().toISOString(),
    source: "fallback",
  };

  // If no API key, return fallback immediately
  if (!YT_KEY) {
    return new Response(JSON.stringify(fallback), { headers });
  }

  try {
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YT_CHANNEL}&key=${YT_KEY}`
    );
    const ytData = await ytRes.json();
    const stats = ytData?.items?.[0]?.statistics;

    const subs = stats?.subscriberCount
      ? formatCount(parseInt(stats.subscriberCount))
      : fallback.youtube.subscribers;

    const views = stats?.viewCount
      ? formatCount(parseInt(stats.viewCount))
      : null;

    return new Response(
      JSON.stringify({
        instagram: fallback.instagram,
        youtube: {
          subscribers: subs,
          views_total: views,
        },
        updated: new Date().toISOString(),
        source: "live",
      }),
      { headers }
    );
  } catch (err) {
    // On any error, return fallback
    return new Response(JSON.stringify({ ...fallback, error: err.message }), {
      headers,
      status: 200, // still return 200 so site doesn't break
    });
  }
};

function formatCount(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

export const config = {
  path: "/api/social-stats",
};
