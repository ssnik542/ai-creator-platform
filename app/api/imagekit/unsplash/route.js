import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=12`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch images from Unsplash");
    }

    const data = await res.json();

    const results = (data.results || []).map((img) => ({
      id: img.id,
      thumb: img.urls.small,
      url: img.urls.full,
      alt: img.alt_description,
      attribution: {
        photographer: img.user.name,
        profile: img.user.links.html,
        source: "Unsplash",
      },
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Unsplash search error:", error);
    return NextResponse.json(
      { error: error.message || "Unsplash search failed" },
      { status: 500 }
    );
  }
}
