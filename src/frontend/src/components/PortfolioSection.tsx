import type { Project } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useListProjects } from "@/hooks/useQueries";
import { FolderOpen } from "lucide-react";
import { useState } from "react";

const MODALITIES = ["All", "ILT", "eLearning", "Job Aids", "Hybrid"] as const;
type Modality = (typeof MODALITIES)[number];

export function PortfolioSection() {
  const { data: projects, isLoading, error } = useListProjects();
  const [filter, setFilter] = useState<Modality>("All");
  const [_selectedProject, _setSelectedProject] = useState<Project | null>(
    null,
  );

  const filtered =
    filter === "All"
      ? projects
      : projects?.filter(
          (p) => p.modality.toLowerCase() === filter.toLowerCase(),
        );

  if (isLoading) {
    return (
      <section className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders are static
            <Skeleton key={`skeleton-${i}`} className="h-64 w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
        <p className="text-destructive font-medium">
          Unable to load portfolio projects.
        </p>
      </section>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <section
        className="rounded-lg border border-border bg-muted/30 p-12 text-center"
        data-ocid="portfolio.empty_state"
      >
        <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-medium">
          No portfolio projects yet.
        </p>
      </section>
    );
  }

  return (
    <section id="portfolio" className="space-y-8" data-ocid="portfolio.section">
      <div className="flex flex-wrap items-center gap-3">
        {MODALITIES.map((mod) => (
          <Button
            key={mod}
            variant={filter === mod ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(mod)}
            data-ocid={`portfolio.filter.${mod.toLowerCase()}_button`}
          >
            {mod}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered?.map((project, index) => (
          <Dialog key={project.title}>
            <DialogTrigger asChild>
              <Card
                className="bg-card border-border shadow-subtle transition-smooth hover:shadow-md hover:-translate-y-1 cursor-pointer"
                data-ocid={`portfolio.item.${index + 1}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {project.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Badge variant="outline" className="text-xs">
                      {project.modality}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {project.description}
                  </p>
                  {project.results && (
                    <div className="mt-4 rounded-md bg-muted/50 p-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Result
                      </p>
                      <p className="text-sm text-foreground mt-1">
                        {project.results}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {project.title}
                </DialogTitle>
                <DialogDescription>
                  <Badge variant="outline" className="text-xs mt-1">
                    {project.modality}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 pt-2">
                <div>
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-1">
                    Challenge
                  </h4>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {project.challenge}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-1">
                    Approach
                  </h4>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {project.approach}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-1">
                    Deliverables
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
                    {project.deliverables.map((d, i) => (
                      <li key={`${project.title}-del-${i}`}>{d}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md bg-muted/50 p-4">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Results
                  </h4>
                  <p className="text-sm text-foreground">{project.results}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {filtered && filtered.length === 0 && (
        <div
          className="rounded-lg border border-border bg-muted/30 p-8 text-center"
          data-ocid="portfolio.filter.empty_state"
        >
          <p className="text-muted-foreground font-medium">
            No projects match the selected filter.
          </p>
        </div>
      )}
    </section>
  );
}
