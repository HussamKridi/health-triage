import Link from "next/link";
import { Hospital, PhoneCall } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TriageSession } from "@/types";

export function EmergencyAssistance({
  session,
}: {
  session: TriageSession | null;
}) {
  if (session?.status !== "completed" || session.finalResult?.riskLabel !== "High") {
    return null;
  }

  return (
    <Card
      id="emergency-assistance"
      className="border-red-200 bg-[linear-gradient(135deg,rgba(254,242,242,0.9),rgba(255,255,255,1))] shadow-sm"
    >
      <CardHeader>
        <CardTitle className="text-xl text-red-700">Emergency Assistance</CardTitle>
        <CardDescription className="mt-2 text-base text-red-700/80">
          High-risk results surface emergency tools immediately so users can move to
          the next safe action without searching elsewhere.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="h-11 rounded-full bg-red-600 px-6 text-white hover:bg-red-700">
          <a href="tel:112">
            <PhoneCall className="size-4" />
            Call Emergency (112)
          </a>
        </Button>
        <Button asChild variant="outline" className="h-11 rounded-full px-6">
          <Link href="https://www.google.com/maps/search/nearby+hospitals" target="_blank">
            <Hospital className="size-4" />
            Nearby Hospitals
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
