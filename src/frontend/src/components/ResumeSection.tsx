import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useResume } from "@/hooks/useQueries";
import { Award, Briefcase, GraduationCap, Wrench } from "lucide-react";

export function ResumeSection() {
  const { data: resume, isLoading, error } = useResume();

  if (isLoading) {
    return (
      <section className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </section>
    );
  }

  if (error || !resume) {
    return (
      <section className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
        <p className="text-destructive font-medium">
          Unable to load resume data.
        </p>
      </section>
    );
  }

  return (
    <section id="resume" className="space-y-10" data-ocid="resume.section">
      {/* Experience */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Experience
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {resume.experience.map((exp, index) => (
            <Card
              key={`${exp.title}-${exp.company}`}
              className="bg-card border-border shadow-subtle"
              data-ocid={`resume.experience.item.${index + 1}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-foreground">
                  {exp.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {exp.company} · {exp.startDate}
                  {exp.endDate ? ` – ${exp.endDate}` : ""}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
                  {exp.achievements.map((h, i) => (
                    <li key={`${exp.title}-ach-${i}`}>{h}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Education
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {resume.education.map((edu, index) => (
            <Card
              key={`${edu.degree}-${edu.institution}`}
              className="bg-card border-border shadow-subtle"
              data-ocid={`resume.education.item.${index + 1}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-foreground">
                  {edu.degree}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {edu.institution} · {edu.startDate}
                  {edu.endDate ? ` – ${edu.endDate}` : ""}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/90">{edu.field}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Skills
          </h2>
        </div>
        <Card className="bg-card border-border shadow-subtle">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill, index) => (
                <Badge
                  key={skill.name}
                  variant="secondary"
                  className="text-sm"
                  data-ocid={`resume.skill.${index + 1}`}
                >
                  {skill.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Certifications
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {resume.certifications.map((cert, index) => (
            <Card
              key={`${cert.name}-${cert.issuer}`}
              className="bg-card border-border shadow-subtle"
              data-ocid={`resume.certification.item.${index + 1}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-foreground">
                  {cert.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {cert.issuer} · {cert.dateEarned}
                </p>
              </CardHeader>
              <CardContent>
                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                    data-ocid={`resume.certification.link.${index + 1}`}
                  >
                    View credential
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
