import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

// Search MusicBrainz for albums and resolve cover art via Cover Art Archive
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    if (!q) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only "album" primary type, limit 10
    const mbUrl = `https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(
      q,
    )}%20AND%20primarytype:album&limit=10&fmt=json`;

    const mbRes = await fetch(mbUrl, {
      headers: {
        // MusicBrainz requires a meaningful User-Agent
        "User-Agent": "Sonera/1.0 ( https://sonera.app )",
        Accept: "application/json",
      },
    });

    if (!mbRes.ok) {
      return new Response(
        JSON.stringify({ error: `MusicBrainz error: ${mbRes.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const mbData = await mbRes.json();
    const groups = (mbData["release-groups"] ?? []) as any[];

    const results = groups.map((g) => {
      const year = g["first-release-date"]
        ? parseInt(String(g["first-release-date"]).slice(0, 4), 10)
        : null;
      const artist = (g["artist-credit"] ?? [])
        .map((ac: any) => ac.name || ac.artist?.name)
        .filter(Boolean)
        .join(", ");
      return {
        mbid: g.id,
        title: g.title,
        artist,
        release_year: Number.isFinite(year) ? year : null,
        // Cover Art Archive serves redirect to image; front-end uses directly
        cover_url: `https://coverartarchive.org/release-group/${g.id}/front-250`,
      };
    });

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});