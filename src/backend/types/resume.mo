module {
  public type ExperienceEntry = {
    id : Nat;
    company : Text;
    title : Text;
    location : Text;
    startDate : Text;
    endDate : ?Text;
    description : Text;
    achievements : [Text];
  };

  public type EducationEntry = {
    id : Nat;
    institution : Text;
    degree : Text;
    field : Text;
    startDate : Text;
    endDate : ?Text;
  };

  public type Skill = {
    id : Nat;
    name : Text;
    category : Text;
  };

  public type Certification = {
    id : Nat;
    name : Text;
    issuer : Text;
    dateEarned : Text;
    url : ?Text;
  };

  public type Resume = {
    name : Text;
    title : Text;
    summary : Text;
    email : Text;
    phone : ?Text;
    location : Text;
    linkedIn : ?Text;
    website : ?Text;
    experience : [ExperienceEntry];
    education : [EducationEntry];
    skills : [Skill];
    certifications : [Certification];
  };
};
