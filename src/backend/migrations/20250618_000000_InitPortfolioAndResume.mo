import List "mo:core/List";

module {
  type OldActor = {};

  type NewActor = {
    projects : List.List<{
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
    }>;
    resume : { var data : ?{
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
    } };
  };

  public func migration(_old : OldActor) : NewActor {
    {
      projects = List.empty<{
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
      }>();
      resume = { var data = null };
    };
  };
};
