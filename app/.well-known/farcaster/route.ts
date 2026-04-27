import { NextResponse } from "next/server";

/**
 * Farcaster Mini App Manifest
 * 
 * This route serves the manifest at /.well-known/farcaster
 * The accountAssociation fields (header, payload, signature) must be filled in
 * after signing your manifest using the tool at:
 * https://miniapps.farcaster.xyz/manifest-tool
 * 
 * Once signed, paste the header, payload, and signature values below.
 */
export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || "https://your-app.vercel.app";

  return NextResponse.json({
    accountAssociation: {
      // ⚠️ REPLACE these with your signed values from the manifest tool
      header: process.env.FARCASTER_HEADER || "",
      payload: process.env.FARCASTER_PAYLOAD || "",
      signature: process.env.FARCASTER_SIGNATURE || "",
    },
    frame: {
      version: "1",
      name: "GM Streak Tracker",
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#0a0a0a",
      subtitle: "Say GM every day!",
      description: "Build your daily GM streak and share it on Farcaster!",
    },
  });
}
