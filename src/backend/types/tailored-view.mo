module {
  public type TailoredViewInput = {
    slug : Text;
    viewLabel : Text;
    privateCompany : Text;
    privateJobDescription : Text;
    primaryLane : Text;
    lanes : [Text];
    projectIds : [Text];
    proofIds : [Text];
    skillIds : [Text];
    angle : Text;
    expiresAt : ?Text;
  };

  public type TailoredView = {
    slug : Text;
    viewLabel : Text;
    privateCompany : Text;
    privateJobDescription : Text;
    primaryLane : Text;
    lanes : [Text];
    projectIds : [Text];
    proofIds : [Text];
    skillIds : [Text];
    angle : Text;
    expiresAt : ?Text;
    createdAt : Int;
    archived : Bool;
  };
};
