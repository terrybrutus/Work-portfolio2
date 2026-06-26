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
};

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
  repo?: string;
  source?: string;
};

export type LaneProfile = {
  lane: Lane;
  headline: string;
  reviewerTakeaway: string;
  keywords: string[];
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
    "Enablement and learning systems builder with experience across defense, SaaS, municipal, sales, healthcare, fintech, and AI-assisted content operations.",
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
    headline: "Product-minded builds that make messy workflows easier to use.",
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
      "A repeatable content-operations system using RAG-style review, scripting, and human QA to speed high-volume talent asset production.",
    problem:
      "High-volume learning assets needed faster analysis, cleaner metadata, and repeatable compliance alignment without removing expert review.",
    actions: [
      "Converted repeated analysis work into a structured AI-assisted review workflow.",
      "Used NotebookLM, scripting, and documented standards to keep the workflow repeatable.",
      "Kept human QA gates in the process so the system accelerated judgment instead of replacing it.",
    ],
    outcomes: [
      "Reduced per-deliverable processing from 1.5 hours to 9.5 minutes.",
      "Helped establish a repeatable production standard for future content work.",
      "Created credible proof of practical AI adoption inside a real enablement workflow.",
    ],
    proofIds: ["asset-cycle", "audit-cost"],
    tools: ["NotebookLM", "RAG", "Python", "VBA", "PowerShell", "QA"],
    lanes: ["AI Operations", "Enablement", "Compliance"],
    visual: {
      src: "/assets/portfolio/terrylxd-projects.png",
      alt: "Screenshot of a dark portfolio projects section with interactive learning project cards.",
      caption: "Representative project-card treatment from TerryLXD.",
    },
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
      "Created a product-style proof point for enablement operations and workflow design.",
    ],
    proofIds: ["release-depth", "feature-set"],
    tools: ["Caffeine AI", "GitHub", "React", "JSON", "Agile delivery"],
    lanes: ["Technical Product", "Enablement", "AI Operations"],
    visual: {
      src: "/assets/portfolio/terrylxd-hero.png",
      alt: "Screenshot of TerryLXD portfolio hero with dark interactive visual style.",
      caption: "Visual direction from the TerryLXD portfolio system.",
    },
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
      src: "/assets/portfolio/old-site-recent-projects.png",
      alt: "Screenshot of older portfolio recent projects page showing an eLearning module visual.",
      caption:
        "Legacy portfolio artifact showing eLearning and project evidence.",
    },
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
      src: "/assets/portfolio/old-site-project-menu.png",
      alt: "Screenshot of old instructional design portfolio project menu.",
      caption:
        "Legacy project menu with compliance and instructional-design artifacts.",
    },
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
      "Shows how compliance content can become active judgment practice.",
      "Provides strong visual evidence for eLearning, security, and scenario design roles.",
    ],
    proofIds: ["municipal-coverage", "army-lms"],
    tools: ["Scenario design", "eLearning", "Security awareness"],
    lanes: ["Learning Experience", "Compliance", "Technical Product"],
    visual: {
      src: "/assets/portfolio/terrylxd-projects.png",
      alt: "Screenshot showing a phishing red flags learning interaction card.",
      caption: "Project screenshot from TerryLXD featured work.",
    },
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
      "Converted abstract blockchain concepts into a visual comparison interaction.",
      "Used minimalist motion and contrast to clarify centralized versus decentralized structures.",
      "Designed the module as a short conceptual bridge rather than a dense technical lecture.",
    ],
    outcomes: [
      "Demonstrates technical translation and visual learning strategy.",
      "Fits roles involving product education, customer education, and technical enablement.",
    ],
    proofIds: ["army-lms"],
    tools: ["Technical training", "Visual explanation", "Interaction design"],
    lanes: ["Learning Experience", "Technical Product", "Enablement"],
    visual: {
      src: "/assets/portfolio/terrylxd-projects.png",
      alt: "Screenshot showing a centralized versus decentralized learning module card.",
      caption: "Project screenshot from TerryLXD featured work.",
    },
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
      src: "/assets/portfolio/old-site-project-menu.png",
      alt: "Screenshot of legacy instructional design portfolio menu with ADDIE, QA, job aid, and facilitator guide items.",
      caption:
        "Legacy instructional-design artifacts to be consolidated into the new portfolio.",
    },
    source: "instructionaldesignbyterry.com",
  },
  {
    id: "career-city",
    title: "Career City",
    shortTitle: "Career City",
    role: "Learning Product Designer",
    summary:
      "An interactive career-development concept that frames career growth as a visual, explorable learning product.",
    problem:
      "Career growth often feels abstract, especially when people need to compare paths, choices, and next steps.",
    actions: [
      "Designed a gameful learning concept around career exploration and decision-making.",
      "Used AI-assisted build workflows to move from concept to working app direction.",
      "Framed learning strategy as an interactive product rather than a static course.",
    ],
    outcomes: [
      "Shows product thinking, learning strategy, and AI-enabled build capability in one artifact.",
      "Creates a foundation for future learning experience apps.",
    ],
    proofIds: ["release-depth"],
    tools: ["Caffeine AI", "Gameful learning", "React", "Learning strategy"],
    lanes: ["Learning Experience", "Technical Product", "AI Operations"],
    visual: {
      src: "/assets/images/placeholder.svg",
      alt: "Placeholder visual for Career City until a production screenshot is added.",
      caption:
        "Needs a current screenshot or short GIF from the Career City build.",
    },
    repo: "https://github.com/terrybrutus/career-city",
  },
];

export const resumeHighlights = [
  "Senior Talent Development Lead and AI Enablement Architect at CTEC, supporting a 158,000-person defense acquisition workforce.",
  "Lead Talent Enablement and Experience Architect through Legacy Learning Consulting across enterprise, municipal, sales, healthcare, and SaaS contexts.",
  "Instructional Systems Designer background with technical simulation and Army LMS deployment experience at 1.2M+ user scale.",
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
