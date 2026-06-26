import List "mo:core/List";
import MixinViews "mo:caffeineai-data-viewer/MixinViews";
import PortfolioTypes "types/portfolio";
import ResumeTypes "types/resume";
import TailoredViewTypes "types/tailored-view";
import PortfolioMixin "mixins/portfolio-api";
import ResumeMixin "mixins/resume-api";
import TailoredViewMixin "mixins/tailored-view-api";

actor {
  let projects : List.List<PortfolioTypes.Project>;
  let resume : { var data : ?ResumeTypes.Resume };
  let tailoredViews : List.List<TailoredViewTypes.TailoredView>;

  include MixinViews();
  include PortfolioMixin(projects);
  include ResumeMixin(resume);
  include TailoredViewMixin(tailoredViews);
};
