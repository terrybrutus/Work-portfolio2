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
  Clipboard,
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

type Analysis = {
  lanes: Lane[];
  matches: Array<{ lane: Lane; terms: string[]; score: number }>;
};

type SharePayload = {
  company: string;
  jd: string;
  lanes: Lane[];
  expires: string;
};

const sampleJd =
  "Principal Enablement role owning AI-assisted workflows, technical onboarding, sales readiness, stakeholder alignment, learning operations, compliance, and measurable business outcomes.";

function analyzeTarget(text: string): Analysis {
  const normalized = text.toLowerCase();
  const matches = Object.entries(laneKeywords)
    .map(([lane, words]) => {
      const terms = words.filter((word) => normalized.includes(word));
      return { lane: lane as Lane, terms, score: terms.length };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    return {
      lanes: ["Enablement", "AI Operations", "Learning Experience"],
      matches: [
        {
          lane: "Enablement",
          terms: ["default"],
          score: 1,
        },
      ],
    };
  }

  return {
    lanes: matches.slice(0, 3).map((item) => item.lane),
    matches,
  };
}

function scoreProject(projectLanes: Lane[], selectedLanes: Lane[]) {
  return projectLanes.reduce(
    (score, lane) => score + (selectedLanes.includes(lane) ? 1 : 0),
    0,
  );
}

function getTailoredModel(company: string, jd: string, lanes?: Lane[]) {
  const analysis = analyzeTarget(`${company} ${jd}`);
  const selectedLanes = lanes && lanes.length > 0 ? lanes : analysis.lanes;
  const selectedProjects = [...projects]
    .sort(
      (a, b) =>
        scoreProject(b.lanes, selectedLanes) -
        scoreProject(a.lanes, selectedLanes),
    )
    .slice(0, 3);
  const selectedMetrics = proofPoints
    .filter((metric) =>
      metric.lanes.some((lane) => selectedLanes.includes(lane)),
    )
    .slice(0, 4);
  const selectedSkills = skills
    .filter((skill) => {
      const normalized = skill.toLowerCase();
      return selectedLanes.some((lane) =>
        laneKeywords[lane].some((keyword) => normalized.includes(keyword)),
      );
    })
    .slice(0, 10);

  return {
    analysis,
    selectedLanes,
    selectedProjects,
    selectedMetrics,
    selectedSkills:
      selectedSkills.length > 0 ? selectedSkills : skills.slice(0, 10),
  };
}

function encodeSharePayload(payload: SharePayload) {
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

function decodeSharePayload(token: string): SharePayload | null {
  try {
    return JSON.parse(decodeURIComponent(atob(token))) as SharePayload;
  } catch {
    return null;
  }
}

function getInitialSharePayload() {
  const hash = window.location.hash;
  if (!hash.startsWith("#/s/")) {
    return null;
  }
  return decodeSharePayload(hash.replace("#/s/", ""));
}

function getInitialStudioMode() {
  return (
    window.location.hash === "#studio" ||
    new URLSearchParams(window.location.search).get("studio") === "1"
  );
}

function buildShareUrl(payload: SharePayload) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = `/s/${encodeSharePayload(payload)}`;
  return url.toString();
}

function ReviewerPortfolio({ payload }: { payload: SharePayload | null }) {
  const company = payload?.company ?? "your team";
  const jd = payload?.jd ?? "";
  const model = getTailoredModel(company, jd, payload?.lanes);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-[linear-gradient(135deg,_rgba(17,24,39,0.92),_rgba(10,10,10,1))]">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <div className="max-w-3xl space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Terry Brutus
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Enablement systems, AI workflows, and learning products for{" "}
              {company}.
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              {profile.shortSummary}
            </p>
            <div className="flex flex-wrap gap-2">
              {model.selectedLanes.map((lane) => (
                <Badge key={lane} variant="outline">
                  {lane}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {model.selectedMetrics.map((metric) => (
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
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-10 lg:grid-cols-[0.78fr_1.22fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5 text-primary" />
              Relevant background
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resumeHighlights.map((item) => (
              <p key={item} className="text-sm leading-6 text-muted-foreground">
                {item}
              </p>
            ))}
            <div className="flex flex-wrap gap-2 pt-2">
              {model.selectedSkills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <h2 className="font-display text-2xl font-semibold">Selected work</h2>
          {model.selectedProjects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{project.title}</CardTitle>
                    <p className="mt-1 text-sm text-primary">{project.role}</p>
                  </div>
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary"
                    >
                      <Github className="h-4 w-4" />
                      Repo
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
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
                      Outcomes
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {project.outcomes.slice(0, 2).map((outcome) => (
                        <li key={outcome}>{outcome}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

export function TailoredPortfolioStudio() {
  const [company, setCompany] = useState("Target Company");
  const [jd, setJd] = useState(sampleJd);
  const [sharePayload] = useState<SharePayload | null>(getInitialSharePayload);
  const [isStudio] = useState(getInitialStudioMode);
  const [links, setLinks] = useState<
    Array<{ url: string; company: string; lanes: Lane[]; expires: string }>
  >([]);

  const model = useMemo(() => getTailoredModel(company, jd), [company, jd]);

  if (!isStudio) {
    return <ReviewerPortfolio payload={sharePayload} />;
  }

  const createLink = () => {
    const expires = new Date();
    expires.setDate(expires.getDate() + 21);
    const payload: SharePayload = {
      company,
      jd,
      lanes: model.selectedLanes,
      expires: expires.toISOString(),
    };
    const url = buildShareUrl(payload);
    setLinks((current) => [
      {
        url,
        company,
        lanes: model.selectedLanes,
        expires: expires.toLocaleDateString(),
      },
      ...current,
    ]);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-[radial-gradient(circle_at_top_left,_rgba(229,190,105,0.16),_transparent_34%),linear-gradient(135deg,_rgba(17,24,39,0.9),_rgba(10,10,10,1))]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.05fr_0.95fr] md:py-16">
          <div className="space-y-6">
            <Badge className="w-fit" variant="outline">
              Owner studio
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Tailor a reviewer-facing portfolio.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                Paste a company or JD signal. The app scores keywords into role
                lanes, ranks proof points, and generates a clean hash-link view
                that does not expose this studio.
              </p>
            </div>
            <div className="rounded-md border border-border bg-card/70 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                How the JD is interpreted
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {model.analysis.matches.slice(0, 6).map((match) => (
                  <div key={match.lane} className="rounded-md bg-muted/40 p-3">
                    <p className="text-sm font-medium">{match.lane}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Matched: {match.terms.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Card className="border-border/80 bg-card/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Build target view
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
                {model.selectedLanes.map((lane) => (
                  <Badge key={lane}>{lane}</Badge>
                ))}
              </div>
              <Button type="button" onClick={createLink} className="w-full">
                <Link2 className="mr-2 h-4 w-4" />
                Generate reviewer link
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-primary" />
              Generated links
            </CardTitle>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No links yet. Generated links open a clean reviewer page with
                only selected proof, projects, and language.
              </p>
            ) : (
              <div className="space-y-3">
                {links.map((link) => (
                  <div
                    key={link.url}
                    className="rounded-md border border-border p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="font-medium">{link.company}</span>
                      <span className="text-muted-foreground">
                        Expires {link.expires}
                      </span>
                    </div>
                    <p className="mt-2 break-all text-muted-foreground">
                      {link.url}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {link.lanes.map((lane) => (
                        <Badge key={lane} variant="outline">
                          {lane}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clipboard className="h-5 w-5 text-primary" />
              Previewed reviewer output
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {model.selectedMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-md border border-border p-3"
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
            <div className="space-y-3">
              {model.selectedProjects.map((project) => (
                <div key={project.id} className="rounded-md bg-muted/30 p-3">
                  <p className="font-medium">{project.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {project.summary}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
