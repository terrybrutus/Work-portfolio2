import List "mo:core/List";

module {
  type Project = {
    id : Nat;
    title : Text;
    description : Text;
    modality : { #ilt; #eLearning; #jobAid; #hybrid };
    challenge : Text;
    approach : Text;
    deliverables : [Text];
    results : Text;
    thumbnailUrl : ?Text;
    tags : [Text];
    createdAt : Nat;
  };

  type Resume = {
    name : Text;
    title : Text;
    summary : Text;
    email : Text;
    phone : ?Text;
    location : Text;
    linkedIn : ?Text;
    website : ?Text;
    experience : [{
      id : Nat;
      company : Text;
      title : Text;
      location : Text;
      startDate : Text;
      endDate : ?Text;
      description : Text;
      achievements : [Text];
    }];
    education : [{
      id : Nat;
      institution : Text;
      degree : Text;
      field : Text;
      startDate : Text;
      endDate : ?Text;
    }];
    skills : [{
      id : Nat;
      name : Text;
      category : Text;
    }];
    certifications : [{
      id : Nat;
      name : Text;
      issuer : Text;
      dateEarned : Text;
      url : ?Text;
    }];
  };

  type TailoredView = {
    slug : Text;
    label : Text;
    privateCompany : Text;
    privateJobDescription : Text;
    primaryLane : Text;
    lanes : [Text];
    projectIds : [Text];
    proofIds : [Text];
    skillIds : [Text];
    angle : Text;
    expiresAt : ?Text;
    createdAt : Nat;
    archived : Bool;
  };

  type OldActor = {
    projects : List.List<Project>;
    resume : { var data : ?Resume };
  };

  type NewActor = {
    projects : List.List<Project>;
    resume : { var data : ?Resume };
    tailoredViews : List.List<TailoredView>;
  };

  public func migration(old : OldActor) : NewActor {
    {
      projects = old.projects;
      resume = old.resume;
      tailoredViews = List.empty<TailoredView>();
    }
  };
};
