import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export function HeroSection() {
  const scrollToPortfolio = () => {
    const el = document.getElementById("portfolio");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-[90vh] flex-col items-center justify-center bg-background px-4 text-center"
    >
      <div className="max-w-3xl space-y-6">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Terry Brutus
        </h1>
        <p className="font-display text-xl font-medium text-primary sm:text-2xl">
          Senior Learning Experience Designer
        </p>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Instructional design expert with 5+ years of corporate experience
          crafting learning solutions that drive measurable business results. I
          specialize in needs analysis, multi-modal content design, and
          facilitating high-impact training for adult learners in fast-moving
          operational environments.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
          <Button
            variant="default"
            size="lg"
            onClick={scrollToPortfolio}
            data-ocid="hero.view_portfolio_button"
          >
            View My Work
            <ArrowDown className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            data-ocid="hero.download_resume_button"
          >
            <a href="#resume">View Resume</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
