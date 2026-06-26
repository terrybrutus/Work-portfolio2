import List "mo:core/List";
import TailoredViewTypes "../types/tailored-view";
import TailoredViewLib "../lib/tailored-view";

mixin (tailoredViews : List.List<TailoredViewTypes.TailoredView>) {
  public query func listTailoredViews() : async [TailoredViewTypes.TailoredView] {
    TailoredViewLib.listViews(tailoredViews)
  };

  public query func getTailoredView(
    slug : Text
  ) : async ?TailoredViewTypes.TailoredView {
    TailoredViewLib.getView(tailoredViews, slug)
  };

  public func saveTailoredView(
    input : TailoredViewTypes.TailoredViewInput
  ) : async TailoredViewTypes.TailoredView {
    TailoredViewLib.saveView(tailoredViews, input)
  };
};
