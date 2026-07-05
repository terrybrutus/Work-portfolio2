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
  visualSnapshots?: SavedVisualSnapshot[];
  linkSlugs: string[];
};

type SavedVisualSnapshot = {
  projectId: string;
  projectTitle: string;
  visualSrc: string;
  visualQuality: PortfolioProject["visual"]["quality"];
  readiness: PortfolioProject["readiness"];
  approvedSourceCount: number;
  missing: string[];
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

type ArtifactBrief = {
  title: string;
  artifactType:
    | "dashboard"
    | "simulation"
    | "job aid"
    | "scorecard"
    | "workflow map"
    | "case study";
  problemSolved: string;
  buildTime: "2 hr" | "4 hr" | "6 hr" | "1 day";
  requiredInputs: string[];
  recommendedTools: string[];
  portfolioPlacement: string;
  successMetric: string;
};

type StrategyReport = {
  likelyProblems: string[];
  portfolioMatches: Array<{
    project: PortfolioProject;
    strength: "strong" | "moderate" | "supporting";
    reason: string;
  }>;
  evidenceGaps: string[];
  skillMatrix: Array<{
    skill: string;
    evidence: string;
    strength: "Strong" | "Moderate" | "Gap";
  }>;
  fitScore: number;
  artifactBrief: ArtifactBrief;
};

const sampleJd =
  "Senior enablement role partnering with product, sales, and operations teams to build AI-assisted onboarding, technical training, stakeholder-ready assets, and measurable adoption programs.";

const localStorageKey = "terry-portfolio-tailored-views";
const savedProfilesKey = "terry-portfolio-target-profiles";
const studioBrainKey = "terry-portfolio-brain-sources";
const generatedLinksKey = "terry-portfolio-generated-links";
const displayCustomizationKey = "terry-portfolio-display-customization";

type ProfileDisplayOverrides = {
  name?: string;
  title?: string;
  headline?: string;
  shortSummary?: string;
  profileImage?: string;
};

type ProjectDisplayOverrides = {
  title?: string;
  shortTitle?: string;
  role?: string;
  summary?: string;
  visualSrc?: string;
  visualAlt?: string;
  visualCaption?: string;
};

type DisplayCustomization = {
  profile: ProfileDisplayOverrides;
  projects: Record<string, ProjectDisplayOverrides>;
};

function isLane(value: string): value is Lane {
  return laneProfiles.some((profileItem) => profileItem.lane === value);
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#./\s-]/g, " ");
}

function getDisplayCustomization(): DisplayCustomization {
  try {
    const raw = localStorage.getItem(displayCustomizationKey);
    if (!raw) {
      return { profile: {}, projects: {} };
    }
    const parsed = JSON.parse(raw) as Partial<DisplayCustomization>;
    return {
      profile: parsed.profile ?? {},
      projects: parsed.projects ?? {},
    };
  } catch {
    return { profile: {}, projects: {} };
  }
}

function saveDisplayCustomization(customization: DisplayCustomization) {
  localStorage.setItem(displayCustomizationKey, JSON.stringify(customization));
  return customization;
}

function resetDisplayCustomization() {
  localStorage.removeItem(displayCustomizationKey);
  return { profile: {}, projects: {} };
}

function removeEmptyValues<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (typeof entry === "string") {
        return entry.trim().length > 0;
      }
      return entry !== undefined && entry !== null;
    }),
  ) as Partial<T>;
}

function getDisplayProfile(customization: DisplayCustomization) {
  return {
    ...profile,
    ...removeEmptyValues(customization.profile),
  };
}

function getDisplayProject(
  project: PortfolioProject,
  customization: DisplayCustomization,
): PortfolioProject {
  const override = removeEmptyValues(
    customization.projects[project.id] ?? {},
  ) as ProjectDisplayOverrides;

  return {
    ...project,
    title: override.title ?? project.title,
    shortTitle: override.shortTitle ?? project.shortTitle,
    role: override.role ?? project.role,
    summary: override.summary ?? project.summary,
    visual: {
      ...project.visual,
      src: override.visualSrc ?? project.visual.src,
      alt: override.visualAlt ?? project.visual.alt,
      caption: override.visualCaption ?? project.visual.caption,
    },
  };
}

function updateDisplayProfile(
  customization: DisplayCustomization,
  updates: ProfileDisplayOverrides,
): DisplayCustomization {
  return {
    ...customization,
    profile: {
      ...customization.profile,
      ...updates,
    },
  };
}

function updateDisplayProject(
  customization: DisplayCustomization,
  projectId: string,
  updates: ProjectDisplayOverrides,
): DisplayCustomization {
  return {
    ...customization,
    projects: {
      ...customization.projects,
      [projectId]: {
        ...(customization.projects[projectId] ?? {}),
        ...updates,
      },
    },
  };
}

function readImageAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result ?? "")));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
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

function getLikelyProblems(selectedLanes: Lane[], targetText: string) {
  const normalized = normalizeText(targetText);
  const laneProblems: Record<Lane, string[]> = {
    Enablement: [
      "People need clearer role expectations, repeatable support, and faster path-to-performance.",
      "Stakeholders likely need consistent assets, manager support, and measurable adoption signals.",
    ],
    "AI Operations": [
      "Teams are expected to use AI, but the workflow, QA gates, and operating standards are not mature yet.",
      "Manual content or analysis work is likely slowing delivery and creating quality variation.",
    ],
    "Learning Experience": [
      "Complex information needs to become practice, feedback, and usable performance support.",
      "Existing training may be too passive, too dense, or disconnected from real workplace decisions.",
    ],
    "Technical Product": [
      "The role likely needs someone who can translate messy operations into clear tools, flows, and prototypes.",
      "The company may need better visibility into status, evidence, handoffs, or user behavior.",
    ],
    "Sales Enablement": [
      "Sales teams likely need faster ramp, clearer messaging, and more consistent field execution.",
      "Managers may lack a clean way to see readiness, coaching needs, or adoption patterns.",
    ],
    Compliance: [
      "Required learning or documentation needs to be easier to complete, track, and defend.",
      "The organization likely needs better evidence, governance, accessibility, or audit readiness.",
    ],
  };

  const signalProblems = [
    [
      "lms",
      "LMS content, reporting, or governance may need cleaner operational ownership.",
    ],
    [
      "dashboard",
      "Decision-makers likely need a simple dashboard instead of scattered activity data.",
    ],
    [
      "analytics",
      "The role likely needs stronger measurement of adoption, readiness, or performance.",
    ],
    [
      "crm",
      "Field or CRM behavior may need clearer coaching, visibility, and adoption support.",
    ],
    [
      "change",
      "The company likely needs change support, not just content production.",
    ],
    [
      "onboarding",
      "Ramp time or onboarding consistency is likely a business pain point.",
    ],
  ]
    .filter(([term]) => normalized.includes(term))
    .map(([, problem]) => problem);

  return [
    ...signalProblems,
    ...selectedLanes.flatMap((lane) => laneProblems[lane]),
  ]
    .filter((problem, index, list) => list.indexOf(problem) === index)
    .slice(0, 5);
}

function getArtifactBrief(
  selectedLanes: Lane[],
  gaps: string[],
  selectedProjects: PortfolioProject[],
): ArtifactBrief {
  const firstGap =
    gaps[0] ?? "clearer evidence of adoption and performance impact";
  const firstProject = selectedProjects[0]?.shortTitle ?? "current portfolio";

  if (selectedLanes.includes("Sales Enablement")) {
    return {
      title: "Sales onboarding readiness scorecard",
      artifactType: "scorecard",
      problemSolved:
        "Shows how ramp progress, manager coaching, messaging practice, and adoption signals could be tracked in one place.",
      buildTime: "4 hr",
      requiredInputs: [
        "Sample seller cohorts",
        "Readiness milestones",
        "Manager coaching prompts",
        "Adoption or ramp metric",
      ],
      recommendedTools: ["React", "CSV sample data", "AI coaching prompts"],
      portfolioPlacement: `Pair with ${firstProject} as a field-readiness proof artifact.`,
      successMetric: "Ramp-progress visibility or coaching action completion.",
    };
  }

  if (selectedLanes.includes("AI Operations")) {
    return {
      title: "AI workflow QA dashboard",
      artifactType: "dashboard",
      problemSolved:
        "Demonstrates how AI-assisted production can stay fast while tracking quality, review status, and human approval.",
      buildTime: "6 hr",
      requiredInputs: [
        "Sample intake records",
        "AI review categories",
        "QA decision states",
        "Before/after cycle-time metric",
      ],
      recommendedTools: [
        "React",
        "JSON sample data",
        "NotebookLM-style workflow notes",
      ],
      portfolioPlacement: `Use as a companion proof layer for ${firstProject}.`,
      successMetric: "Cycle-time reduction with visible QA gates.",
    };
  }

  if (selectedLanes.includes("Learning Experience")) {
    return {
      title: "Scenario-based decision practice prototype",
      artifactType: "simulation",
      problemSolved:
        "Turns passive training requirements into a short practice experience with decisions, feedback, and evidence of judgment.",
      buildTime: "6 hr",
      requiredInputs: [
        "One realistic learner scenario",
        "Decision points",
        "Feedback rules",
        "Completion artifact",
      ],
      recommendedTools: ["React", "Scenario map", "Feedback rubric"],
      portfolioPlacement: `Connect to ${firstProject} as an interactive learning proof.`,
      successMetric: "Learner decision accuracy or completion confidence.",
    };
  }

  if (selectedLanes.includes("Compliance")) {
    return {
      title: "Audit-ready completion evidence map",
      artifactType: "workflow map",
      problemSolved:
        "Shows how required learning, accessibility checks, completion evidence, and audit artifacts stay connected.",
      buildTime: "4 hr",
      requiredInputs: [
        "Required learning steps",
        "Evidence fields",
        "Review checkpoints",
        "Accessibility requirements",
      ],
      recommendedTools: [
        "Process map",
        "Redacted sample records",
        "Checklist UI",
      ],
      portfolioPlacement: `Use to strengthen the evidence gap around ${firstGap}.`,
      successMetric: "Coverage visibility or audit-prep time reduction.",
    };
  }

  if (selectedLanes.includes("Technical Product")) {
    return {
      title: "Role-fit workflow prototype brief",
      artifactType: "case study",
      problemSolved:
        "Shows how ambiguous role needs become a practical product workflow, artifact plan, and measurable outcome.",
      buildTime: "2 hr",
      requiredInputs: [
        "JD problem signals",
        "Target user",
        "Workflow states",
        "Success metric",
      ],
      recommendedTools: [
        "Case-study page",
        "Workflow diagram",
        "Sample UI state",
      ],
      portfolioPlacement: `Add as a strategy layer above ${firstProject}.`,
      successMetric:
        "Reviewer can see the problem-to-solution logic in under two minutes.",
    };
  }

  return {
    title: "Enablement performance support one-pager",
    artifactType: "job aid",
    problemSolved:
      "Converts role expectations, workflow steps, and success signals into a compact support artifact.",
    buildTime: "2 hr",
    requiredInputs: [
      "Target role",
      "Key task",
      "Common blocker",
      "Success signal",
    ],
    recommendedTools: ["One-page PDF", "Workflow checklist", "Manager note"],
    portfolioPlacement: `Use to close the evidence gap around ${firstGap}.`,
    successMetric: "Reduced ambiguity for one critical role task.",
  };
}

function buildStrategyReport(
  selectedLanes: Lane[],
  selectedProjects: PortfolioProject[],
  selectedProofPoints: ProofPoint[],
  selectedSkills: string[],
  sources: StudioBrainSource[],
  targetText: string,
): StrategyReport {
  const likelyProblems = getLikelyProblems(selectedLanes, targetText);
  const portfolioMatches = selectedProjects
    .slice(0, 3)
    .map((project, index) => {
      const approvedSources = getSourceCoverage(project, sources).length;
      const strength: "strong" | "moderate" | "supporting" =
        index === 0 || approvedSources > 0
          ? "strong"
          : project.readiness.includes("portfolio-ready")
            ? "moderate"
            : "supporting";
      const matchedLanes = project.lanes
        .filter((lane) => selectedLanes.includes(lane))
        .join(", ");
      return {
        project,
        strength,
        reason:
          matchedLanes.length > 0
            ? `Matches ${matchedLanes} and supports ${project.proofIds.length} proof points.`
            : `Supports adjacent proof through ${project.role.toLowerCase()}.`,
      };
    });
  const missingFromProjects = selectedProjects.flatMap(
    (project) => project.visual.missing ?? project.evidenceNeeds,
  );
  const lowEvidenceProjects = selectedProjects
    .filter((project) => getSourceCoverage(project, sources).length === 0)
    .map((project) => `Approved source for ${project.shortTitle}`);
  const evidenceGaps = [...lowEvidenceProjects, ...missingFromProjects]
    .filter((gap, index, list) => list.indexOf(gap) === index)
    .slice(0, 5);
  const skillMatrix = selectedSkills.slice(0, 6).map((skill) => {
    const normalizedSkill = normalizeText(skill);
    const evidenceProjects = projects.filter((project) =>
      [...project.tools, ...project.lanes, project.role, project.title].some(
        (term) =>
          normalizeText(term).includes(normalizedSkill.split(" ")[0] ?? ""),
      ),
    );
    const strength: "Strong" | "Moderate" | "Gap" =
      evidenceProjects.length >= 3
        ? "Strong"
        : evidenceProjects.length > 0
          ? "Moderate"
          : "Gap";
    return {
      skill,
      evidence:
        evidenceProjects.length > 0
          ? `${Math.min(evidenceProjects.length, 9)} portfolio signals`
          : "No explicit project signal",
      strength,
    };
  });
  const fitScore = Math.min(
    96,
    58 +
      selectedLanes.length * 6 +
      selectedProjects.filter((project) =>
        project.readiness.includes("portfolio-ready"),
      ).length *
        5 +
      selectedProofPoints.length * 3 -
      evidenceGaps.length * 2,
  );

  return {
    likelyProblems,
    portfolioMatches,
    evidenceGaps,
    skillMatrix,
    fitScore,
    artifactBrief: getArtifactBrief(
      selectedLanes,
      evidenceGaps,
      selectedProjects,
    ),
  };
}

function getReviewerBadge(primaryLane: Lane) {
  const labels: Record<Lane, string> = {
    Enablement: "Role-Aligned Proof",
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

function buildVisualSnapshots(
  selectedProjects: PortfolioProject[],
  sources: StudioBrainSource[],
): SavedVisualSnapshot[] {
  return selectedProjects.map((project) => ({
    projectId: project.id,
    projectTitle: project.shortTitle,
    visualSrc: project.visual.src,
    visualQuality: project.visual.quality,
    readiness: project.readiness,
    approvedSourceCount: getSourceCoverage(project, sources).length,
    missing: (project.visual.missing ?? project.evidenceNeeds).slice(0, 3),
  }));
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
  const laneText = selectedLanes.slice(0, 2).join(" + ");
  return `A quick view of ${laneText} evidence: workflow, learning architecture, measurable delivery, and practical adoption.`;
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
  const palette = "bg-[#bfe9f8]";

  return (
    <article
      className={`border border-black/15 ${palette} p-3 text-black sm:p-4`}
    >
      <div className="relative overflow-hidden border border-black/15 bg-white/50">
        <img
          src={project.visual.src}
          alt={project.visual.alt}
          className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
        />
        <div className="absolute left-2 top-2 bg-black px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-white sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
          {project.shortTitle}
        </div>
      </div>
      <div className="space-y-3 pt-4 sm:space-y-4 sm:pt-5">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-black/55 sm:text-xs">
            {project.role}
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold leading-[1.02] sm:text-3xl">
            {project.title}
          </h3>
        </div>
        <p className="text-sm leading-6 text-black/68">{project.summary}</p>
        <div className="hidden gap-px overflow-hidden border border-black/15 bg-black/15 md:grid md:grid-cols-3">
          <div>
            <p className="bg-white/65 p-3 font-mono text-xs uppercase tracking-[0.16em] text-black/45">
              Before
            </p>
            <p className="bg-white/65 px-3 pb-3 text-sm leading-5 text-black/65">
              {project.problem}
            </p>
          </div>
          <div>
            <p className="bg-white/65 p-3 font-mono text-xs uppercase tracking-[0.16em] text-black/45">
              What changed
            </p>
            <ul className="space-y-1 bg-white/65 px-3 pb-3 text-sm leading-5 text-black/65">
              {project.actions.slice(0, 2).map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="bg-white/65 p-3 font-mono text-xs uppercase tracking-[0.16em] text-black/45">
              Result
            </p>
            <ul className="space-y-1 bg-white/65 px-3 pb-3 text-sm leading-5 text-black/65">
              {project.outcomes.slice(0, 2).map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-l-2 border-black/25 pl-3 text-sm leading-6 text-black/65 md:hidden">
          {project.outcomes[0] ?? project.problem}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {project.tools.slice(0, 5).map((tool) => (
            <Badge key={tool} variant="secondary">
              {tool}
            </Badge>
          ))}
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-black"
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

function SnapshotProjectTile({
  project,
  featured = false,
}: {
  project: PortfolioProject;
  featured?: boolean;
}) {
  return (
    <article
      className={`group flex min-h-0 flex-col border border-black/15 ${
        featured ? "bg-[#bfe9f8]" : "bg-[#f4f1ea]"
      } p-2 text-black`}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden border border-black/15 bg-white/55">
        <img
          src={project.visual.src}
          alt={project.visual.alt}
          className="h-full min-h-[150px] w-full object-cover transition duration-300 group-hover:scale-[1.02] lg:min-h-0"
        />
        <div className="absolute left-2 top-2 bg-black px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-white">
          {project.shortTitle}
        </div>
      </div>
      <div className="space-y-2 pt-3">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-black/55">
          {project.role}
        </p>
        <h3 className="font-display text-xl font-semibold leading-[1.02] lg:text-[clamp(1.15rem,1.6vw,2rem)]">
          {project.title}
        </h3>
        <p className="line-clamp-2 text-xs leading-5 text-black/68 lg:text-sm">
          {project.summary}
        </p>
        <p className="border-l-2 border-black/25 pl-3 text-xs font-medium leading-5 text-black/75">
          {project.outcomes[0] ?? project.problem}
        </p>
      </div>
    </article>
  );
}

function SnapshotMetricTile({ metric }: { metric: ProofPoint }) {
  return (
    <div className="border border-black/15 bg-white/55 p-3">
      <p className="font-display text-2xl font-semibold leading-none text-black lg:text-3xl">
        {metric.value}
      </p>
      <p className="mt-1 text-xs font-semibold leading-5 text-black/72">
        {metric.label}
      </p>
    </div>
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
  const displayCustomization = getDisplayCustomization();
  const displayProfile = getDisplayProfile(displayCustomization);
  const displayProjects = model.selectedProjects.map((project) =>
    getDisplayProject(project, displayCustomization),
  );
  const reviewerBadge = getReviewerBadge(model.primaryLane);
  const nameParts = displayProfile.name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? displayProfile.name;
  const remainingName = nameParts.slice(1).join(" ") || "Portfolio";
  const compactSkills = model.selectedSkills.slice(0, 6);

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-black">
      <section className="mx-auto flex max-w-[1800px] flex-col gap-3 px-3 py-3 sm:px-4 lg:h-screen lg:max-h-[980px] lg:min-h-[760px] lg:overflow-hidden">
        <header className="grid gap-3 lg:h-[34vh] lg:max-h-[330px] lg:min-h-[265px] lg:grid-cols-[0.7fr_1.3fr] lg:overflow-hidden">
          <div className="border border-black/15 bg-[#f4f1ea] p-4 lg:p-5">
            <div className="flex items-start justify-between gap-4">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-black/55">
                {reviewerBadge}
              </p>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-black/55">
                {displayProfile.location}
              </p>
            </div>
            <h1 className="mt-5 font-display text-[clamp(3.2rem,10vw,8.5rem)] font-semibold leading-[0.86] lg:mt-6 lg:text-[clamp(3.8rem,5vw,6.4rem)]">
              {firstName}
              <br />
              {remainingName}
            </h1>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_0.78fr]">
            <div className="border border-black/15 bg-[#bfe9f8] p-4 lg:p-5">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-black/55">
                {displayProfile.title}
              </p>
              <p className="mt-4 max-w-4xl font-display text-3xl font-semibold leading-[0.98] lg:text-[clamp(1.8rem,2.4vw,3.1rem)]">
                {displayProfile.headline}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-black/68">
                {displayProfile.shortSummary}
              </p>
            </div>

            <div className="border border-black/15 bg-black p-3 text-white">
              {displayProfile.profileImage ? (
                <img
                  src={displayProfile.profileImage}
                  alt={displayProfile.name}
                  className="aspect-[16/10] h-full w-full object-cover lg:aspect-auto"
                />
              ) : (
                <div className="flex h-full min-h-[190px] flex-col justify-between border border-white/20 p-4">
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/55">
                    {displayProfile.name}
                  </span>
                  <div>
                    <p className="font-display text-6xl font-semibold leading-none">
                      TB
                    </p>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-white/65">
                      Practical systems, thoughtful learning, cleaner execution.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {status === "loading" && (
          <span className="sr-only">Loading portfolio</span>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {model.selectedProofPoints.map((metric) => (
            <SnapshotMetricTile key={metric.id} metric={metric} />
          ))}
        </div>

        <section className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="grid min-h-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayProjects.slice(0, 3).map((project, index) => (
              <SnapshotProjectTile
                key={project.id}
                project={project}
                featured={index === 0}
              />
            ))}
          </div>

          <aside className="grid min-h-0 gap-3 lg:grid-rows-[auto_auto_1fr] lg:overflow-hidden">
            <div className="border border-black/15 bg-white/55 p-4">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-black/55">
                Selected For
              </p>
              <p className="mt-3 text-sm leading-6 text-black/72">
                {getRelevanceCopy(model.selectedLanes)}
              </p>
            </div>
            <div className="border border-black/15 bg-white/55 p-4">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-black/55">
                Skills In View
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {compactSkills.map((skill) => (
                  <span
                    key={skill}
                    className="border border-black/20 bg-[#f8f5ef] px-2.5 py-1 text-xs font-medium text-black/75"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="border border-black/15 bg-white/55 p-4">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-black/55">
                Human Context
              </p>
              <div className="mt-3 space-y-3">
                {humanHighlights.slice(0, 2).map((item) => (
                  <div key={item.label}>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-black/65">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 border border-black/15 bg-[#f4f1ea] px-4 py-3 lg:hidden">
          <p className="text-sm leading-6 text-black/68">
            Want more depth? Each selected item is ready for a focused case
            study, artifact preview, or repo link as media is approved.
          </p>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-black"
          >
            GitHub
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-5 lg:hidden">
        <div className="space-y-5">
          <h2 className="font-display text-3xl font-semibold">Case Notes</h2>
          {displayProjects.map((project) => (
            <VisualProjectCard key={project.id} project={project} />
          ))}
          <div className="rounded-none border border-black/15 bg-white/60 p-4 text-black">
            <h3 className="font-display text-2xl font-semibold">Background</h3>
            <div className="mt-4 space-y-4">
              {resumeHighlights.map((item) => (
                <p key={item} className="text-sm leading-6 text-black/70">
                  {item}
                </p>
              ))}
            </div>
          </div>
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
  const [displayCustomization, setDisplayCustomization] =
    useState<DisplayCustomization>(() => getDisplayCustomization());
  const [selectedDisplayProjectId, setSelectedDisplayProjectId] = useState(
    projects[0]?.id ?? "",
  );
  const [displayMessage, setDisplayMessage] = useState("");

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
  const studioOutputs = buildStudioOutputs(
    activeLanes,
    activeProjects,
    activeProofPoints,
  );
  const strategyReport = buildStrategyReport(
    activeLanes,
    activeProjects,
    activeProofPoints,
    recommendedSkills,
    allBrainSources,
    `${company} ${jd}`,
  );
  const displayProfile = getDisplayProfile(displayCustomization);
  const displayProjects = projects.map((project) =>
    getDisplayProject(project, displayCustomization),
  );
  const selectedDisplayProject =
    displayProjects.find(
      (project) => project.id === selectedDisplayProjectId,
    ) ?? displayProjects[0];
  const activeDisplayProjects = activeProjects.map((project) =>
    getDisplayProject(project, displayCustomization),
  );

  const commitDisplayCustomization = (
    next: DisplayCustomization,
    message: string,
  ) => {
    setDisplayCustomization(saveDisplayCustomization(next));
    setDisplayMessage(message);
  };

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

  const handleProfileImageUpload = async (file: File | null) => {
    if (!file) return;
    const profileImage = await readImageAsDataUrl(file);
    commitDisplayCustomization(
      updateDisplayProfile(displayCustomization, { profileImage }),
      "Profile image saved for this draft.",
    );
  };

  const handleProjectVisualUpload = async (file: File | null) => {
    if (!file || !selectedDisplayProject) return;
    const visualSrc = await readImageAsDataUrl(file);
    commitDisplayCustomization(
      updateDisplayProject(displayCustomization, selectedDisplayProject.id, {
        visualSrc,
      }),
      `${selectedDisplayProject.shortTitle} visual saved for this draft.`,
    );
  };

  const handleResetDisplayDraft = () => {
    setDisplayCustomization(resetDisplayCustomization());
    setDisplayMessage("Display draft reset to source defaults.");
  };

  const handleResetDisplayProject = () => {
    if (!selectedDisplayProject) return;
    const next = {
      ...displayCustomization,
      projects: { ...displayCustomization.projects },
    };
    delete next.projects[selectedDisplayProject.id];
    commitDisplayCustomization(
      next,
      `${selectedDisplayProject.shortTitle} reset to source defaults.`,
    );
  };

  const saveTargetProfile = () => {
    const id = makeSlug(activeLanes[0]);
    const visualSnapshots = buildVisualSnapshots(
      activeProjects,
      allBrainSources,
    );
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
      visualSnapshots,
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
    const visualSnapshots = buildVisualSnapshots(
      activeProjects,
      allBrainSources,
    );
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
          visualSnapshots,
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
          visualSnapshots,
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

  const _updateBrainSourceStatus = (
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

  const _toggleBrainSourceProject = (sourceId: string, projectId: string) => {
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

  const _removeBrainSource = (sourceId: string) => {
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
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <Badge variant="outline">Owner Studio</Badge>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Build the reviewer snapshot.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Work left to right: paste the role signal, choose the evidence,
              edit the visible profile and media, run the QA check, then create
              the private link.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["1", "Target", activeLanes[0]],
              ["2", "Work", `${activeProjectIds.length} items`],
              ["3", "Media", `${mediaNeeds.length} needs`],
              ["4", "Link", links[0]?.state ?? "not made"],
            ].map(([step, label, value]) => (
              <div
                key={label}
                className="rounded-md border border-border bg-background p-3"
              >
                <p className="font-mono text-xs uppercase text-muted-foreground">
                  {step}. {label}
                </p>
                <p className="mt-2 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clipboard className="h-5 w-5 text-primary" />
                1. Target Signal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block space-y-2" htmlFor="target-company">
                <span className="text-sm font-medium">Private role label</span>
                <input
                  id="target-company"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="Example: Senior Enablement Architect"
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
                  className="min-h-40"
                  maxLength={2200}
                />
              </label>
              <div className="rounded-md border border-border bg-muted/20 p-3 text-sm leading-6 text-muted-foreground">
                AI assist means: use a short, capped prompt to classify the JD,
                suggest the lane, and recommend projects/metrics. It does not
                run on reviewer page views.
              </div>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SearchCheck className="h-5 w-5 text-primary" />
                2. Evidence Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-md border border-primary/25 bg-primary/10 p-4">
                <p className="text-sm font-semibold">
                  Recommended focus: {analysis.primaryLane}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {analysis.reviewerTakeaway}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Focus lanes
                </p>
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
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Portfolio items
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={resetRecommendations}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => toggleProject(project.id)}
                      className={`rounded-md border p-3 text-left transition-smooth ${
                        activeProjectIds.includes(project.id)
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted/20 hover:border-muted-foreground"
                      }`}
                    >
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
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Proof points
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {proofPoints.map((proofPoint) => (
                    <button
                      key={proofPoint.id}
                      type="button"
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
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                3. Brain and Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Add resumes, notes, screenshots, links, transcripts, or project
                records here. Studio keeps them private until you mark a source
                approved or public-safe.
              </p>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-smooth hover:bg-muted">
                <Upload className="mr-2 h-4 w-4" />
                Import files or media records
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  accept={evidenceBrain.acceptedFiles.join(",")}
                  onChange={(event) => {
                    void importSourceFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={sourceTitle}
                  onChange={(event) => setSourceTitle(event.target.value)}
                  placeholder="Source title"
                />
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={sourceUrl}
                  onChange={(event) => setSourceUrl(event.target.value)}
                  placeholder="Source URL or artifact link"
                />
              </div>
              <Textarea
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                className="min-h-24"
                placeholder="Paste notes, transcript, OCR text, or context"
                maxLength={4000}
              />
              <div className="flex flex-wrap gap-2">
                <select
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={sourceType}
                  onChange={(event) => setSourceType(event.target.value)}
                >
                  {evidenceBrain.sourceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={sourceStatus}
                  onChange={(event) =>
                    setSourceStatus(event.target.value as EvidenceSourceStatus)
                  }
                >
                  {evidenceBrain.statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addBrainSource}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Add source
                </Button>
              </div>
              {importingSources && (
                <p className="text-sm text-muted-foreground">
                  Importing source records...
                </p>
              )}
              <div className="space-y-2">
                {allBrainSources.slice(0, 5).map((source) => (
                  <div
                    key={source.id}
                    className="rounded-md border border-border bg-muted/20 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">{source.title}</p>
                      <Badge variant="outline">{source.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {source.type} - {source.linkedProjectIds.length || 0}{" "}
                      linked projects
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {source.note}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5 lg:sticky lg:top-4 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                4. Public Snapshot Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={displayProfile.name}
                  onChange={(event) =>
                    commitDisplayCustomization(
                      updateDisplayProfile(displayCustomization, {
                        name: event.target.value,
                      }),
                      "Profile name saved.",
                    )
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Name"
                />
                <input
                  value={displayProfile.title}
                  onChange={(event) =>
                    commitDisplayCustomization(
                      updateDisplayProfile(displayCustomization, {
                        title: event.target.value,
                      }),
                      "Profile title saved.",
                    )
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Public title"
                />
              </div>
              <Textarea
                value={displayProfile.headline}
                onChange={(event) =>
                  commitDisplayCustomization(
                    updateDisplayProfile(displayCustomization, {
                      headline: event.target.value,
                    }),
                    "Profile headline saved.",
                  )
                }
                rows={3}
                placeholder="One clear positioning sentence"
              />
              <Textarea
                value={displayProfile.shortSummary}
                onChange={(event) =>
                  commitDisplayCustomization(
                    updateDisplayProfile(displayCustomization, {
                      shortSummary: event.target.value,
                    }),
                    "Profile summary saved.",
                  )
                }
                rows={4}
                placeholder="Brief supporting summary"
              />
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-smooth hover:bg-muted">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload profile image
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      void handleProfileImageUpload(
                        event.target.files?.[0] ?? null,
                      );
                      event.target.value = "";
                    }}
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetDisplayDraft}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset display
                </Button>
              </div>

              {selectedDisplayProject && (
                <div className="rounded-md border border-border bg-muted/20 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      Project thumbnail and copy
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleResetDisplayProject}
                    >
                      Reset item
                    </Button>
                  </div>
                  <select
                    value={selectedDisplayProjectId}
                    onChange={(event) =>
                      setSelectedDisplayProjectId(event.target.value)
                    }
                    className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {displayProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.shortTitle}
                      </option>
                    ))}
                  </select>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input
                      value={selectedDisplayProject.title}
                      onChange={(event) =>
                        commitDisplayCustomization(
                          updateDisplayProject(
                            displayCustomization,
                            selectedDisplayProject.id,
                            { title: event.target.value },
                          ),
                          "Project title saved.",
                        )
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Project title"
                    />
                    <input
                      value={selectedDisplayProject.role}
                      onChange={(event) =>
                        commitDisplayCustomization(
                          updateDisplayProject(
                            displayCustomization,
                            selectedDisplayProject.id,
                            { role: event.target.value },
                          ),
                          "Project role saved.",
                        )
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Role/category"
                    />
                  </div>
                  <Textarea
                    value={selectedDisplayProject.summary}
                    onChange={(event) =>
                      commitDisplayCustomization(
                        updateDisplayProject(
                          displayCustomization,
                          selectedDisplayProject.id,
                          { summary: event.target.value },
                        ),
                        "Project summary saved.",
                      )
                    }
                    className="mt-3"
                    rows={3}
                    placeholder="Project summary"
                  />
                  <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-smooth hover:bg-muted">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload project thumbnail
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) => {
                        void handleProjectVisualUpload(
                          event.target.files?.[0] ?? null,
                        );
                        event.target.value = "";
                      }}
                    />
                  </label>
                  <img
                    src={selectedDisplayProject.visual.src}
                    alt={selectedDisplayProject.visual.alt}
                    className="mt-3 aspect-[16/9] w-full rounded-md border border-border object-cover"
                  />
                </div>
              )}
              {displayMessage && (
                <p className="text-sm text-muted-foreground">
                  {displayMessage}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                5. QA Before Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-md border border-border bg-muted/20 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Role fit
                  </p>
                  <p className="mt-1 font-display text-3xl font-semibold">
                    {strategyReport.fitScore}%
                  </p>
                </div>
                <div className="rounded-md border border-border bg-muted/20 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Next artifact
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {strategyReport.artifactBrief.title}
                  </p>
                </div>
              </div>
              <div className="rounded-md border border-border bg-muted/20 p-3">
                <p className="text-sm font-medium">Public snapshot preview</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {displayProfile.headline}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {activeDisplayProjects.slice(0, 3).map((project) => (
                    <div
                      key={project.id}
                      className="rounded-md border border-border bg-background p-2"
                    >
                      <img
                        src={project.visual.src}
                        alt={project.visual.alt}
                        className="aspect-[16/9] w-full rounded object-cover"
                      />
                      <p className="mt-2 text-xs font-medium">
                        {project.shortTitle}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {mediaNeeds.length > 0 ? (
                <div className="rounded-md border border-primary/35 bg-primary/10 p-3">
                  <p className="text-sm font-medium">Media to improve</p>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
                    {mediaNeeds.slice(0, 4).map(({ project, needs }) => (
                      <li key={project.id}>
                        {project.shortTitle}: {needs[0]}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="rounded-md border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                  Current selected media is approved for reviewer use.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveTargetProfile}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save profile
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={exportWorkspaceBackup}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export workspace
                </Button>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-smooth hover:bg-muted">
                  <Upload className="mr-2 h-4 w-4" />
                  Restore
                  <input
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
                <p className="text-sm text-muted-foreground">{backupMessage}</p>
              )}
              {savedProfiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Saved profiles
                  </p>
                  {savedProfiles.slice(0, 3).map((targetProfile) => (
                    <button
                      key={targetProfile.id}
                      type="button"
                      onClick={() => applyTargetProfile(targetProfile)}
                      className="w-full rounded-md border border-border bg-muted/20 p-3 text-left text-sm hover:border-muted-foreground"
                    >
                      <span className="font-medium">{targetProfile.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {targetProfile.lanes.join(", ")}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LockKeyhole className="h-5 w-5 text-primary" />
                6. Private Reviewer Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-6 text-muted-foreground">
                Links use opaque slugs and keep the company/JD details inside
                Studio. Archived links route back to the general portfolio
                instead of showing an expired page.
              </p>
              <Button
                type="button"
                onClick={createLink}
                className="w-full"
                disabled={saving}
              >
                <Link2 className="mr-2 h-4 w-4" />
                {saving ? "Generating..." : "Generate reviewer link"}
              </Button>
              {links.slice(0, 4).map((link) => (
                <div
                  key={link.slug}
                  className="rounded-md border border-border p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{link.label}</span>
                    <Badge variant="outline">{link.state}</Badge>
                  </div>
                  <p className="mt-2 break-all text-muted-foreground">
                    {link.url}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <a
                      href={link.url}
                      className="inline-flex items-center gap-1 text-primary"
                    >
                      Open <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      className="text-primary"
                      onClick={() =>
                        setLinkArchived(link.slug, link.state === "active")
                      }
                    >
                      {link.state === "active" ? "Archive" : "Reactivate"}
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Copy Outputs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  copyStudioOutput("Recruiter summary", studioOutputs.recruiter)
                }
              >
                <Clipboard className="mr-2 h-4 w-4" />
                Copy recruiter summary
              </Button>
              <p className="text-sm leading-6 text-muted-foreground">
                {studioOutputs.recruiter}
              </p>
              {copyMessage && (
                <p className="text-sm text-muted-foreground">{copyMessage}</p>
              )}
              {manualCopy && (
                <Textarea
                  readOnly
                  value={manualCopy.text}
                  onFocus={(event) => event.currentTarget.select()}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
