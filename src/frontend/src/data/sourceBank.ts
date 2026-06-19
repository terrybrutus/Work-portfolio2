export type Lane =
  | "Enablement"
  | "AI Operations"
  | "Learning Experience"
  | "Technical Product"
  | "Sales Enablement"
  | "Compliance";

export type ProofPoint = {
  label: string;
  value: string;
  lanes: Lane[];
};

export type PortfolioProject = {
  id: string;
  title: string;
  role: string;
  summary: string;
  problem: string;
  actions: string[];
  outcomes: string[];
  metrics: ProofPoint[];
  tools: string[];
  lanes: Lane[];
  repo?: string;
};

export const profile = {
  name: "Terry Brutus",
  title: "Principal Technical Enablement / AI Learning Architect",
  location: "Leland, NC",
  email: "terrbrutus@gmail.com",
  phone: "(212) 603-9163",
  linkedIn: "https://www.linkedin.com/in/terrybrutus",
  github: "https://github.com/terrybrutus",
  headline:
    "I build enablement systems, AI-assisted workflows, and learning products that make complex work easier to execute at scale.",
  shortSummary:
    "Technical enablement leader with a learning architecture background, AI workflow depth, and a track record across federal, SaaS, municipal, sales, healthcare, and fintech environments.",
};

export const proofPoints: ProofPoint[] = [
  {
    label: "Defense workforce supported",
    value: "158,000",
    lanes: ["Enablement", "Compliance"],
  },
  {
    label: "Army LMS platform scale",
    value: "1.2M+ users",
    lanes: ["Learning Experience", "Compliance"],
  },
  {
    label: "Asset pipeline improvement",
    value: "1.5 hrs to 9.5 min",
    lanes: ["AI Operations", "Enablement"],
  },
  {
    label: "Audit cost reduction",
    value: "90%",
    lanes: ["AI Operations", "Compliance"],
  },
  {
    label: "Market lots standardized",
    value: "76,000",
    lanes: ["Sales Enablement", "Enablement"],
  },
  {
    label: "Municipal coverage",
    value: "1,750+ employees",
    lanes: ["Compliance", "Learning Experience"],
  },
  {
    label: "Product iteration depth",
    value: "77+ releases",
    lanes: ["Technical Product", "AI Operations"],
  },
  {
    label: "Workflow feature set",
    value: "50+ features",
    lanes: ["Technical Product", "Enablement"],
  },
];

export const projects: PortfolioProject[] = [
  {
    id: "ai-talent-content-pipeline",
    title: "AI Talent Content Pipeline",
    role: "AI Enablement Architect",
    summary:
      "NotebookLM RAG, scripting, and human-in-the-loop QA process for a 100+ asset talent content pipeline.",
    problem:
      "High-volume learning assets needed faster analysis, cleaner metadata, and repeatable compliance alignment without adding manual review load.",
    actions: [
      "Built an AI-assisted content analysis workflow using NotebookLM, Python, VBA, and Claude Code.",
      "Converted repeatable review logic into documented production standards.",
      "Aligned skill and knowledge assets to operational and regulatory requirements.",
    ],
    outcomes: [
      "Reduced per-deliverable processing time from 1.5 hours to 9.5 minutes.",
      "Adopted as the client standard for future talent content production.",
      "Supported a six-figure contract extension and expanded engagement scope.",
    ],
    metrics: proofPoints.filter((p) =>
      ["Asset pipeline improvement", "Audit cost reduction"].includes(p.label),
    ),
    tools: ["NotebookLM", "RAG", "Python", "VBA", "Claude Code", "PowerShell"],
    lanes: ["AI Operations", "Enablement", "Compliance"],
  },
  {
    id: "living-portfolio-studio",
    title: "Living Portfolio Studio",
    role: "Product Architect / AI Builder",
    summary:
      "Tailorable portfolio system that adapts proof points, projects, language, and visual emphasis to a company or job description.",
    problem:
      "Static resumes and portfolios undersell cross-functional work and cannot speak differently to enablement, AI, product, and LXD audiences.",
    actions: [
      "Designed the source-bank model for projects, metrics, lanes, company language, and expiring tailored links.",
      "Built the interface around company/JD input instead of a static landing page.",
      "Kept LinkedIn and resume lean while moving detailed evidence into tailored portfolio views.",
    ],
    outcomes: [
      "Creates focused views for recruiters, hiring managers, and niche role requirements.",
      "Positions AI-assisted build skill as observable product work, not just a resume claim.",
    ],
    metrics: proofPoints.filter((p) =>
      ["Product iteration depth", "Workflow feature set"].includes(p.label),
    ),
    tools: ["Caffeine AI", "React", "Motoko", "GitHub", "Claude Code", "Codex"],
    lanes: ["Technical Product", "AI Operations", "Enablement"],
    repo: "https://github.com/terrybrutus/Work-portfolio2",
  },
  {
    id: "workflow-management-platform",
    title: "Multi-Project Workflow Management Platform",
    role: "Enablement Systems Designer",
    summary:
      "Custom 6-stage workflow platform for cross-functional content readiness, production visibility, and delivery governance.",
    problem:
      "Manual tracking and handoff friction slowed readiness across a multi-project talent content operation.",
    actions: [
      "Designed a production workflow with status visibility, iterative releases, and stakeholder handoff logic.",
      "Used GitHub-connected deployment to ship directly into production workflows.",
      "Built for scale across a 100+ user operating model.",
    ],
    outcomes: [
      "Eliminated manual tracking friction.",
      "Created a production-grade operating layer across 50+ features and 77+ releases.",
    ],
    metrics: proofPoints.filter((p) =>
      ["Product iteration depth", "Workflow feature set"].includes(p.label),
    ),
    tools: [
      "Caffeine AI",
      "GitHub",
      "JSON",
      "AI prototyping",
      "Agile delivery",
    ],
    lanes: ["Technical Product", "Enablement", "AI Operations"],
  },
  {
    id: "enterprise-onboarding-journey",
    title: "Enterprise Onboarding Journey",
    role: "Lead Talent Enablement Architect",
    summary:
      "Distributed onboarding architecture for a Fortune 500 luxury homebuilder with a large selling-community footprint.",
    problem:
      "A distributed sales ecosystem needed standardized enablement delivery across communities, roles, and employee lifecycle touchpoints.",
    actions: [
      "Mapped onboarding touchpoints across the full employee lifecycle.",
      "Designed scalable enablement architecture for distributed selling communities.",
      "Aligned learning touchpoints to field execution and business operating rhythm.",
    ],
    outcomes: [
      "Standardized enablement delivery across 76,000 market lots.",
      "Created a clearer learning path for 400+ selling communities.",
    ],
    metrics: proofPoints.filter((p) =>
      ["Market lots standardized"].includes(p.label),
    ),
    tools: [
      "Journey mapping",
      "Sales enablement",
      "Lifecycle design",
      "Stakeholder alignment",
    ],
    lanes: ["Sales Enablement", "Enablement", "Learning Experience"],
  },
  {
    id: "compliance-enablement-ecosystem",
    title: "Mobile-First Compliance Enablement Ecosystem",
    role: "Learning Experience Engineer",
    summary:
      "Low-code compliance enablement ecosystem for a zero-LMS municipal environment.",
    problem:
      "A regulated workforce needed audit-ready training coverage without a formal LMS infrastructure.",
    actions: [
      "Designed a mobile-first compliance experience using low-code delivery tools.",
      "Structured tracking and content access for a zero-LMS environment.",
      "Balanced usability with regulatory and audit requirements.",
    ],
    outcomes: [
      "Achieved 100% audit-ready regulatory coverage.",
      "Supported 1,750+ municipal employees.",
    ],
    metrics: proofPoints.filter((p) =>
      ["Municipal coverage"].includes(p.label),
    ),
    tools: [
      "Low-code tools",
      "Compliance design",
      "Mobile-first UX",
      "Audit readiness",
    ],
    lanes: ["Compliance", "Learning Experience", "Enablement"],
  },
  {
    id: "career-city",
    title: "Career City",
    role: "Learning Product Designer",
    summary:
      "Interactive career-development concept that turns career growth into a more visual, explorable learning experience.",
    problem:
      "Career development often feels abstract and hard to navigate, especially when users need to compare paths, choices, and next steps.",
    actions: [
      "Designed a visual product concept around career exploration and progression.",
      "Used AI-assisted build workflows to move from idea to working app direction.",
      "Framed learning strategy as an interactive product rather than a static course.",
    ],
    outcomes: [
      "Shows product thinking, learning strategy, and AI-enabled build capability in one portfolio item.",
      "Creates a foundation for future learning experience apps.",
    ],
    metrics: [],
    tools: ["Caffeine AI", "Gameful learning", "React", "Learning strategy"],
    lanes: ["Learning Experience", "Technical Product", "AI Operations"],
    repo: "https://github.com/terrybrutus/career-city",
  },
];

export const resumeHighlights = [
  "Senior Talent Development Lead & AI Enablement Architect at CTEC, supporting a 158,000-person defense acquisition workforce.",
  "Lead Talent Enablement & Experience Architect through Legacy Learning Consulting across enterprise, municipal, sales, healthcare, and SaaS contexts.",
  "Instructional Systems Designer at Pinnacle Solutions/Akima, with technical simulation and Army LMS deployment experience at 1.2M+ user scale.",
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
];
