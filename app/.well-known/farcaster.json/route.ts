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
  const appUrl = process.env.NEXT_PUBLIC_URL || "https://gm-streak-tracker.vercel.app";

  return NextResponse.json({
    accountAssociation: {
      header: "eyJmaWQiOjU0NzMyMSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDRGNThhMUNlMzIwNGM1MGFkMGRjREZjNGE0ODJlRTI4MjE0NmRmRkIifQ",
      payload: "eyJkb21haW4iOiJnbS1zdHJlYWstdHJhY2tlci52ZXJjZWwuYXBwIn0",
      signature: "+3E9LIGbcwM3X0vc4+CohbO7VG9hnT2Hkqtb7nxrQk5dER/oKUX5DC3EtEzZlZoSDOk8E0QopkO1z3/mjI2Qdxs=",
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
