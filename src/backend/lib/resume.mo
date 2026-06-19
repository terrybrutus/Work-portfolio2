import ResumeTypes "../types/resume";

module {
  public type Resume = ResumeTypes.Resume;
  public type ExperienceEntry = ResumeTypes.ExperienceEntry;
  public type EducationEntry = ResumeTypes.EducationEntry;
  public type Skill = ResumeTypes.Skill;
  public type Certification = ResumeTypes.Certification;

  public func getResume(resume : ?Resume) : ?Resume {
    resume
  };

  public func seedResume() : Resume {
    {
      name = "Terry Brutus";
      title = "Senior Learning Experience Designer";
      summary = "Consultative, business-first learning designer with 5+ years of experience diagnosing organizational needs and building solutions that deliver measurable results. Expert in ILT design, eLearning development, and blended learning strategies. Proven ability to own large-scale design projects from kickoff through rollout with minimal oversight.";
      email = "terry.brutus@email.com";
      phone = ?"(555) 123-4567";
      location = "Remote / Richmond, VA";
      linkedIn = ?"linkedin.com/in/terrybrutus";
      website = null;
      experience = [
        {
          id = 1;
          company = "Mission Lane";
          title = "Senior Learning Experience Designer";
          location = "Richmond, VA (Remote)";
          startDate = "2023";
          endDate = null;
          description = "Partner with operations directors and senior leaders to diagnose team development needs and build learning solutions that drive measurable improvement in team performance and customer experience.";
          achievements = [
            "Designed and launched a leadership development program that resulted in 78% of participants being promoted to senior roles within 18 months",
            "Redesigned customer service training, reducing new hire time-to-proficiency from 8 weeks to 4 weeks",
            "Mentored junior designers and established design standards that improved team output quality by 30%",
            "Used AI tools to prototype outlines and generate assets, reducing design cycle time by 25%"
          ];
        },
        {
          id = 2;
          company = "FinTech Solutions Inc.";
          title = "Instructional Designer";
          location = "New York, NY";
          startDate = "2020";
          endDate = ?"2023";
          description = "Led instructional design for compliance and operational training programs in a high-volume financial services environment.";
          achievements = [
            "Modernized compliance training program, increasing completion rates from 68% to 97%",
            "Built 15+ eLearning courses using Articulate Storyline with branching scenarios and gamification",
            "Created a just-in-time job aid library that reduced support ticket volume by 20%"
          ];
        },
        {
          id = 3;
          company = "Global Learning Partners";
          title = "Learning & Development Specialist";
          location = "Chicago, IL";
          startDate = "2018";
          endDate = ?"2020";
          description = "Designed and facilitated instructor-led training programs for corporate clients across industries including healthcare, technology, and retail.";
          achievements = [
            "Delivered 50+ ILT sessions with an average participant satisfaction score of 4.7/5",
            "Developed facilitator guides and participant workbooks for 12 core training programs",
            "Collaborated with subject matter experts to translate complex technical content into accessible learning experiences"
          ];
        }
      ];
      education = [
        {
          id = 1;
          institution = "University of Virginia";
          degree = "Master of Education";
          field = "Instructional Design & Adult Learning";
          startDate = "2016";
          endDate = ?"2018";
        },
        {
          id = 2;
          institution = "Virginia Commonwealth University";
          degree = "Bachelor of Arts";
          field = "Communication Studies";
          startDate = "2012";
          endDate = ?"2016";
        }
      ];
      skills = [
        { id = 1; name = "Articulate Storyline 360"; category = "eLearning Technology" },
        { id = 2; name = "Adobe Captivate"; category = "eLearning Technology" },
        { id = 3; name = "Camtasia"; category = "eLearning Technology" },
        { id = 4; name = "ILT Design & Facilitation"; category = "Instructional Design" },
        { id = 5; name = "Needs Analysis"; category = "Instructional Design" },
        { id = 6; name = "ADDIE / SAM"; category = "Instructional Design" },
        { id = 7; name = "Blended Learning"; category = "Instructional Design" },
        { id = 8; name = "Microlearning"; category = "Instructional Design" },
        { id = 9; name = "Adult Learning Theory"; category = "Instructional Design" },
        { id = 10; name = "Generative AI Tools"; category = "Emerging Technology" },
        { id = 11; name = "Learning Analytics"; category = "Emerging Technology" },
        { id = 12; name = "Project Management"; category = "Business Skills" },
        { id = 13; name = "Stakeholder Management"; category = "Business Skills" },
        { id = 14; name = "Data-Driven Design"; category = "Business Skills" },
        { id = 15; name = "Audio/Video Editing"; category = "Multimedia" }
      ];
      certifications = [
        {
          id = 1;
          name = "ATD Master Instructional Designer";
          issuer = "Association for Talent Development";
          dateEarned = "2022";
          url = null;
        },
        {
          id = 2;
          name = "Certified Professional in Talent Development (CPTD)";
          issuer = "Association for Talent Development";
          dateEarned = "2021";
          url = null;
        }
      ];
    }
  };
};
