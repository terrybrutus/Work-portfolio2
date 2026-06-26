module {
  public type TailoredViewInput = {
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
  };

  public type TailoredView = {
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
};
