import List "mo:core/List";
import PortfolioTypes "../types/portfolio";

module {
  public type Project = PortfolioTypes.Project;

  public func listProjects(projects : List.List<Project>) : [Project] {
    projects.toArray()
  };

  public func getProject(projects : List.List<Project>, id : Nat) : ?Project {
    projects.find(func(p) { p.id == id })
  };

  public func addProject(projects : List.List<Project>, project : Project) : () {
    projects.add(project);
  };

  public func seedProjects() : [Project] {
    [
      {
        id = 1;
        title = "Leadership Development Program";
        description = "A comprehensive leadership development initiative designed to prepare high-potential employees for director-level roles through blended learning experiences.";
        modality = #ilt;
        challenge = "The organization was experiencing a leadership gap as senior leaders retired, with no structured pipeline to develop internal talent. New managers were struggling with the transition from individual contributor to people leader.";
        approach = "Conducted stakeholder interviews with 12 directors to identify critical leadership competencies. Designed a 6-month blended program combining monthly ILT workshops, peer coaching circles, and self-paced eLearning modules. Created facilitator guides, participant workbooks, and job aids for each module.";
        deliverables = ["Facilitator guide (120 pages)", "Participant workbook", "eLearning modules (6)", "Job aids (4)", "Peer coaching toolkit"];
        results = "92% of participants rated the program as 'excellent' or 'very good'. 78% of graduates were promoted to senior leadership roles within 18 months. Manager engagement scores increased by 24 percentage points.";
        thumbnailUrl = null;
        tags = ["Leadership", "ILT", "Blended Learning", "Organizational Development"];
        createdAt = 1704067200;
      },
      {
        id = 2;
        title = "Customer Service Excellence";
        description = "Redesigned the customer service training program for a high-volume call center environment, focusing on empathy, de-escalation, and first-call resolution.";
        modality = #hybrid;
        challenge = "Customer satisfaction scores were declining while call handle times were increasing. New hires were taking 8 weeks to reach proficiency, and turnover was at 35% annually.";
        approach = "Partnered with operations directors to shadow top-performing agents and identify behavioral differentiators. Redesigned onboarding from 8 weeks to 4 weeks using a competency-based approach. Created scenario-based eLearning modules, role-play activities, and a just-in-time job aid library.";
        deliverables = ["eLearning modules (12)", "Role-play scenarios (20)", "Job aid library (15)", "Assessment rubric", "Manager coaching guide"];
        results = "First-call resolution improved by 18%. New hire time-to-proficiency reduced from 8 weeks to 4 weeks. Customer satisfaction scores increased by 22 points. Annual turnover decreased from 35% to 22%.";
        thumbnailUrl = null;
        tags = ["Customer Service", "Operations", "eLearning", "Onboarding"];
        createdAt = 1711929600;
      },
      {
        id = 3;
        title = "Compliance Training Refresh";
        description = "Modernized annual compliance training from a check-the-box experience to an engaging, scenario-based learning journey that improved knowledge retention and reduced completion time.";
        modality = #eLearning;
        challenge = "Completion rates for annual compliance training were at 68%, well below the 95% regulatory requirement. Learners reported the content as 'boring' and 'irrelevant to my day-to-day work.' Average completion time was 3.5 hours.";
        approach = "Analyzed completion data and learner feedback to identify the most challenging topics. Restructured content into 15-minute microlearning modules with real-world scenarios. Used Articulate Storyline to build branching scenarios where learners make decisions and see consequences. Added gamification elements and progress tracking.";
        deliverables = ["Articulate Storyline course", "Branching scenarios (8)", "Knowledge checks (12)", "Completion dashboard", "Manager reporting toolkit"];
        results = "Completion rates increased from 68% to 97%. Average completion time reduced from 3.5 hours to 1.2 hours. Knowledge assessment scores improved by 31%. Learner satisfaction increased from 2.3/5 to 4.6/5.";
        thumbnailUrl = null;
        tags = ["Compliance", "eLearning", "Articulate", "Microlearning"];
        createdAt = 1717200000;
      }
    ]
  };
};
