import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  type Lane,
  profile,
  projects,
  proofPoints,
  resumeHighlights,
  skills,
} from "@/data/sourceBank";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Clock,
  Github,
  Link2,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

const laneKeywords: Record<Lane, string[]> = {
  Enablement: ["enablement", "onboarding", "talent", "workforce", "manager"],
  "AI Operations": ["ai", "automation", "rag", "agent", "workflow", "python"],
  "Learning Experience": [
    "learning",
    "instructional",
    "lxd",
    "training",
    "curriculum",
  ],
  "Technical Product": ["product", "platform", "app", "technical", "systems"],
  "Sales Enablement": ["sales", "customer", "revenue", "gtm", "meddpicc"],
  Compliance: ["compliance", "508", "wcag", "audit", "regulated", "governance"],
};

const sampleJd =
  "Principal Enablement role owning AI-assisted workflows, technical onboarding, sales readiness, stakeholder alignment, learning operations, compliance, and measurable business outcomes.";

function detectLanes(text: string): Lane[] {
  const normalized = text.toLowerCase();
  const scored = Object.entries(laneKeywords)
    .map(([lane, words]) => ({
      lane: lane as Lane,
      score: words.filter((word) => normalized.includes(word)).length,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return ["Enablement", "AI Operations", "Learning Experience"];
  }

  return scored.slice(0, 3).map((item) => item.lane);
}

function scoreProject(projectLanes: Lane[], selectedLanes: Lane[]) {
  return projectLanes.reduce(
    (score, lane) => score + (selectedLanes.includes(lane) ? 1 : 0),
    0,
  );
}

function makeToken(company: string) {
  const base = company
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  return `${base || "target"}-${Math.random().toString(36).slice(2, 8)}`;
}

export function TailoredPortfolioStudio() {
  const [company, setCompany] = useState("Target Company");
  const [jd, setJd] = useState(sampleJd);
  const [links, setLinks] = useState<
    Array<{ token: string; company: string; lanes: Lane[]; expires: string }>
  >([]);

  const selectedLanes = useMemo(
    () => detectLanes(`${company} ${jd}`),
    [company, jd],
  );
  const tailoredProjects = useMemo(
    () =>
      [...projects]
        .sort(
          (a, b) =>
            scoreProject(b.lanes, selectedLanes) -
            scoreProject(a.lanes, selectedLanes),
        )
        .slice(0, 4),
    [selectedLanes],
  );
  const tailoredMetrics = proofPoints.filter((metric) =>
    metric.lanes.some((lane) => selectedLanes.includes(lane)),
  );
  const tailoredSkills = skills.filter((skill) => {
    const normalized = skill.toLowerCase();
    return selectedLanes.some((lane) =>
      laneKeywords[lane].some((keyword) => normalized.includes(keyword)),
    );
  });

  const createLink = () => {
    const expires = new Date();
    expires.setDate(expires.getDate() + 21);
    setLinks((current) => [
      {
        token: makeToken(company),
        company,
        lanes: selectedLanes,
        expires: expires.toLocaleDateString(),
      },
      ...current,
    ]);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-[radial-gradient(circle_at_top_left,_rgba(229,190,105,0.16),_transparent_34%),linear-gradient(135deg,_rgba(17,24,39,0.9),_rgba(10,10,10,1))]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-16">
          <div className="space-y-7">
            <Badge className="w-fit" variant="outline">
              Living portfolio system
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
                {profile.name}
              </h1>
              <p className="text-xl text-primary">{profile.title}</p>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                {profile.headline}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {proofPoints.slice(0, 3).map((metric) => (
                <div
                  key={metric.label}
                  className="border-l border-primary/50 pl-4"
                >
                  <p className="font-display text-2xl font-semibold">
                    {metric.value}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-border/80 bg-card/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Tailor the view
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block space-y-2" htmlFor="target-company">
                <span className="text-sm font-medium">Company</span>
                <input
                  id="target-company"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              </label>
              <label className="block space-y-2" htmlFor="target-jd">
                <span className="text-sm font-medium">
                  Job description / signal
                </span>
                <Textarea
                  id="target-jd"
                  value={jd}
                  onChange={(event) => setJd(event.target.value)}
                  className="min-h-36"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedLanes.map((lane) => (
                  <Badge key={lane}>{lane}</Badge>
                ))}
              </div>
              <Button type="button" onClick={createLink} className="w-full">
                <Link2 className="mr-2 h-4 w-4" />
                Create tailored link
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[0.82fr_1.18fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5 text-primary" />
              Lean resume story
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-6 text-muted-foreground">
              {profile.shortSummary}
            </p>
            <div className="space-y-3">
              {resumeHighlights.map((item) => (
                <p
                  key={item}
                  className="rounded-md border border-border p-3 text-sm"
                >
                  {item}
                </p>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(tailoredSkills.length > 0
                ? tailoredSkills
                : skills.slice(0, 10)
              ).map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {tailoredMetrics.slice(0, 4).map((metric) => (
              <Card key={metric.label}>
                <CardContent className="p-5">
                  <p className="font-display text-3xl font-semibold">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {metric.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4">
            {tailoredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>{project.title}</CardTitle>
                      <p className="mt-1 text-sm text-primary">
                        {project.role}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.lanes.map((lane) => (
                        <Badge key={lane} variant="outline">
                          {lane}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {project.summary}
                  </p>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Problem
                      </p>
                      <p className="mt-2 text-sm">{project.problem}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Moves
                      </p>
                      <ul className="mt-2 space-y-1 text-sm">
                        {project.actions.slice(0, 2).map((action) => (
                          <li key={action}>{action}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Outcome
                      </p>
                      <ul className="mt-2 space-y-1 text-sm">
                        {project.outcomes.slice(0, 2).map((outcome) => (
                          <li key={outcome}>{outcome}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary"
                    >
                      <Github className="h-4 w-4" />
                      Repository
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LockKeyhole className="h-5 w-5 text-primary" />
                Link controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              {links.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Create a tailored link to track company-specific views,
                  expiration, and archive status.
                </p>
              ) : (
                <div className="space-y-3">
                  {links.map((link) => (
                    <div
                      key={link.token}
                      className="rounded-md border border-border p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{link.company}</span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {link.expires}
                        </span>
                      </div>
                      <p className="mt-2 break-all text-muted-foreground">
                        /share/{link.token}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Source bank coverage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Resume, LinkedIn, GitHub projects, Caffeine apps, AI workflows,
                enterprise enablement wins, and legacy portfolio content feed
                this view.
              </p>
              <p>
                Next backend step after clean deployment: persist tailored
                links, archive status, source-bank records, screenshots, and
                company-specific visual settings in Motoko stable storage.
              </p>
              <p>
                Contact: <a href={`mailto:${profile.email}`}>{profile.email}</a>{" "}
                ·{" "}
                <a href={profile.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>{" "}
                ·{" "}
                <a href={profile.linkedIn} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
