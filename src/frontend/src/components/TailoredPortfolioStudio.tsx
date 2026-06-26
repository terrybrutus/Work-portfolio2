import { createActor } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  type Lane,
  type PortfolioProject,
  type ProofPoint,
  getProofPoints,
  laneProfiles,
  profile,
  projects,
  proofPoints,
  resumeHighlights,
  skills,
} from "@/data/sourceBank";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  Check,
  Clipboard,
  ExternalLink,
  Github,
  Image as ImageIcon,
  Link2,
  LockKeyhole,
  RotateCcw,
  SearchCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type AnalysisMatch = {
  lane: Lane;
  terms: string[];
  score: number;
  confidence: number;
};

type Analysis = {
  primaryLane: Lane;
  lanes: Lane[];
  matches: AnalysisMatch[];
  angle: string;
  reviewerTakeaway: string;
  aiPromptPreview: string;
};

type TailoredViewInput = {
  slug: string;
  label: string;
  privateCompany: string;
  privateJobDescription: string;
  primaryLane: string;
  lanes: string[];
  projectIds: string[];
  proofIds: string[];
  skillIds: string[];
  angle: string;
  expiresAt?: string;
};

type TailoredView = TailoredViewInput & {
  createdAt?: bigint;
  archived?: boolean;
};

type TailoredBackend = {
  getTailoredView?: (slug: string) => Promise<TailoredView | null>;
  saveTailoredView?: (input: TailoredViewInput) => Promise<TailoredView>;
  listTailoredViews?: () => Promise<TailoredView[]>;
};

type RouteState = {
  isStudio: boolean;
  slug: string | null;
};

type GeneratedLink = {
  url: string;
  slug: string;
  label: string;
  lanes: Lane[];
  expires: string;
  source: "backend" | "local";
};

const sampleJd =
  "Senior enablement role partnering with product, sales, and operations teams to build AI-assisted onboarding, technical training, stakeholder-ready assets, and measurable adoption programs.";

const localStorageKey = "terry-portfolio-tailored-views";

function isLane(value: string): value is Lane {
  return laneProfiles.some((profileItem) => profileItem.lane === value);
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#./\s-]/g, " ");
}

function analyzeTarget(text: string): Analysis {
  const normalized = normalizeText(text);
  const matches = laneProfiles
    .map((laneProfile) => {
      const terms = laneProfile.keywords.filter((word) =>
        normalized.includes(word),
      );
      const score = terms.length;
      return {
        lane: laneProfile.lane,
        terms,
        score,
        confidence: Math.min(0.95, 0.42 + score * 0.12),
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const ranked =
    matches.length > 0
      ? matches
      : [
          {
            lane: "Enablement" as Lane,
            terms: ["default"],
            score: 1,
            confidence: 0.48,
          },
          {
            lane: "Learning Experience" as Lane,
            terms: ["default"],
            score: 1,
            confidence: 0.44,
          },
          {
            lane: "AI Operations" as Lane,
            terms: ["default"],
            score: 1,
            confidence: 0.42,
          },
        ];

  const lanes = ranked.slice(0, 3).map((item) => item.lane);
  const primaryLane = lanes[0];
  const laneProfile =
    laneProfiles.find((item) => item.lane === primaryLane) ?? laneProfiles[0];

  return {
    primaryLane,
    lanes,
    matches: ranked,
    angle: laneProfile.headline,
    reviewerTakeaway: laneProfile.reviewerTakeaway,
    aiPromptPreview: `Classify JD into ${laneProfiles
      .map((item) => item.lane)
      .join(", ")}. Return JSON: lane, confidence, projectIds, proofIds.`,
  };
}

function scoreProject(project: PortfolioProject, selectedLanes: Lane[]) {
  const laneScore = project.lanes.reduce(
    (score, lane) => score + (selectedLanes.includes(lane) ? 4 : 0),
    0,
  );
  const proofScore = getProofPoints(project.proofIds).reduce(
    (score, proofPoint) =>
      score +
      proofPoint.lanes.filter((lane) => selectedLanes.includes(lane)).length,
    0,
  );
  return laneScore + proofScore;
}

function getRecommendedProjects(selectedLanes: Lane[]) {
  return [...projects]
    .sort(
      (a, b) => scoreProject(b, selectedLanes) - scoreProject(a, selectedLanes),
    )
    .slice(0, 3);
}

function getRecommendedProofPoints(selectedLanes: Lane[]) {
  return proofPoints
    .filter((proofPoint) =>
      proofPoint.lanes.some((lane) => selectedLanes.includes(lane)),
    )
    .slice(0, 4);
}

function getRecommendedSkills(selectedLanes: Lane[]) {
  const keywords = laneProfiles
    .filter((laneProfile) => selectedLanes.includes(laneProfile.lane))
    .flatMap((laneProfile) => laneProfile.keywords);

  const rankedSkills = skills.filter((skill) => {
    const normalized = normalizeText(skill);
    return keywords.some((keyword) => normalized.includes(keyword));
  });

  return (rankedSkills.length > 0 ? rankedSkills : skills).slice(0, 10);
}

function getRouteState(): RouteState {
  const hash = window.location.hash;
  const normalizedHash = hash.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname.toLowerCase();
  const slugFromHash = hash.match(/^#\/v\/([a-z0-9-]+)$/i)?.[1] ?? null;
  const slugFromPath = path.match(/\/v\/([a-z0-9-]+)$/i)?.[1] ?? null;

  return {
    isStudio:
      normalizedHash === "#studio" ||
      normalizedHash === "#/studio" ||
      normalizedHash === "#owner" ||
      normalizedHash === "#/owner" ||
      params.get("studio") === "1" ||
      params.get("owner") === "1" ||
      path.endsWith("/studio") ||
      path.endsWith("/owner"),
    slug: slugFromHash ?? slugFromPath,
  };
}

function makeSlug() {
  const bytes = new Uint8Array(5);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 8);
}

function buildShareUrl(slug: string) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = `/v/${slug}`;
  return url.toString();
}

function getLocalViews(): Record<string, TailoredView> {
  try {
    return JSON.parse(localStorage.getItem(localStorageKey) ?? "{}");
  } catch {
    return {};
  }
}

function saveLocalView(view: TailoredView) {
  const current = getLocalViews();
  current[view.slug] = view;
  localStorage.setItem(localStorageKey, JSON.stringify(current));
}

function getLocalView(slug: string) {
  return getLocalViews()[slug] ?? null;
}

function buildViewModel(view: TailoredView | null) {
  const lanes = (view?.lanes ?? []).filter(isLane).slice(0, 3);
  const selectedLanes =
    lanes.length > 0
      ? lanes
      : (["Enablement", "AI Operations", "Learning Experience"] as Lane[]);
  const selectedProjects =
    view?.projectIds
      ?.map((id) => projects.find((project) => project.id === id))
      .filter((project): project is PortfolioProject => Boolean(project)) ??
    getRecommendedProjects(selectedLanes);
  const selectedProofPoints =
    view?.proofIds
      ?.map((id) => proofPoints.find((proofPoint) => proofPoint.id === id))
      .filter((proofPoint): proofPoint is ProofPoint => Boolean(proofPoint)) ??
    getRecommendedProofPoints(selectedLanes);
  const selectedSkills =
    view?.skillIds && view.skillIds.length > 0
      ? view.skillIds
      : getRecommendedSkills(selectedLanes);
  const primaryLane = isLane(view?.primaryLane ?? "")
    ? (view?.primaryLane as Lane)
    : selectedLanes[0];
  const laneProfile =
    laneProfiles.find((item) => item.lane === primaryLane) ?? laneProfiles[0];

  return {
    selectedLanes,
    selectedProjects: selectedProjects.slice(0, 4),
    selectedProofPoints: selectedProofPoints.slice(0, 4),
    selectedSkills: selectedSkills.slice(0, 10),
    angle: view?.angle || laneProfile.headline,
    primaryLane,
  };
}

function useTailoredView(slug: string | null, actor: TailoredBackend | null) {
  const [view, setView] = useState<TailoredView | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "missing"
  >("idle");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug) {
        setStatus("ready");
        setView(null);
        return;
      }

      setStatus("loading");
      try {
        const backendView = actor?.getTailoredView
          ? await actor.getTailoredView(slug)
          : null;
        const nextView = backendView ?? getLocalView(slug);
        if (!cancelled) {
          setView(nextView);
          setStatus(nextView ? "ready" : "missing");
        }
      } catch {
        const nextView = getLocalView(slug);
        if (!cancelled) {
          setView(nextView);
          setStatus(nextView ? "ready" : "missing");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, actor]);

  return { view, status };
}

function VisualProjectCard({ project }: { project: PortfolioProject }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <img
          src={project.visual.src}
          alt={project.visual.alt}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs text-white">
          {project.shortTitle}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">
            {project.role}
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold">
            {project.title}
          </h3>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          {project.summary}
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Problem
            </p>
            <p className="mt-2 text-sm leading-5">{project.problem}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Moves
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-5">
              {project.actions.slice(0, 2).map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Results
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-5">
              {project.outcomes.slice(0, 2).map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {project.tools.slice(0, 5).map((tool) => (
            <Badge key={tool} variant="outline">
              {tool}
            </Badge>
          ))}
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-sm text-primary"
            >
              <Github className="h-4 w-4" />
              Repo
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function PublicLanding({ onExplore }: { onExplore: () => void }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_20%_20%,_rgba(229,190,105,0.18),_transparent_30%),radial-gradient(circle_at_80%_10%,_rgba(45,212,191,0.12),_transparent_28%),linear-gradient(135deg,_#0f1115,_#08090b)]">
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative mx-auto grid min-h-[92vh] max-w-6xl content-center gap-10 px-5 py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-7">
            <Badge className="w-fit" variant="outline">
              Terry Brutus
            </Badge>
            <div className="space-y-4">
              <h1 className="font-display text-5xl font-semibold leading-tight sm:text-6xl">
                Systems that help people do complex work better.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Enablement, AI workflow, and learning experience work across
                technical training, compliance, product education, and
                performance support.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={onExplore}>
                View selected work
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <a
                href={profile.linkedIn}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-smooth hover:bg-muted"
              >
                LinkedIn
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="grid content-center gap-4">
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
              <img
                src="/assets/portfolio/terrylxd-hero.png"
                alt="TerryLXD portfolio hero screenshot."
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {laneProfiles.slice(0, 3).map((laneProfile) => (
                <div
                  key={laneProfile.lane}
                  className="rounded-md border border-border bg-card/80 p-3"
                >
                  <p className="text-sm font-medium">{laneProfile.lane}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ReviewerPortfolio({
  view,
  status,
  onExplore,
}: {
  view: TailoredView | null;
  status: "idle" | "loading" | "ready" | "missing";
  onExplore: () => void;
}) {
  if (!view && status === "ready") {
    return <PublicLanding onExplore={onExplore} />;
  }

  const model = buildViewModel(view);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-[linear-gradient(135deg,_rgba(17,24,39,0.96),_rgba(10,10,10,1))]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="space-y-6">
            <Badge className="w-fit" variant="outline">
              Selected Work
            </Badge>
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
                {model.angle}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                {profile.shortSummary}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {model.selectedLanes.map((lane) => (
                <Badge key={lane}>{lane}</Badge>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <img
              src={
                model.selectedProjects[0]?.visual.src ??
                "/assets/portfolio/terrylxd-projects.png"
              }
              alt={
                model.selectedProjects[0]?.visual.alt ??
                "Portfolio project visual."
              }
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                {model.selectedProjects[0]?.visual.caption}
              </p>
            </div>
          </div>
        </div>
      </section>

      {status === "missing" && (
        <section className="mx-auto max-w-6xl px-5 pt-6">
          <div className="rounded-md border border-primary/30 bg-primary/10 p-4 text-sm">
            This private view was not found, so the page is showing a general
            selected-work portfolio.
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {model.selectedProofPoints.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-5">
              <p className="font-display text-3xl font-semibold">
                {metric.value}
              </p>
              <p className="mt-1 text-sm font-medium">{metric.label}</p>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {metric.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-12 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5 text-primary" />
                Background
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeHighlights.map((item) => (
                <p
                  key={item}
                  className="text-sm leading-6 text-muted-foreground"
                >
                  {item}
                </p>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Relevant Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {model.selectedSkills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold">
              Featured Evidence
            </h2>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary"
            >
              GitHub
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          {model.selectedProjects.map((project) => (
            <VisualProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </main>
  );
}

function ToggleChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm transition-smooth ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function TailoredPortfolioStudio() {
  const actorResult = useActor(createActor);
  const actor =
    (actorResult.actor as unknown as TailoredBackend | null) ?? null;
  const [route, setRoute] = useState<RouteState>(getRouteState);
  const { view, status } = useTailoredView(route.slug, actor);
  const [company, setCompany] = useState("");
  const [jd, setJd] = useState(sampleJd);
  const [aiMode, setAiMode] = useState<"off" | "suggest">("suggest");
  const [selectedLanes, setSelectedLanes] = useState<Lane[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedProofIds, setSelectedProofIds] = useState<string[]>([]);
  const [links, setLinks] = useState<GeneratedLink[]>([]);
  const [saving, setSaving] = useState(false);

  const analysis = useMemo(
    () => analyzeTarget(`${company} ${jd}`),
    [company, jd],
  );
  const activeLanes = selectedLanes.length > 0 ? selectedLanes : analysis.lanes;
  const recommendedProjects = useMemo(
    () => getRecommendedProjects(activeLanes),
    [activeLanes],
  );
  const recommendedProofPoints = useMemo(
    () => getRecommendedProofPoints(activeLanes),
    [activeLanes],
  );
  const recommendedSkills = useMemo(
    () => getRecommendedSkills(activeLanes),
    [activeLanes],
  );

  const activeProjectIds =
    selectedProjectIds.length > 0
      ? selectedProjectIds
      : recommendedProjects.map((project) => project.id);
  const activeProofIds =
    selectedProofIds.length > 0
      ? selectedProofIds
      : recommendedProofPoints.map((proofPoint) => proofPoint.id);

  useEffect(() => {
    const syncRoute = () => setRoute(getRouteState());
    window.addEventListener("hashchange", syncRoute);
    window.addEventListener("popstate", syncRoute);
    return () => {
      window.removeEventListener("hashchange", syncRoute);
      window.removeEventListener("popstate", syncRoute);
    };
  }, []);

  useEffect(() => {
    setSelectedLanes(analysis.lanes);
    setSelectedProjectIds(
      getRecommendedProjects(analysis.lanes).map((project) => project.id),
    );
    setSelectedProofIds(
      getRecommendedProofPoints(analysis.lanes).map(
        (proofPoint) => proofPoint.id,
      ),
    );
  }, [analysis]);

  const openGeneralPortfolio = useCallback(() => {
    const generalView: TailoredView = {
      slug: "general",
      label: "General portfolio",
      privateCompany: "",
      privateJobDescription: "",
      primaryLane: "Enablement",
      lanes: ["Enablement", "AI Operations", "Learning Experience"],
      projectIds: [
        "ai-talent-content-pipeline",
        "workflow-management-platform",
        "phishing-red-flags",
      ],
      proofIds: ["defense-workforce", "asset-cycle", "audit-cost", "army-lms"],
      skillIds: getRecommendedSkills([
        "Enablement",
        "AI Operations",
        "Learning Experience",
      ]),
      angle:
        "Enablement, AI workflow, and learning systems with visible proof.",
      expiresAt: undefined,
    };
    saveLocalView(generalView);
    window.location.hash = "/v/general";
  }, []);

  if (!route.isStudio) {
    return (
      <ReviewerPortfolio
        view={view}
        status={status}
        onExplore={openGeneralPortfolio}
      />
    );
  }

  const toggleLane = (lane: Lane) => {
    setSelectedLanes((current) =>
      current.includes(lane)
        ? current.filter((item) => item !== lane)
        : [...current, lane].slice(0, 3),
    );
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds((current) =>
      current.includes(projectId)
        ? current.filter((item) => item !== projectId)
        : [...current, projectId].slice(0, 4),
    );
  };

  const toggleProof = (proofId: string) => {
    setSelectedProofIds((current) =>
      current.includes(proofId)
        ? current.filter((item) => item !== proofId)
        : [...current, proofId].slice(0, 4),
    );
  };

  const resetRecommendations = () => {
    setSelectedLanes(analysis.lanes);
    setSelectedProjectIds(recommendedProjects.map((project) => project.id));
    setSelectedProofIds(
      recommendedProofPoints.map((proofPoint) => proofPoint.id),
    );
  };

  const createLink = async () => {
    setSaving(true);
    const slug = makeSlug();
    const expires = new Date();
    expires.setDate(expires.getDate() + 21);
    const input: TailoredViewInput = {
      slug,
      label: company.trim() || "Private target view",
      privateCompany: company.trim(),
      privateJobDescription: jd.slice(0, 2200),
      primaryLane: activeLanes[0],
      lanes: activeLanes,
      projectIds: activeProjectIds,
      proofIds: activeProofIds,
      skillIds: recommendedSkills,
      angle: analysis.angle,
      expiresAt: expires.toISOString(),
    };

    let source: "backend" | "local" = "local";
    try {
      if (actor?.saveTailoredView) {
        await actor.saveTailoredView(input);
        source = "backend";
      }
    } catch {
      source = "local";
    }

    saveLocalView(input);
    const url = buildShareUrl(slug);
    setLinks((current) => [
      {
        url,
        slug,
        label: input.label,
        lanes: activeLanes,
        expires: expires.toLocaleDateString(),
        source,
      },
      ...current,
    ]);
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-[radial-gradient(circle_at_top_left,_rgba(229,190,105,0.16),_transparent_34%),linear-gradient(135deg,_rgba(17,24,39,0.95),_rgba(10,10,10,1))]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Badge className="w-fit" variant="outline">
              Owner Studio
            </Badge>
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Build a quiet, tailored reviewer view.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                Paste a JD, let the app recommend the lane, projects, visuals,
                and proof points, then override anything before generating a
                short opaque link.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Short links", "Stored by slug"],
                ["AI assist", aiMode === "suggest" ? "Suggest only" : "Off"],
                ["Public view", "No studio language"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-md border border-border bg-card/80 p-4"
                >
                  <p className="text-xs uppercase text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-border/80 bg-card/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clipboard className="h-5 w-5 text-primary" />
                Step 1. Target Signal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block space-y-2" htmlFor="target-company">
                <span className="text-sm font-medium">
                  Private company / role label
                </span>
                <input
                  id="target-company"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="Used only inside the studio"
                />
              </label>
              <label className="block space-y-2" htmlFor="target-jd">
                <span className="text-sm font-medium">
                  Job description or hiring signal
                </span>
                <Textarea
                  id="target-jd"
                  value={jd}
                  onChange={(event) => setJd(event.target.value)}
                  className="min-h-36"
                  maxLength={2200}
                />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant={aiMode === "suggest" ? "default" : "outline"}
                  onClick={() =>
                    setAiMode(aiMode === "suggest" ? "off" : "suggest")
                  }
                >
                  <Bot className="mr-2 h-4 w-4" />
                  AI assist {aiMode === "suggest" ? "on" : "off"}
                </Button>
                <p className="text-xs leading-5 text-muted-foreground">
                  Gemini-ready, capped prompt. The deterministic scorer still
                  works when AI is off.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SearchCheck className="h-5 w-5 text-primary" />
                Step 2. Recommended Lane
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-primary/25 bg-primary/10 p-4">
                <p className="text-sm font-medium">{analysis.primaryLane}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {analysis.reviewerTakeaway}
                </p>
              </div>
              <div className="grid gap-3">
                {analysis.matches.slice(0, 6).map((match) => (
                  <div
                    key={match.lane}
                    className="rounded-md border border-border bg-muted/25 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{match.lane}</p>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(match.confidence * 100)}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Matched: {match.terms.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {laneProfiles.map((laneProfile) => (
                  <ToggleChip
                    key={laneProfile.lane}
                    active={activeLanes.includes(laneProfile.lane)}
                    onClick={() => toggleLane(laneProfile.lane)}
                  >
                    {laneProfile.lane}
                  </ToggleChip>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                AI Cost Guardrails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Gemini should only receive the trimmed JD, lane names, project
                IDs, and proof IDs. No full portfolio dump, no reviewer traffic,
                and no automatic calls when a link is opened.
              </p>
              <div className="rounded-md border border-border bg-muted/25 p-3 font-mono text-xs">
                {analysis.aiPromptPreview}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LockKeyhole className="h-5 w-5 text-primary" />
                Step 5. Short Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                onClick={createLink}
                className="w-full"
                disabled={saving}
              >
                <Link2 className="mr-2 h-4 w-4" />
                {saving ? "Generating..." : "Generate short reviewer link"}
              </Button>
              {links.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Links will look like{" "}
                  <span className="font-mono">#/v/a7k92p</span>. The company/JD
                  stays private in the studio data.
                </p>
              ) : (
                <div className="space-y-3">
                  {links.map((link) => (
                    <div
                      key={link.slug}
                      className="rounded-md border border-border p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-medium">{link.label}</span>
                        <Badge variant="outline">{link.source}</Badge>
                      </div>
                      <p className="mt-2 break-all text-muted-foreground">
                        {link.url}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          className="inline-flex items-center gap-2 text-primary"
                          href={link.url}
                        >
                          Open
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <span className="text-muted-foreground">
                          Expires {link.expires}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Step 3. Recommended Projects and Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 md:grid-cols-3">
                {recommendedProjects.map((project) => (
                  <button
                    type="button"
                    key={project.id}
                    onClick={() => toggleProject(project.id)}
                    className={`overflow-hidden rounded-md border text-left transition-smooth ${
                      activeProjectIds.includes(project.id)
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/20 hover:border-muted-foreground"
                    }`}
                  >
                    <img
                      src={project.visual.src}
                      alt={project.visual.alt}
                      className="aspect-[16/9] w-full object-cover"
                    />
                    <div className="p-3">
                      <div className="flex items-center gap-2">
                        {activeProjectIds.includes(project.id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        <p className="text-sm font-medium">
                          {project.shortTitle}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {project.role}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {recommendedProofPoints.map((proofPoint) => (
                  <button
                    type="button"
                    key={proofPoint.id}
                    onClick={() => toggleProof(proofPoint.id)}
                    className={`rounded-md border p-3 text-left transition-smooth ${
                      activeProofIds.includes(proofPoint.id)
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/20 hover:border-muted-foreground"
                    }`}
                  >
                    <p className="font-display text-2xl font-semibold">
                      {proofPoint.value}
                    </p>
                    <p className="text-sm font-medium">{proofPoint.label}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {proofPoint.detail}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Step 4. Manual Override</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetRecommendations}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">All project options</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {projects.map((project) => (
                    <ToggleChip
                      key={project.id}
                      active={activeProjectIds.includes(project.id)}
                      onClick={() => toggleProject(project.id)}
                    >
                      {project.shortTitle}
                    </ToggleChip>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">All metric options</p>
                <div className="flex flex-wrap gap-2">
                  {proofPoints.map((proofPoint) => (
                    <ToggleChip
                      key={proofPoint.id}
                      active={activeProofIds.includes(proofPoint.id)}
                      onClick={() => toggleProof(proofPoint.id)}
                    >
                      {proofPoint.value} {proofPoint.label}
                    </ToggleChip>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reviewer Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-border bg-muted/20 p-4">
                <p className="text-xs uppercase text-muted-foreground">
                  Public headline
                </p>
                <p className="mt-1 font-display text-2xl font-semibold">
                  {analysis.angle}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {activeProjectIds.slice(0, 3).map((id) => {
                  const project = projects.find((item) => item.id === id);
                  if (!project) return null;
                  return (
                    <div
                      key={id}
                      className="rounded-md border border-border p-3"
                    >
                      <img
                        src={project.visual.src}
                        alt={project.visual.alt}
                        className="aspect-[16/9] w-full rounded object-cover"
                      />
                      <p className="mt-2 text-sm font-medium">
                        {project.shortTitle}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
