import dynamic from "next/dynamic";

// Dynamically import the client component with SSR disabled.
// MiniKit hooks require browser context and fail during static generation.
const GmTracker = dynamic(() => import("./gm-tracker"), { ssr: false });

export default function Home() {
  return <GmTracker />;
}
