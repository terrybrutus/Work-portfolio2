import { createActor } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  type EvidenceSourceStatus,
  type Lane,
  type PortfolioProject,
  type ProofPoint,
  brainSources,
  evidenceBrain,
  getProofPoints,
  humanHighlights,
  laneProfiles,
  profile,
  projects,
  proofPoints,
  resumeHighlights,
  skills,
} from "@/data/sourceBank";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  Check,
  Clipboard,
  Database,
  Download,
  ExternalLink,
  FileSearch,
  FileText,
  Github,
  Image as ImageIcon,
  Link2,
  LockKeyhole,
  RotateCcw,
  Save,
  SearchCheck,
  Sparkles,
  Upload,
  UserRound,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  viewLabel: string;
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
  state: "active" | "archived";
  source: "backend" | "local";
};

type SavedTargetProfile = {
  id: string;
  name: string;
  createdAt: string;
  company: string;
  jd: string;
  lanes: Lane[];
  projectIds: string[];
  proofIds: string[];
  skillIds: string[];
  linkSlugs: string[];
};

type StudioBrainSource = {
  id: string;
  title: string;
  type: string;
  status: EvidenceSourceStatus;
  linkedProjectIds: string[];
  note: string;
  rawText: string;
  sourceUrl?: string;
  createdAt?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  extractionStatus?: "text captured" | "media recorded" | "record only";
  matchedTerms?: string[];
};

type PortfolioBackup = {
  exportedAt: string;
  version: 1;
  views: Record<string, TailoredView>;
  generatedLinks: GeneratedLink[];
  savedProfiles: SavedTargetProfile[];
  brainSources: StudioBrainSource[];
};

const sampleJd =
  "Senior enablement role partnering with product, sales, and operations teams to build AI-assisted onboarding, technical training, stakeholder-ready assets, and measurable adoption programs.";

const localStorageKey = "terry-portfolio-tailored-views";
const savedProfilesKey = "terry-portfolio-target-profiles";
const studioBrainKey = "terry-portfolio-brain-sources";
const generatedLinksKey = "terry-portfolio-generated-links";

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

function getReviewerBadge(primaryLane: Lane) {
  const labels: Record<Lane, string> = {
    Enablement: "Enablement Systems",
    "AI Operations": "AI Workflow Evidence",
    "Learning Experience": "Learning Experience Proof",
    "Technical Product": "Workflow and Product Evidence",
    "Sales Enablement": "Sales Readiness Evidence",
    Compliance: "Compliance Enablement Proof",
  };

  return labels[primaryLane];
}

function getProjectMediaStatus(projectsToCheck: PortfolioProject[]) {
  return projectsToCheck.map((project) => ({
    project,
    status: project.visual.quality,
    needs: project.visual.missing ?? project.evidenceNeeds,
  }));
}

function getMetricSourceNote(
  metric: ProofPoint,
  selectedProjects: PortfolioProject[],
) {
  const linkedProject = selectedProjects.find((project) =>
    project.proofIds.includes(metric.id),
  );
  return linkedProject
    ? `Used by ${linkedProject.shortTitle}`
    : "Background evidence";
}

function getRouteState(): RouteState {
  const hash = window.location.hash;
  const normalizedHash = hash.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname.toLowerCase();
  const slugFromHash =
    hash.match(/^#\/work\/([a-z0-9-]+)$/i)?.[1] ??
    hash.match(/^#\/v\/([a-z0-9-]+)$/i)?.[1] ??
    null;
  const slugFromPath =
    path.match(/\/work\/([a-z0-9-]+)$/i)?.[1] ??
    path.match(/\/v\/([a-z0-9-]+)$/i)?.[1] ??
    null;

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

function getSlugPrefix(primaryLane: Lane) {
  const prefixes: Record<Lane, string> = {
    Enablement: "readiness",
    "AI Operations": "aiops",
    "Learning Experience": "learning",
    "Technical Product": "workflow",
    "Sales Enablement": "field",
    Compliance: "compliance",
  };
  return prefixes[primaryLane];
}

function makeSlug(primaryLane: Lane) {
  const bytes = new Uint8Array(3);
  window.crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes)
    .map((byte) => byte.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 4);
  return `${getSlugPrefix(primaryLane)}-${suffix}`;
}

function buildShareUrl(slug: string) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = `/work/${slug}`;
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

function archiveLocalView(slug: string, archived: boolean) {
  const current = getLocalViews();
  const existing = current[slug];
  if (!existing) return;
  current[slug] = { ...existing, archived };
  localStorage.setItem(localStorageKey, JSON.stringify(current));
}

function getGeneratedLinks(): GeneratedLink[] {
  try {
    return JSON.parse(localStorage.getItem(generatedLinksKey) ?? "[]");
  } catch {
    return [];
  }
}

function setGeneratedLinks(links: GeneratedLink[]) {
  localStorage.setItem(generatedLinksKey, JSON.stringify(links));
}

function getSavedProfiles(): SavedTargetProfile[] {
  try {
    return JSON.parse(localStorage.getItem(savedProfilesKey) ?? "[]");
  } catch {
    return [];
  }
}

function setSavedProfiles(profiles: SavedTargetProfile[]) {
  localStorage.setItem(savedProfilesKey, JSON.stringify(profiles));
}

function getStudioBrainSources(): StudioBrainSource[] {
  try {
    return JSON.parse(localStorage.getItem(studioBrainKey) ?? "[]");
  } catch {
    return [];
  }
}

function setStudioBrainSources(sources: StudioBrainSource[]) {
  localStorage.setItem(studioBrainKey, JSON.stringify(sources));
}

function buildPortfolioBackup(): PortfolioBackup {
  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    views: getLocalViews(),
    generatedLinks: getGeneratedLinks(),
    savedProfiles: getSavedProfiles(),
    brainSources: getStudioBrainSources(),
  };
}

function isPortfolioBackup(value: unknown): value is PortfolioBackup {
  if (!value || typeof value !== "object") return false;
  const backup = value as Partial<PortfolioBackup>;
  return (
    backup.version === 1 &&
    typeof backup.exportedAt === "string" &&
    Boolean(backup.views) &&
    typeof backup.views === "object" &&
    Array.isArray(backup.generatedLinks) &&
    Array.isArray(backup.savedProfiles) &&
    Array.isArray(backup.brainSources)
  );
}

function writePortfolioBackup(backup: PortfolioBackup) {
  localStorage.setItem(localStorageKey, JSON.stringify(backup.views));
  setGeneratedLinks(backup.generatedLinks);
  setSavedProfiles(backup.savedProfiles);
  setStudioBrainSources(backup.brainSources);
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function inferSourceType(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "webp"].includes(extension)) {
    return "Project screenshot";
  }
  if (["gif", "mp4", "webm"].includes(extension)) return "Demo GIF/video";
  if (["pdf", "docx", "pptx"].includes(extension)) return "Document preview";
  if (["txt", "md", "csv"].includes(extension)) return "Raw notes";
  return "Old website artifact";
}

function canReadTextFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return (
    file.type.startsWith("text/") ||
    ["txt", "md", "csv", "json"].includes(extension)
  );
}

function readFileText(file: File) {
  return new Promise<string>((resolve) => {
    if (!canReadTextFile(file)) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? "").slice(0, 4000));
    reader.onerror = () => resolve("");
    reader.readAsText(file);
  });
}

function getProjectMatchTerms(project: PortfolioProject) {
  return [
    project.title,
    project.shortTitle,
    project.role,
    project.source ?? "",
    ...project.lanes,
    ...project.tools,
    ...project.evidenceNeeds,
  ]
    .flatMap((term) => normalizeText(term).split(/\s+/))
    .filter((term) => term.length > 3);
}

function getLinkedProjectIdsFromSource(text: string, fallbackIds: string[]) {
  const normalized = normalizeText(text);
  const ranked = projects
    .map((project) => {
      const terms = [...new Set(getProjectMatchTerms(project))];
      const matchedTerms = terms.filter((term) => normalized.includes(term));
      return { project, matchedTerms, score: matchedTerms.length };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return {
    ids:
      ranked.length > 0
        ? ranked.slice(0, 4).map((item) => item.project.id)
        : fallbackIds.slice(0, 4),
    terms: ranked
      .slice(0, 4)
      .flatMap((item) => item.matchedTerms)
      .slice(0, 8),
  };
}

function seedSourceToStudioSource(
  source: (typeof brainSources)[number],
): StudioBrainSource {
  return {
    ...source,
    rawText: "",
    extractionStatus: "record only" as const,
    matchedTerms: [],
  };
}

function isReviewerSafeSource(source: StudioBrainSource) {
  return source.status === "approved" || source.status === "public-safe";
}

function getSourceCoverage(
  project: PortfolioProject,
  sources: StudioBrainSource[],
) {
  return sources.filter(
    (source) =>
      isReviewerSafeSource(source) &&
      source.linkedProjectIds.includes(project.id),
  );
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

function getRelevanceCopy(selectedLanes: Lane[]) {
  const laneText = selectedLanes.slice(0, 2).join(" and ");
  return `This selection emphasizes ${laneText.toLowerCase()} work where the proof is tied to clearer execution, practical adoption, and measurable support for people doing complex work.`;
}

function getRecruiterSummary(
  selectedLanes: Lane[],
  selectedProjects: PortfolioProject[],
  selectedProofPoints: ProofPoint[],
) {
  const bestFit = selectedLanes.slice(0, 3).join(", ");
  const firstProject = selectedProjects[0]?.shortTitle ?? "portfolio evidence";
  const strongestMetric = selectedProofPoints[0]
    ? `${selectedProofPoints[0].value} ${selectedProofPoints[0].label.toLowerCase()}`
    : "measurable enablement outcomes";

  return {
    focus:
      "Enablement systems, AI-assisted workflows, and learning experiences that make complex work easier to perform.",
    bestFit,
    proof: strongestMetric,
    firstReview: firstProject,
  };
}

function getInterviewPrompts(project: PortfolioProject) {
  return [
    `What changed after ${project.shortTitle}, and how did you know it mattered?`,
    "Which constraint shaped the design choices most?",
    "What would you improve if you rebuilt this with a larger team or cleaner source data?",
  ];
}

function buildStudioOutputs(
  selectedLanes: Lane[],
  selectedProjects: PortfolioProject[],
  selectedProofPoints: ProofPoint[],
) {
  const recruiterSummary = getRecruiterSummary(
    selectedLanes,
    selectedProjects,
    selectedProofPoints,
  );
  const metrics = selectedProofPoints
    .slice(0, 3)
    .map((proofPoint) => `${proofPoint.value} ${proofPoint.label}`)
    .join("; ");
  const projectsText = selectedProjects
    .slice(0, 3)
    .map((project) => project.shortTitle)
    .join(", ");

  return {
    recruiter: `${profile.name} builds ${recruiterSummary.focus} Best-fit lanes: ${recruiterSummary.bestFit}. Strongest proof: ${recruiterSummary.proof}. Start with: ${recruiterSummary.firstReview}.`,
    resume: [
      `Built ${selectedLanes[0].toLowerCase()} systems connecting workflow, learning design, and practical adoption.`,
      `Produced portfolio evidence across ${projectsText || "selected projects"} with metrics including ${metrics || "documented delivery outcomes"}.`,
      "Used AI-assisted workflows with human QA to reduce repeat work while protecting quality.",
    ],
    linkedin:
      "I build enablement systems, learning products, and AI-assisted workflows that help teams turn complex work into clearer execution.",
    interview: selectedProjects
      .slice(0, 2)
      .flatMap((project) => getInterviewPrompts(project)),
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
        const localView = getLocalView(slug);
        const nextView = localView?.archived
          ? localView
          : (backendView ?? localView);
        const publicView = nextView?.archived ? null : nextView;
        if (!cancelled) {
          setView(publicView);
          setStatus(publicView ? "ready" : "missing");
        }
      } catch {
        const nextView = getLocalView(slug);
        const publicView = nextView?.archived ? null : nextView;
        if (!cancelled) {
          setView(publicView);
          setStatus(publicView ? "ready" : "missing");
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
              Before
            </p>
            <p className="mt-2 text-sm leading-5">{project.problem}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              What changed
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-5">
              {project.actions.slice(0, 2).map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Result
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

function ReviewerPortfolio({
  view,
  status,
}: {
  view: TailoredView | null;
  status: "idle" | "loading" | "ready" | "missing";
}) {
  const model = buildViewModel(view);
  const reviewerBadge = getReviewerBadge(model.primaryLane);
  const recruiterSummary = getRecruiterSummary(
    model.selectedLanes,
    model.selectedProjects,
    model.selectedProofPoints,
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-[linear-gradient(135deg,_rgba(17,24,39,0.96),_rgba(10,10,10,1))]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="space-y-6">
            <Badge className="w-fit" variant="outline">
              {reviewerBadge}
            </Badge>
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase text-primary">
                {profile.name}
              </p>
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
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Best fit", recruiterSummary.bestFit],
                ["Strongest proof", recruiterSummary.proof],
                ["Review first", recruiterSummary.firstReview],
                [
                  "Work style",
                  "Systems thinker, maker, and practical AI adopter",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-md border border-white/10 bg-white/[0.04] p-3"
                >
                  <p className="text-xs uppercase text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <img
              src={
                model.selectedProjects[0]?.visual.src ??
                "/assets/portfolio/workflow-platform-map.svg"
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

      {status === "loading" && (
        <span className="sr-only">Loading portfolio</span>
      )}

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {model.selectedProofPoints.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-5">
              <p className="font-display text-3xl font-semibold">
                {metric.value}
              </p>
              <p className="mt-1 text-sm font-medium">{metric.label}</p>
              <p className="mt-2 text-xs font-medium text-primary">
                {getMetricSourceNote(metric, model.selectedProjects)}
              </p>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {metric.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8">
        <Card>
          <CardContent className="grid gap-5 p-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase text-primary">
                Why this work is relevant
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                Proof that connects strategy, systems, and adoption.
              </h2>
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              {getRelevanceCopy(model.selectedLanes)}
            </p>
          </CardContent>
        </Card>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-primary" />
                Human Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {humanHighlights.map((item) => (
                <div key={item.label}>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
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
  const [savedProfiles, setSavedProfilesState] = useState<SavedTargetProfile[]>(
    [],
  );
  const [brainDrafts, setBrainDrafts] = useState<StudioBrainSource[]>([]);
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceType, setSourceType] = useState(evidenceBrain.sourceTypes[0]);
  const [sourceStatus, setSourceStatus] = useState(evidenceBrain.statuses[4]);
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [importingSources, setImportingSources] = useState(false);
  const [backupMessage, setBackupMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [manualCopy, setManualCopy] = useState<{
    label: string;
    text: string;
  } | null>(null);

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
  const activeProjects = activeProjectIds
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is PortfolioProject => Boolean(project));
  const activeProofPoints = activeProofIds
    .map((id) => proofPoints.find((proofPoint) => proofPoint.id === id))
    .filter((proofPoint): proofPoint is ProofPoint => Boolean(proofPoint));
  const allBrainSources = useMemo(
    () => [...brainDrafts, ...brainSources.map(seedSourceToStudioSource)],
    [brainDrafts],
  );
  const mediaStatus = getProjectMediaStatus(activeProjects);
  const mediaNeeds = mediaStatus
    .map((item) => ({
      ...item,
      approvedSources: getSourceCoverage(item.project, allBrainSources),
    }))
    .filter(
      (item) => item.status !== "approved" || item.approvedSources.length === 0,
    );
  const evidenceCoverage = activeProjects.map((project) => {
    const approvedSources = getSourceCoverage(project, allBrainSources);
    const linkedSources = allBrainSources.filter((source) =>
      source.linkedProjectIds.includes(project.id),
    );
    return {
      project,
      approvedSources,
      linkedSources,
      needsReview: linkedSources.filter(
        (source) => !isReviewerSafeSource(source),
      ),
    };
  });
  const studioOutputs = buildStudioOutputs(
    activeLanes,
    activeProjects,
    activeProofPoints,
  );

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
    setSavedProfilesState(getSavedProfiles());
    setBrainDrafts(getStudioBrainSources());
    setLinks(getGeneratedLinks());
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

  if (!route.isStudio) {
    return <ReviewerPortfolio view={view} status={status} />;
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

  const saveTargetProfile = () => {
    const id = makeSlug(activeLanes[0]);
    const profileToSave: SavedTargetProfile = {
      id,
      name: company.trim() || `${activeLanes[0]} target`,
      createdAt: new Date().toISOString(),
      company: company.trim(),
      jd,
      lanes: activeLanes,
      projectIds: activeProjectIds,
      proofIds: activeProofIds,
      skillIds: recommendedSkills,
      linkSlugs: links.slice(0, 4).map((link) => link.slug),
    };
    const nextProfiles = [
      profileToSave,
      ...savedProfiles.filter((item) => item.id !== profileToSave.id),
    ].slice(0, 12);
    setSavedProfiles(nextProfiles);
    setSavedProfilesState(nextProfiles);
  };

  const applyTargetProfile = (targetProfile: SavedTargetProfile) => {
    setCompany(targetProfile.company);
    setJd(targetProfile.jd);
    setSelectedLanes(targetProfile.lanes);
    setSelectedProjectIds(targetProfile.projectIds);
    setSelectedProofIds(targetProfile.proofIds);
  };

  const refreshLocalWorkspace = () => {
    setSavedProfilesState(getSavedProfiles());
    setBrainDrafts(getStudioBrainSources());
    setLinks(getGeneratedLinks());
  };

  const exportWorkspaceBackup = () => {
    const backup = buildPortfolioBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `terry-portfolio-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setBackupMessage("Workspace backup exported.");
  };

  const importWorkspaceBackup = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const text = await readFileText(file);
      const parsed = JSON.parse(text) as unknown;
      if (!isPortfolioBackup(parsed)) {
        setBackupMessage(
          "Backup was not imported. The file shape did not match this portfolio workspace.",
        );
        return;
      }
      writePortfolioBackup(parsed);
      refreshLocalWorkspace();
      setBackupMessage(
        `Workspace restored from ${new Date(parsed.exportedAt).toLocaleDateString()}.`,
      );
    } catch {
      setBackupMessage(
        "Backup was not imported. Use a JSON export from this Studio.",
      );
    }
  };

  const updateSavedProfilesForLink = (link: GeneratedLink) => {
    if (!company.trim() && savedProfiles.length === 0) return;
    const targetName = company.trim() || `${activeLanes[0]} target`;
    const matchingProfile = savedProfiles.find(
      (profileItem) =>
        profileItem.company === company.trim() ||
        profileItem.name === targetName,
    );
    const profileToSave: SavedTargetProfile = matchingProfile
      ? {
          ...matchingProfile,
          linkSlugs: [
            link.slug,
            ...matchingProfile.linkSlugs.filter((slug) => slug !== link.slug),
          ].slice(0, 8),
          lanes: activeLanes,
          projectIds: activeProjectIds,
          proofIds: activeProofIds,
          skillIds: recommendedSkills,
        }
      : {
          id: makeSlug(activeLanes[0]),
          name: targetName,
          createdAt: new Date().toISOString(),
          company: company.trim(),
          jd,
          lanes: activeLanes,
          projectIds: activeProjectIds,
          proofIds: activeProofIds,
          skillIds: recommendedSkills,
          linkSlugs: [link.slug],
        };
    const nextProfiles = [
      profileToSave,
      ...savedProfiles.filter((item) => item.id !== profileToSave.id),
    ].slice(0, 12);
    setSavedProfiles(nextProfiles);
    setSavedProfilesState(nextProfiles);
  };

  const addBrainSource = () => {
    if (!sourceTitle.trim() && !sourceText.trim() && !sourceUrl.trim()) return;
    const match = getLinkedProjectIdsFromSource(
      `${sourceTitle} ${sourceUrl} ${sourceText}`,
      activeProjectIds,
    );
    const source: StudioBrainSource = {
      id: makeSlug(activeLanes[0]),
      title:
        sourceTitle.trim() ||
        sourceUrl.trim().replace(/^https?:\/\//, "") ||
        "Untitled source note",
      type: sourceType,
      status: sourceStatus,
      linkedProjectIds: match.ids,
      note: sourceUrl.trim()
        ? "Source link recorded. Review access, redaction, and project match before public use."
        : "Review before public use; raw content stays in the owner workspace.",
      rawText: sourceText.slice(0, 4000),
      sourceUrl: sourceUrl.trim() || undefined,
      createdAt: new Date().toISOString(),
      extractionStatus: sourceText.trim() ? "text captured" : "record only",
      matchedTerms: match.terms,
    };
    const nextSources = [source, ...brainDrafts].slice(0, 20);
    setStudioBrainSources(nextSources);
    setBrainDrafts(nextSources);
    setSourceTitle("");
    setSourceUrl("");
    setSourceText("");
  };

  const updateBrainSource = (
    sourceId: string,
    updater: (source: StudioBrainSource) => StudioBrainSource,
  ) => {
    const nextSources = brainDrafts.map((source) =>
      source.id === sourceId ? updater(source) : source,
    );
    setStudioBrainSources(nextSources);
    setBrainDrafts(nextSources);
  };

  const updateBrainSourceStatus = (
    sourceId: string,
    status: EvidenceSourceStatus,
  ) => {
    updateBrainSource(sourceId, (source) => ({
      ...source,
      status,
      note:
        status === "approved" || status === "public-safe"
          ? "Approved for use after review. Keep checking project match and redaction before sharing."
          : source.note,
    }));
  };

  const toggleBrainSourceProject = (sourceId: string, projectId: string) => {
    updateBrainSource(sourceId, (source) => {
      const linkedProjectIds = source.linkedProjectIds.includes(projectId)
        ? source.linkedProjectIds.filter((id) => id !== projectId)
        : [...source.linkedProjectIds, projectId].slice(0, 6);
      return {
        ...source,
        linkedProjectIds,
      };
    });
  };

  const removeBrainSource = (sourceId: string) => {
    const nextSources = brainDrafts.filter((source) => source.id !== sourceId);
    setStudioBrainSources(nextSources);
    setBrainDrafts(nextSources);
  };

  const importSourceFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImportingSources(true);
    const importedSources = await Promise.all(
      Array.from(files).map(async (file) => {
        const text = await readFileText(file);
        const match = getLinkedProjectIdsFromSource(
          `${file.name} ${text}`,
          activeProjectIds,
        );
        const isMedia =
          file.type.startsWith("image/") || file.type.startsWith("video/");
        const source: StudioBrainSource = {
          id: makeSlug(activeLanes[0]),
          title: file.name,
          type: inferSourceType(file),
          status: "needs verification",
          linkedProjectIds: match.ids,
          note:
            text.length > 0
              ? "Text captured locally. Review, redact, and approve before public use."
              : isMedia
                ? "Media recorded locally. Check crop, readability, and project match before approval."
                : "File recorded locally. Add text extraction, OCR, or a redacted preview before approval.",
          rawText: text,
          createdAt: new Date().toISOString(),
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || "unknown",
          extractionStatus:
            text.length > 0
              ? "text captured"
              : isMedia
                ? "media recorded"
                : "record only",
          matchedTerms: match.terms,
        };
        return source;
      }),
    );
    const nextSources = [...importedSources, ...brainDrafts].slice(0, 20);
    setStudioBrainSources(nextSources);
    setBrainDrafts(nextSources);
    setImportingSources(false);
  };

  const createLink = async () => {
    setSaving(true);
    const slug = makeSlug(activeLanes[0]);
    const input: TailoredViewInput = {
      slug,
      viewLabel: company.trim() || "Private target view",
      privateCompany: company.trim(),
      privateJobDescription: jd.slice(0, 2200),
      primaryLane: activeLanes[0],
      lanes: activeLanes,
      projectIds: activeProjectIds,
      proofIds: activeProofIds,
      skillIds: recommendedSkills,
      angle: analysis.angle,
      expiresAt: undefined,
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
    const link: GeneratedLink = {
      url,
      slug,
      label: input.viewLabel,
      lanes: activeLanes,
      state: "active",
      source,
    };
    const nextLinks = [
      link,
      ...links.filter((currentLink) => currentLink.slug !== link.slug),
    ].slice(0, 20);
    setLinks(nextLinks);
    setGeneratedLinks(nextLinks);
    updateSavedProfilesForLink(link);
    setSaving(false);
  };

  const setLinkArchived = (slug: string, archived: boolean) => {
    archiveLocalView(slug, archived);
    const nextLinks: GeneratedLink[] = links.map((link) =>
      link.slug === slug
        ? { ...link, state: archived ? "archived" : "active" }
        : link,
    );
    setLinks(nextLinks);
    setGeneratedLinks(nextLinks);
  };

  const copyStudioOutput = async (label: string, value: string) => {
    const text = value.trim();
    if (!text) {
      setCopyMessage(`Nothing to copy for ${label}.`);
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          setCopyMessage(`${label} copied.`);
          return;
        } catch {
          // Fall through to the selection-based copy path for stricter browsers.
        }
      }
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.left = "0";
      textarea.style.opacity = "0";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (!copied) {
        throw new Error("copy failed");
      }
      setCopyMessage(`${label} copied.`);
      setManualCopy(null);
    } catch {
      setManualCopy({ label, text });
      setCopyMessage(`Copy blocked for ${label}. Text is ready below.`);
    }
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
                and evidence, then override anything before generating a short
                opaque link.
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5 text-primary" />
                  Saved Target Profiles
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveTargetProfile}
                >
                  Save current setup
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {savedProfiles.length === 0 ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  Save a role setup after the lane, projects, metrics, and link
                  feel right. Profiles stay private to this browser for now.
                </p>
              ) : (
                savedProfiles.map((targetProfile) => (
                  <div
                    key={targetProfile.id}
                    className="rounded-md border border-border bg-muted/20 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          {targetProfile.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {targetProfile.lanes.join(", ")} -{" "}
                          {targetProfile.projectIds.length} projects -{" "}
                          {targetProfile.proofIds.length} metrics -{" "}
                          {targetProfile.linkSlugs.length} links
                        </p>
                        {targetProfile.linkSlugs.length > 0 && (
                          <p className="mt-2 text-xs text-primary">
                            Latest link: #/work/{targetProfile.linkSlugs[0]}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applyTargetProfile(targetProfile)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Workspace Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Export or restore the private Studio workspace for this browser:
                source records, saved profiles, review links, and local view
                definitions.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={exportWorkspaceBackup}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export workspace
                </Button>
                <label
                  className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-smooth hover:bg-muted"
                  htmlFor="workspace-backup"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Restore workspace
                  <input
                    id="workspace-backup"
                    type="file"
                    accept=".json,application/json"
                    className="sr-only"
                    onChange={(event) => {
                      void importWorkspaceBackup(event.target.files);
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
              {backupMessage && (
                <p className="rounded-md border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                  {backupMessage}
                </p>
              )}
            </CardContent>
          </Card>

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
                <Database className="h-5 w-5 text-primary" />
                Evidence Brain
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Add raw notes, screenshots, transcripts, repos, documents, and
                old-site artifacts here over time. The reviewer page should only
                use approved evidence that matches the selected project.
              </p>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Accepted source files
                </p>
                <div className="flex flex-wrap gap-2">
                  {evidenceBrain.acceptedFiles.map((fileType) => (
                    <Badge key={fileType} variant="outline">
                      {fileType}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className="block space-y-2 rounded-md border border-dashed border-border bg-muted/20 p-3 sm:col-span-2"
                  htmlFor="source-files"
                >
                  <span className="text-sm font-medium">
                    Import files or media records
                  </span>
                  <input
                    id="source-files"
                    type="file"
                    multiple
                    accept={evidenceBrain.acceptedFiles.join(",")}
                    className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                    onChange={(event) => {
                      void importSourceFiles(event.target.files);
                      event.target.value = "";
                    }}
                  />
                  <span className="block text-xs leading-5 text-muted-foreground">
                    Text files are read locally. Images, PDFs, DOCX, PPTX, GIF,
                    and video are recorded with the cleanup needed before
                    approval.
                  </span>
                  {importingSources && (
                    <span className="block text-xs font-medium text-primary">
                      Reading source records...
                    </span>
                  )}
                </label>
                <label className="block space-y-2" htmlFor="source-title">
                  <span className="text-sm font-medium">Source title</span>
                  <input
                    id="source-title"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={sourceTitle}
                    onChange={(event) => setSourceTitle(event.target.value)}
                    placeholder="Resume, transcript, screenshot note..."
                  />
                </label>
                <label className="block space-y-2" htmlFor="source-type">
                  <span className="text-sm font-medium">Source type</span>
                  <select
                    id="source-type"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={sourceType}
                    onChange={(event) => setSourceType(event.target.value)}
                  >
                    {evidenceBrain.sourceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label
                  className="block space-y-2 sm:col-span-2"
                  htmlFor="source-url"
                >
                  <span className="text-sm font-medium">
                    Source link or artifact URL
                  </span>
                  <input
                    id="source-url"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={sourceUrl}
                    onChange={(event) => setSourceUrl(event.target.value)}
                    placeholder="GitHub repo, old site page, demo, Drive file, or live artifact"
                  />
                  <span className="block text-xs leading-5 text-muted-foreground">
                    Links stay in Studio until the source is reviewed and
                    approved.
                  </span>
                </label>
                <label className="block space-y-2" htmlFor="source-status">
                  <span className="text-sm font-medium">Safety status</span>
                  <select
                    id="source-status"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={sourceStatus}
                    onChange={(event) =>
                      setSourceStatus(
                        event.target.value as EvidenceSourceStatus,
                      )
                    }
                  >
                    {evidenceBrain.statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="rounded-md border border-border bg-muted/20 p-3 text-sm leading-6 text-muted-foreground">
                  Attachments are represented as records in this pass. Use the
                  title and notes to point at the file, then mark it approved
                  only after crop, redaction, and project match are checked.
                </div>
              </div>
              <label className="block space-y-2" htmlFor="source-text">
                <span className="text-sm font-medium">
                  Paste notes, transcript, or extraction
                </span>
                <Textarea
                  id="source-text"
                  value={sourceText}
                  onChange={(event) => setSourceText(event.target.value)}
                  className="min-h-28"
                  maxLength={4000}
                />
              </label>
              <Button type="button" variant="outline" onClick={addBrainSource}>
                <FileText className="mr-2 h-4 w-4" />
                Add source record
              </Button>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Brain checks before public use
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {evidenceBrain.qualityChecks.map((check) => (
                    <div
                      key={check}
                      className="rounded-md border border-border bg-muted/20 p-3 text-sm"
                    >
                      {check}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Review queue
                </p>
                <div className="space-y-2">
                  {allBrainSources.slice(0, 8).map((source) => {
                    const isEditable = brainDrafts.some(
                      (draft) => draft.id === source.id,
                    );
                    return (
                      <div
                        key={source.id}
                        className="rounded-md border border-border bg-muted/20 p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium">{source.title}</p>
                          <Badge variant="outline">{source.status}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {source.type} -{" "}
                          {source.linkedProjectIds.length > 0
                            ? `${source.linkedProjectIds.length} linked projects`
                            : "not linked yet"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {source.extractionStatus && (
                            <Badge variant="outline">
                              {source.extractionStatus}
                            </Badge>
                          )}
                          {source.fileSize ? (
                            <Badge variant="outline">
                              {formatBytes(source.fileSize)}
                            </Badge>
                          ) : null}
                          {source.matchedTerms?.slice(0, 4).map((term) => (
                            <Badge key={term} variant="outline">
                              {term}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          {source.note}
                        </p>
                        {source.sourceUrl && (
                          <a
                            href={source.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex max-w-full items-center gap-1 break-all text-xs text-primary"
                          >
                            Source link
                            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                          </a>
                        )}
                        {isEditable ? (
                          <div className="mt-3 space-y-3 rounded-md border border-border bg-background/70 p-3">
                            <label
                              className="block space-y-2"
                              htmlFor={`source-url-${source.id}`}
                            >
                              <span className="text-xs font-semibold uppercase text-muted-foreground">
                                Source link
                              </span>
                              <input
                                id={`source-url-${source.id}`}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={source.sourceUrl ?? ""}
                                onChange={(event) =>
                                  updateBrainSource(source.id, (current) => ({
                                    ...current,
                                    sourceUrl:
                                      event.target.value.trim() || undefined,
                                  }))
                                }
                                placeholder="GitHub, old website, Drive, demo, or artifact URL"
                              />
                            </label>
                            <label
                              className="block space-y-2"
                              htmlFor={`status-${source.id}`}
                            >
                              <span className="text-xs font-semibold uppercase text-muted-foreground">
                                Review status
                              </span>
                              <select
                                id={`status-${source.id}`}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={source.status}
                                onChange={(event) =>
                                  updateBrainSourceStatus(
                                    source.id,
                                    event.target.value as EvidenceSourceStatus,
                                  )
                                }
                              >
                                {evidenceBrain.statuses.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                                Linked projects
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {projects.map((project) => (
                                  <ToggleChip
                                    key={project.id}
                                    active={source.linkedProjectIds.includes(
                                      project.id,
                                    )}
                                    onClick={() =>
                                      toggleBrainSourceProject(
                                        source.id,
                                        project.id,
                                      )
                                    }
                                  >
                                    {project.shortTitle}
                                  </ToggleChip>
                                ))}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => removeBrainSource(source.id)}
                            >
                              Remove source record
                            </Button>
                          </div>
                        ) : (
                          <p className="mt-3 text-xs leading-5 text-muted-foreground">
                            Seed record. Import or paste your own source to edit
                            status and project links.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SearchCheck className="h-5 w-5 text-primary" />
                Evidence Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {evidenceCoverage.map(
                ({ project, approvedSources, linkedSources, needsReview }) => (
                  <div
                    key={project.id}
                    className="rounded-md border border-border bg-muted/20 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        {project.shortTitle}
                      </p>
                      <Badge
                        variant={
                          approvedSources.length > 0 ? "default" : "outline"
                        }
                      >
                        {approvedSources.length > 0
                          ? "source-backed"
                          : "needs approved source"}
                      </Badge>
                    </div>
                    <div className="mt-2 grid gap-2 text-xs leading-5 text-muted-foreground sm:grid-cols-3">
                      <p>{linkedSources.length} linked records</p>
                      <p>{approvedSources.length} approved records</p>
                      <p>{needsReview.length} awaiting review</p>
                    </div>
                    {approvedSources.length > 0 ? (
                      <p className="mt-2 text-xs leading-5 text-primary">
                        Strongest source: {approvedSources[0].title}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        Add or approve one artifact before this project becomes
                        a stronger share candidate.
                      </p>
                    )}
                  </div>
                ),
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Missing Media for This View
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mediaNeeds.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Current project media is approved for reviewer use.
                </p>
              ) : (
                mediaNeeds.map(
                  ({ project, status, needs, approvedSources }) => (
                    <div
                      key={project.id}
                      className="rounded-md border border-border bg-muted/20 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          {project.shortTitle}
                        </p>
                        <Badge variant="outline">{status}</Badge>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        Add or approve one of these before this becomes a
                        stronger reviewer case:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm">
                        {needs.slice(0, 3).map((need) => (
                          <li key={need} className="flex gap-2">
                            <FileSearch className="mt-0.5 h-4 w-4 text-primary" />
                            <span>{need}</span>
                          </li>
                        ))}
                      </ul>
                      {approvedSources.length > 0 ? (
                        <p className="mt-3 text-xs leading-5 text-primary">
                          Approved source coverage:{" "}
                          {approvedSources
                            .map((source) => source.title)
                            .slice(0, 2)
                            .join(", ")}
                        </p>
                      ) : (
                        <p className="mt-3 text-xs leading-5 text-muted-foreground">
                          No approved source is linked to this project yet.
                          Import a screenshot, artifact, metric note, or repo
                          record and mark it approved after review.
                        </p>
                      )}
                    </div>
                  ),
                )
              )}
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
                  <span className="font-mono">#/work/workflow-a7k9</span>. The
                  company/JD stays private in the studio data.
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
                        <Badge variant="outline">
                          {link.state} - {link.source}
                        </Badge>
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
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 text-primary"
                          onClick={() =>
                            setLinkArchived(link.slug, link.state === "active")
                          }
                        >
                          {link.state === "active" ? "Archive" : "Reactivate"}
                        </button>
                        <span className="text-muted-foreground">
                          {link.state === "active"
                            ? "Active until archived"
                            : "Routes to the general portfolio"}
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
                      <Badge
                        className="mt-3"
                        variant={
                          project.visual.quality === "approved"
                            ? "default"
                            : "outline"
                        }
                      >
                        {project.visual.quality}
                      </Badge>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {project.readiness.slice(0, 2).map((status) => (
                          <span
                            key={status}
                            className="rounded-full bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {status}
                          </span>
                        ))}
                      </div>
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

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Copy-Ready Outputs
                </CardTitle>
                {copyMessage && (
                  <span className="text-sm text-muted-foreground">
                    {copyMessage}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Recruiter summary
                  </p>
                  <Button
                    type="button"
                    aria-label="Copy recruiter summary"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyStudioOutput(
                        "Recruiter summary",
                        studioOutputs.recruiter,
                      )
                    }
                  >
                    <Clipboard className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <p className="mt-2 text-sm leading-6">
                  {studioOutputs.recruiter}
                </p>
              </div>
              <div className="rounded-md border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Resume emphasis bullets
                  </p>
                  <Button
                    type="button"
                    aria-label="Copy resume emphasis bullets"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyStudioOutput(
                        "Resume bullets",
                        studioOutputs.resume
                          .map((bullet) => `- ${bullet}`)
                          .join("\n"),
                      )
                    }
                  >
                    <Clipboard className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <ul className="mt-2 space-y-2 text-sm leading-6">
                  {studioOutputs.resume.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    LinkedIn summary
                  </p>
                  <Button
                    type="button"
                    aria-label="Copy LinkedIn summary"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyStudioOutput(
                        "LinkedIn summary",
                        studioOutputs.linkedin,
                      )
                    }
                  >
                    <Clipboard className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <p className="mt-2 text-sm leading-6">
                  {studioOutputs.linkedin}
                </p>
              </div>
              <div className="rounded-md border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Interview talking points
                  </p>
                  <Button
                    type="button"
                    aria-label="Copy interview talking points"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyStudioOutput(
                        "Interview talking points",
                        studioOutputs.interview
                          .map((prompt) => `- ${prompt}`)
                          .join("\n"),
                      )
                    }
                  >
                    <Clipboard className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <ul className="mt-2 space-y-2 text-sm leading-6">
                  {studioOutputs.interview.map((prompt) => (
                    <li key={prompt}>{prompt}</li>
                  ))}
                </ul>
              </div>
              {manualCopy && (
                <div className="rounded-md border border-primary/40 bg-primary/10 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Manual copy fallback
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {manualCopy.label} is selected here for browsers that block
                    clipboard access.
                  </p>
                  <Textarea
                    className="mt-3 min-h-32"
                    readOnly
                    value={manualCopy.text}
                    onFocus={(event) => event.currentTarget.select()}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
