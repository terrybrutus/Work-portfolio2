export type Lane =
  | "Enablement"
  | "AI Operations"
  | "Learning Experience"
  | "Technical Product"
  | "Sales Enablement"
  | "Compliance";

export type ProofPoint = {
  id: string;
  label: string;
  value: string;
  detail: string;
  lanes: Lane[];
};

export type VisualAsset = {
  src: string;
  alt: string;
  caption: string;
  quality: "approved" | "needs-source" | "legacy";
  missing?: string[];
};

export type ProjectReadiness =
  | "portfolio-ready"
  | "needs media"
  | "needs metrics"
  | "needs clearer outcome"
  | "needs artifact"
  | "studio-only";

export type PortfolioProject = {
  id: string;
  title: string;
  role: string;
  shortTitle: string;
  summary: string;
  problem: string;
  actions: string[];
  outcomes: string[];
  proofIds: string[];
  tools: string[];
  lanes: Lane[];
  visual: VisualAsset;
  evidenceNeeds: string[];
  readiness: ProjectReadiness[];
  repo?: string;
  source?: string;
};

export type LaneProfile = {
  lane: Lane;
  headline: string;
  reviewerTakeaway: string;
  keywords: string[];
};

export type HumanHighlight = {
  label: string;
  detail: string;
};

export type EvidenceSourceStatus =
  | "approved"
  | "public-safe"
  | "needs redaction"
  | "private only"
  | "needs verification"
  | "too vague";

export type BrainSource = {
  id: string;
  title: string;
  type: string;
  status: EvidenceSourceStatus;
  linkedProjectIds: string[];
  note: string;
  sourceUrl?: string;
};

export const profile = {
  name: "Terry Brutus",
  title: "Enablement Systems, AI Workflow, and Learning Experience Builder",
  location: "Leland, NC",
  email: "terrbrutus@gmail.com",
  phone: "(212) 603-9163",
  linkedIn: "https://www.linkedin.com/in/terrybrutus",
  github: "https://github.com/terrybrutus",
  headline:
    "I design the systems, tools, and learning experiences that help people do complex work with less friction.",
  shortSummary:
    "Enablement systems builder with a learning architecture background, practical AI workflow experience, and proof across regulated, technical, and distributed work environments.",
};

export const laneProfiles: LaneProfile[] = [
  {
    lane: "Enablement",
    headline: "Enablement systems for teams that need clearer execution.",
    reviewerTakeaway:
      "Strongest when the role needs onboarding, manager enablement, skills frameworks, stakeholder alignment, and performance support.",
    keywords: [
      "enablement",
      "onboarding",
      "talent",
      "workforce",
      "manager",
      "stakeholder",
      "readiness",
      "performance",
      "adoption",
      "change",
    ],
  },
  {
    lane: "AI Operations",
    headline: "AI-assisted workflows that make production faster and cleaner.",
    reviewerTakeaway:
      "Strongest when the role needs practical AI adoption, content operations, workflow automation, QA, and human-in-the-loop judgment.",
    keywords: [
      "ai",
      "automation",
      "rag",
      "agent",
      "workflow",
      "python",
      "genai",
      "llm",
      "notebooklm",
      "process",
      "operations",
    ],
  },
  {
    lane: "Learning Experience",
    headline:
      "Learning products that turn complex material into usable practice.",
    reviewerTakeaway:
      "Strongest when the role needs instructional design, simulations, curriculum, eLearning, facilitation, and learner-centered product thinking.",
    keywords: [
      "learning",
      "instructional",
      "lxd",
      "training",
      "curriculum",
      "elearning",
      "facilitation",
      "course",
      "storyboard",
      "addie",
    ],
  },
  {
    lane: "Technical Product",
    headline:
      "Workflow tools and learning systems built around execution, evidence, and adoption.",
    reviewerTakeaway:
      "Strongest when the role needs systems thinking, tooling, prototypes, platforms, user flows, and technical translation.",
    keywords: [
      "product",
      "platform",
      "app",
      "technical",
      "systems",
      "prototype",
      "tool",
      "ux",
      "data",
      "dashboard",
    ],
  },
  {
    lane: "Sales Enablement",
    headline: "Sales and customer enablement tied to field execution.",
    reviewerTakeaway:
      "Strongest when the role needs GTM readiness, sales onboarding, stakeholder messaging, field support, and measurable adoption.",
    keywords: [
      "sales",
      "customer",
      "revenue",
      "gtm",
      "field",
      "seller",
      "readiness",
      "go-to-market",
      "client",
    ],
  },
  {
    lane: "Compliance",
    headline: "Audit-ready learning and workflow systems for regulated teams.",
    reviewerTakeaway:
      "Strongest when the role needs 508/WCAG, governance, documentation, regulated training, or operational compliance.",
    keywords: [
      "compliance",
      "508",
      "wcag",
      "audit",
      "regulated",
      "governance",
      "policy",
      "accessibility",
      "risk",
      "security",
    ],
  },
];

export const proofPoints: ProofPoint[] = [
  {
    id: "defense-workforce",
    label: "Defense workforce supported",
    value: "158,000",
    detail:
      "Supported learning and talent-development systems for a large defense acquisition audience.",
    lanes: ["Enablement", "Compliance"],
  },
  {
    id: "army-lms",
    label: "Army LMS platform scale",
    value: "1.2M+ users",
    detail:
      "Worked in a technical simulation and LMS environment with enterprise-scale deployment expectations.",
    lanes: ["Learning Experience", "Compliance", "Technical Product"],
  },
  {
    id: "asset-cycle",
    label: "Asset cycle improvement",
    value: "1.5 hrs to 9.5 min",
    detail:
      "Reduced repeated talent-content processing with AI-assisted analysis, scripting, and QA standards.",
    lanes: ["AI Operations", "Enablement"],
  },
  {
    id: "audit-cost",
    label: "Audit cost reduction",
    value: "90%",
    detail:
      "Used structured review logic to reduce manual audit burden while keeping human quality gates.",
    lanes: ["AI Operations", "Compliance"],
  },
  {
    id: "market-lots",
    label: "Market lots standardized",
    value: "76,000",
    detail:
      "Designed scalable enablement touchpoints for a distributed selling-community environment.",
    lanes: ["Sales Enablement", "Enablement"],
  },
  {
    id: "municipal-coverage",
    label: "Municipal coverage",
    value: "1,750+ employees",
    detail:
      "Built mobile-first compliance support for a workforce without formal LMS infrastructure.",
    lanes: ["Compliance", "Learning Experience"],
  },
  {
    id: "release-depth",
    label: "Product iteration depth",
    value: "77+ releases",
    detail:
      "Used rapid iteration and GitHub-connected workflows to move ideas into working tools.",
    lanes: ["Technical Product", "AI Operations"],
  },
  {
    id: "feature-set",
    label: "Workflow feature set",
    value: "50+ features",
    detail:
      "Built production workflow features around visibility, handoffs, readiness, and delivery governance.",
    lanes: ["Technical Product", "Enablement"],
  },
];

export const projects: PortfolioProject[] = [
  {
    id: "ai-talent-content-pipeline",
    title: "AI Talent Content Pipeline",
    shortTitle: "AI Content Pipeline",
    role: "AI Enablement Architect",
    summary:
      "A repeatable content-operations system using AI-assisted source review, scripting, and human QA to speed high-volume talent asset production.",
    problem:
      "High-volume learning assets needed faster analysis, cleaner metadata, and repeatable compliance alignment without removing expert review.",
    actions: [
      "Converted repeated analysis work into a structured AI-assisted review workflow.",
      "Used NotebookLM, scripting, and documented standards to keep the workflow repeatable.",
      "Kept human QA gates in the process so the system accelerated judgment instead of replacing it.",
    ],
    outcomes: [
      "Reduced per-deliverable processing from 1.5 hours to 9.5 minutes.",
      "Standardized the review workflow for future talent-content production.",
      "Kept expert review in the loop while reducing repetitive analysis work.",
    ],
    proofIds: ["asset-cycle", "audit-cost"],
    tools: ["NotebookLM", "RAG", "Python", "VBA", "PowerShell", "QA"],
    lanes: ["AI Operations", "Enablement", "Compliance"],
    visual: {
      src: "/assets/portfolio/ai-content-pipeline-map.svg",
      alt: "Process map showing source review, AI review, scripting, QA, and production standard steps.",
      caption:
        "Pipeline map showing source review, AI review, scripting, QA, and production standards.",
      quality: "approved",
      missing: [
        "Redacted pipeline screenshot",
        "Before/after processing-time visual",
        "Sample output or QA checklist preview",
      ],
    },
    evidenceNeeds: [
      "Redacted pipeline screenshot",
      "Before/after timing visual",
      "Sample output or QA checklist preview",
    ],
    readiness: ["portfolio-ready", "needs artifact"],
  },
  {
    id: "workflow-management-platform",
    title: "Multi-Project Workflow Management Platform",
    shortTitle: "Workflow Platform",
    role: "Enablement Systems Designer",
    summary:
      "A custom workflow layer for content readiness, production visibility, stakeholder handoffs, and delivery governance.",
    problem:
      "Manual tracking and handoff friction made it harder to see what work was ready, blocked, in review, or ready to ship.",
    actions: [
      "Designed a multi-stage production workflow with clearer status movement.",
      "Built delivery views around handoffs, ownership, and production readiness.",
      "Used AI-assisted prototyping to move from requirements to release faster.",
    ],
    outcomes: [
      "Reduced manual tracking friction across a multi-project operating model.",
      "Improved visibility into ownership, review status, and delivery readiness.",
    ],
    proofIds: ["release-depth", "feature-set"],
    tools: ["Caffeine AI", "GitHub", "React", "JSON", "Agile delivery"],
    lanes: ["Technical Product", "Enablement", "AI Operations"],
    visual: {
      src: "/assets/portfolio/workflow-platform-map.svg",
      alt: "Workflow map showing intake, build, review, ready, and measure states.",
      caption:
        "Workflow evidence map for status visibility, ownership, review gates, and delivery readiness.",
      quality: "approved",
      missing: [
        "Actual workflow app screenshot",
        "Redacted status board",
        "Before/after tracking diagram",
      ],
    },
    evidenceNeeds: [
      "Actual workflow app screenshot",
      "Redacted status board",
      "Before/after tracking diagram",
    ],
    readiness: ["portfolio-ready", "needs artifact"],
  },
  {
    id: "enterprise-onboarding-journey",
    title: "Enterprise Onboarding and Sales Readiness Journey",
    shortTitle: "Onboarding Journey",
    role: "Lead Talent Enablement Architect",
    summary:
      "A distributed enablement architecture for onboarding, role readiness, and field execution across a large selling-community footprint.",
    problem:
      "A distributed sales ecosystem needed clearer readiness paths across communities, roles, and employee lifecycle moments.",
    actions: [
      "Mapped employee lifecycle moments into a practical enablement journey.",
      "Aligned learning touchpoints to role expectations and business operating rhythm.",
      "Created a more scalable foundation for field-facing readiness support.",
    ],
    outcomes: [
      "Standardized enablement delivery across 76,000 market lots.",
      "Created a clearer learning path for 400+ selling communities.",
    ],
    proofIds: ["market-lots"],
    tools: ["Journey mapping", "Sales enablement", "Lifecycle design"],
    lanes: ["Sales Enablement", "Enablement", "Learning Experience"],
    visual: {
      src: "/assets/portfolio/onboarding-journey-map.svg",
      alt: "Journey map connecting preboarding, role readiness, practice, manager support, and measurement.",
      caption:
        "Journey map showing lifecycle moments, readiness support, and field execution.",
      quality: "needs-source",
      missing: [
        "Actual journey map",
        "Redacted stakeholder map",
        "Onboarding architecture artifact",
      ],
    },
    evidenceNeeds: [
      "Actual journey map",
      "Redacted stakeholder map",
      "Onboarding architecture artifact",
    ],
    readiness: ["needs media", "needs artifact"],
  },
  {
    id: "compliance-enablement-ecosystem",
    title: "Mobile-First Compliance Enablement Ecosystem",
    shortTitle: "Compliance Ecosystem",
    role: "Learning Experience Engineer",
    summary:
      "A low-code, mobile-first compliance learning system for a regulated workforce operating without a formal LMS.",
    problem:
      "A municipal workforce needed audit-ready training coverage without the infrastructure of a traditional learning platform.",
    actions: [
      "Designed mobile-first access patterns for required training and job support.",
      "Balanced audit evidence, usability, and low-code deployment constraints.",
      "Organized content so compliance felt easier to complete and easier to track.",
    ],
    outcomes: [
      "Supported audit-ready coverage for 1,750+ employees.",
      "Demonstrated practical constraints-based design in a regulated environment.",
    ],
    proofIds: ["municipal-coverage"],
    tools: ["Low-code tools", "Compliance design", "Mobile-first UX"],
    lanes: ["Compliance", "Learning Experience", "Enablement"],
    visual: {
      src: "/assets/portfolio/compliance-mobile-flow.svg",
      alt: "Mobile compliance flow showing role access, evidence tracking, and audit readiness.",
      caption:
        "Mobile-first compliance flow for access, completion evidence, and audit readiness.",
      quality: "needs-source",
      missing: [
        "Mobile screen preview",
        "Tracking artifact",
        "Redacted audit-readiness evidence",
      ],
    },
    evidenceNeeds: [
      "Mobile screen preview",
      "Tracking artifact",
      "Redacted audit-readiness evidence",
    ],
    readiness: ["needs media", "needs artifact"],
  },
  {
    id: "phishing-red-flags",
    title: "Spot the Red Flags Phishing Interaction",
    shortTitle: "Phishing Interaction",
    role: "Interactive Learning Designer",
    summary:
      "A scenario-based security learning interaction built around identifying suspicious sender, link, attachment, and urgency cues.",
    problem:
      "Security topics can become passive compliance content when learners only read policy instead of practicing judgment.",
    actions: [
      "Turned phishing recognition into a visual decision activity.",
      "Used focused feedback around realistic red-flag categories.",
      "Kept the interaction short enough for workplace performance support.",
    ],
    outcomes: [
      "Turned compliance content into active judgment practice.",
      "Created a concise interaction pattern for security-awareness decisions.",
    ],
    proofIds: ["municipal-coverage", "army-lms"],
    tools: ["Scenario design", "eLearning", "Security awareness"],
    lanes: ["Learning Experience", "Compliance", "Technical Product"],
    visual: {
      src: "/assets/portfolio/phishing-red-flags-flow.svg",
      alt: "Phishing red flags interaction map showing sender, link, attachment, and urgency cues.",
      caption:
        "Interaction map for a short phishing-recognition practice activity.",
      quality: "approved",
      missing: [
        "Direct interaction screenshot",
        "Short click-through GIF",
        "Clean exported course screen",
      ],
    },
    evidenceNeeds: [
      "Direct interaction screenshot",
      "Short click-through GIF",
      "Clean exported course screen",
    ],
    readiness: ["portfolio-ready", "needs media"],
    source: "terrylxd.com",
  },
  {
    id: "crypto-decentralization-module",
    title: "Centralized vs. Decentralized Learning Module",
    shortTitle: "Crypto Module",
    role: "Complex-Concept Learning Designer",
    summary:
      "A visual learning module that explains decentralization by comparing network structures and learner-controlled progression.",
    problem:
      "Abstract technical topics need concrete visuals and pacing that help non-experts build accurate mental models.",
    actions: [
      "Converted abstract blockchain ideas into a visual comparison interaction.",
      "Used minimalist motion and contrast to clarify centralized versus decentralized structures.",
      "Designed the module as a short visual bridge rather than a dense technical lecture.",
    ],
    outcomes: [
      "Made a technical idea easier to compare visually.",
      "Supports product education, customer education, and technical enablement roles.",
    ],
    proofIds: ["army-lms"],
    tools: ["Technical training", "Visual explanation", "Interaction design"],
    lanes: ["Learning Experience", "Technical Product", "Enablement"],
    visual: {
      src: "/assets/portfolio/decentralization-module-map.svg",
      alt: "Centralized versus decentralized network comparison map for a technical learning module.",
      caption:
        "Technical concept map comparing centralized and decentralized structures.",
      quality: "approved",
      missing: [
        "Direct module screenshot",
        "Short interaction GIF",
        "Clean exported course screen",
      ],
    },
    evidenceNeeds: [
      "Direct module screenshot",
      "Short interaction GIF",
      "Clean exported course screen",
    ],
    readiness: ["portfolio-ready", "needs media"],
    source: "terrylxd.com",
  },
  {
    id: "addie-qa-job-aid-suite",
    title: "ADDIE, QA, Job Aid, and Facilitator Guide Suite",
    shortTitle: "ISD Artifact Suite",
    role: "Instructional Systems Designer",
    summary:
      "A collection of instructional-design artifacts covering analysis, QA, job aids, facilitator support, and storyboard structure.",
    problem:
      "Hiring teams often need evidence that a designer can produce the unglamorous but essential artifacts that keep training consistent.",
    actions: [
      "Created project artifacts across analysis, design, development, QA, and facilitation.",
      "Organized legacy work into reviewer-friendly categories.",
      "Used artifacts to prove process discipline, not just final-course polish.",
    ],
    outcomes: [
      "Strengthens credibility for instructional design and learning systems roles.",
      "Gives reviewers practical evidence beyond high-level claims.",
    ],
    proofIds: ["army-lms", "defense-workforce"],
    tools: ["ADDIE", "QA", "Facilitator guides", "Storyboards", "Job aids"],
    lanes: ["Learning Experience", "Compliance", "Enablement"],
    visual: {
      src: "/assets/portfolio/isd-artifact-suite.svg",
      alt: "Document-preview layout for ADDIE, QA, facilitator guide, job aid, and storyboard artifacts.",
      caption: "Artifact suite map for instructional design process evidence.",
      quality: "needs-source",
      missing: [
        "Redacted document previews",
        "PDF thumbnails",
        "Storyboard or job-aid screenshots",
      ],
    },
    evidenceNeeds: [
      "Redacted document previews",
      "PDF thumbnails",
      "Storyboard or job-aid screenshots",
    ],
    readiness: ["needs media", "needs artifact"],
    source: "instructionaldesignbyterry.com",
  },
  {
    id: "career-city",
    title: "Career City",
    shortTitle: "Career City",
    role: "Learning Product Designer",
    summary:
      "An interactive career-development prototype that frames career growth as a visual, explorable learning product.",
    problem:
      "Career growth often feels abstract, especially when people need to compare paths, choices, and next steps.",
    actions: [
      "Designed a gameful learning flow around career exploration and decision-making.",
      "Used AI-assisted build workflows to move from idea to working prototype.",
      "Framed learning strategy as an interactive product rather than a static course.",
    ],
    outcomes: [
      "Shows product thinking, learning strategy, and AI-enabled build capability in one artifact.",
      "Demonstrates how career navigation can become an interactive learning product.",
    ],
    proofIds: ["release-depth"],
    tools: ["Caffeine AI", "Gameful learning", "React", "Learning strategy"],
    lanes: ["Learning Experience", "Technical Product", "AI Operations"],
    visual: {
      src: "/assets/portfolio/career-city-preview.svg",
      alt: "Career City preview showing explore, choose, practice, and earn-artifact steps.",
      caption: "Prototype map for the Career City learning-product flow.",
      quality: "approved",
      missing: [
        "Actual app screenshot",
        "Short gameplay GIF",
        "Demo or deployed app link",
      ],
    },
    evidenceNeeds: [
      "Actual app screenshot",
      "Short gameplay GIF",
      "Demo or deployed app link",
    ],
    readiness: ["portfolio-ready", "needs artifact"],
    repo: "https://github.com/terrybrutus/career-city",
  },
];

export const evidenceBrain = {
  acceptedFiles: [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".mp4",
    ".webm",
    ".pdf",
    ".docx",
    ".pptx",
    ".txt",
    ".md",
    ".csv",
  ],
  sourceTypes: [
    "Resume",
    "LinkedIn text",
    "Project screenshot",
    "Demo GIF/video",
    "Document preview",
    "Raw notes",
    "Transcript",
    "GitHub repo",
    "Old website artifact",
    "Metric/source evidence",
  ],
  qualityChecks: [
    "Project match",
    "Readable crop",
    "No private/client-sensitive information",
    "Clear artifact status",
    "Strong enough for reviewer view",
  ],
  statuses: [
    "approved",
    "public-safe",
    "needs redaction",
    "private only",
    "needs verification",
    "too vague",
  ] satisfies EvidenceSourceStatus[],
};

export const brainSources: BrainSource[] = [
  {
    id: "latest-resume",
    title: "Current resume",
    type: "Resume",
    status: "needs verification",
    linkedProjectIds: [
      "ai-talent-content-pipeline",
      "workflow-management-platform",
    ],
    note: "Good for role language, metrics, and work history; verify wording before publishing.",
  },
  {
    id: "linkedin-profile",
    title: "LinkedIn profile export",
    type: "LinkedIn text",
    status: "needs verification",
    linkedProjectIds: [
      "enterprise-onboarding-journey",
      "addie-qa-job-aid-suite",
    ],
    note: "Useful for role history, but should be simmered down before becoming public copy.",
  },
  {
    id: "legacy-isd-site",
    title: "Instructional Design by Terry artifacts",
    type: "Old website artifact",
    status: "needs redaction",
    linkedProjectIds: ["phishing-red-flags", "addie-qa-job-aid-suite"],
    note: "Good source for older ISD proof; media needs cleaner crops and current framing.",
    sourceUrl: "https://www.instructionaldesignbyterry.com",
  },
  {
    id: "terrylxd-site",
    title: "TerryLXD portfolio screenshots",
    type: "Old website artifact",
    status: "needs redaction",
    linkedProjectIds: ["phishing-red-flags", "crypto-decentralization-module"],
    note: "Helpful as discovery evidence, but public cards need direct project media.",
    sourceUrl: "https://terrylxd.com",
  },
  {
    id: "github-repos",
    title: "GitHub project repos",
    type: "GitHub repo",
    status: "public-safe",
    linkedProjectIds: ["career-city", "workflow-management-platform"],
    note: "Useful for shipped-work evidence and technical credibility.",
    sourceUrl: "https://github.com/terrybrutus",
  },
];

export const resumeHighlights = [
  "Senior Talent Development Lead and AI Enablement Architect at CTEC, supporting a 158,000-person defense acquisition workforce.",
  "Lead Talent Enablement and Experience Architect through Legacy Learning Consulting across enterprise, municipal, sales, healthcare, and SaaS contexts.",
  "Instructional Systems Designer background with technical simulation and Army LMS deployment experience at 1.2M+ user scale.",
];

export const humanHighlights: HumanHighlight[] = [
  {
    label: "Former Division I athlete",
    detail:
      "Played basketball at Ole Miss, so preparation, feedback, pressure, and team standards are part of how I work.",
  },
  {
    label: "Competitive outlet",
    detail:
      "Pickleball keeps the same quick-read, adjust-fast energy alive without pretending every problem needs a full playbook.",
  },
  {
    label: "Maker mindset",
    detail:
      "Sewing and making clothes sharpen the same instincts I use in systems work: fit, iteration, detail, and craft.",
  },
];

export const skills = [
  "Talent journey architecture",
  "Technical enablement",
  "AI workflow automation",
  "Skills-based framework design",
  "Manager enablement",
  "Section 508/WCAG",
  "NotebookLM RAG",
  "Python",
  "VBA",
  "JSON",
  "Caffeine AI",
  "Claude Code",
  "Codex",
  "Articulate/Rise 360",
  "SQL",
  "Agile/Scrum",
  "Scenario design",
  "Facilitator guides",
  "Job aids",
  "Storyboard design",
];

export function getProofPoints(ids: string[]) {
  return ids
    .map((id) => proofPoints.find((proofPoint) => proofPoint.id === id))
    .filter((proofPoint): proofPoint is ProofPoint => Boolean(proofPoint));
}
