import List "mo:core/List";
import PortfolioTypes "../types/portfolio";
import PortfolioLib "../lib/portfolio";

mixin (projects : List.List<PortfolioTypes.Project>) {
  public query func listProjects() : async [PortfolioTypes.Project] {
    PortfolioLib.listProjects(projects);
  };

  public query func getProject(id : Nat) : async ?PortfolioTypes.Project {
    PortfolioLib.getProject(projects, id);
  };

  public func addProject(project : PortfolioTypes.Project) : async () {
    PortfolioLib.addProject(projects, project);
  };

  public func seedPortfolio() : async () {
    let seeded = PortfolioLib.seedProjects();
    for (project in seeded.values()) {
      PortfolioLib.addProject(projects, project);
    };
  };
};
