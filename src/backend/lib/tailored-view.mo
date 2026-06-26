import List "mo:core/List";
import TailoredViewTypes "../types/tailored-view";

module {
  public type TailoredViewInput = TailoredViewTypes.TailoredViewInput;
  public type TailoredView = TailoredViewTypes.TailoredView;

  public func listViews(views : List.List<TailoredView>) : [TailoredView] {
    views.toArray()
  };

  public func getView(
    views : List.List<TailoredView>,
    slug : Text,
  ) : ?TailoredView {
    views.find(func(view) { view.slug == slug and not view.archived })
  };

  public func saveView(
    views : List.List<TailoredView>,
    input : TailoredViewInput,
  ) : TailoredView {
    let view : TailoredView = {
      slug = input.slug;
      viewLabel = input.viewLabel;
      privateCompany = input.privateCompany;
      privateJobDescription = input.privateJobDescription;
      primaryLane = input.primaryLane;
      lanes = input.lanes;
      projectIds = input.projectIds;
      proofIds = input.proofIds;
      skillIds = input.skillIds;
      angle = input.angle;
      expiresAt = input.expiresAt;
      createdAt = 0;
      archived = false;
    };
    views.add(view);
    view
  };
};
