import ResumeTypes "../types/resume";
import ResumeLib "../lib/resume";

mixin (resume : { var data : ?ResumeTypes.Resume }) {
  public query func getResume() : async ?ResumeTypes.Resume {
    ResumeLib.getResume(resume.data);
  };

  public func seedResume() : async () {
    resume.data := ?ResumeLib.seedResume();
  };
};
