import List "mo:core/List";
import MixinViews "mo:caffeineai-data-viewer/MixinViews";
import PortfolioTypes "types/portfolio";
import ResumeTypes "types/resume";
import PortfolioMixin "mixins/portfolio-api";
import ResumeMixin "mixins/resume-api";

actor {
  let projects : List.List<PortfolioTypes.Project>;
  let resume : { var data : ?ResumeTypes.Resume };

  include MixinViews();
  include PortfolioMixin(projects);
  include ResumeMixin(resume);
};
