module {
  public type Modality = {
    #ilt;
    #eLearning;
    #jobAid;
    #hybrid;
  };

  public type Project = {
    id : Nat;
    title : Text;
    description : Text;
    modality : Modality;
    challenge : Text;
    approach : Text;
    deliverables : [Text];
    results : Text;
    thumbnailUrl : ?Text;
    tags : [Text];
    createdAt : Nat;
  };
};
