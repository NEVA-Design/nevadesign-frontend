import type { Metadata } from "next";
import LandingPage from "@/components/solutions/LandingPage";
import { landingMetadata } from "@/lib/landing-metadata";
import { getLanding } from "@/lib/landings";

const SLUG = "generateur-de-logo";

export const metadata: Metadata = landingMetadata(SLUG);

export default function Page() {
  return <LandingPage landing={getLanding(SLUG)!} />;
}