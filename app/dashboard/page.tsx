import Link from "next/link";
import { ArrowRight, ShieldPlus, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardHomePage() {
  return (
    <>
      <section className="space-y-4">
        <Badge className="rounded-full px-4 py-1.5">Overview</Badge>
        <h1 className="text-3xl font-semibold text-slate-950">
          Your triage overview
        </h1>
        <p className="max-w-3xl text-base text-slate-600">
          Move between your check-up, questions, results, emergency help, history,
          and a fast quick check
          path.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Start with your profile</CardTitle>
            <CardDescription className="text-base">
              Persistent patient data is stored once and reused across every future
              triage session.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              Age, gender, weight, and height are kept separate from session vitals.
            </div>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/profile">
                Open Profile
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Quick Check</CardTitle>
            <CardDescription className="text-base">
              Jump straight into fast live-vitals entry for a streamlined triage
              start.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/quick-checkup">
                <ShieldPlus className="size-4" />
                Launch Quick Check
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Profile First",
            description: "Complete persistent patient data before ongoing clinical sessions.",
            href: "/dashboard/profile",
            icon: <UserRound className="size-4" />,
          },
          {
            title: "Live Session Input",
            description: "Manual entry today, future-ready for Arduino or device vitals.",
            href: "/dashboard/session",
            icon: <ShieldPlus className="size-4" />,
          },
          {
            title: "Structured Review",
            description: "See results, emergency actions, and saved session history on dedicated pages.",
            href: "/dashboard/history",
            icon: <ArrowRight className="size-4" />,
          },
        ].map((item) => (
          <Card key={item.title} className="border-slate-200/80 bg-white/95 shadow-sm">
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                {item.icon}
              </div>
              <CardTitle className="pt-3 text-lg">{item.title}</CardTitle>
              <CardDescription className="text-base">{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="rounded-full">
                <Link href={item.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
