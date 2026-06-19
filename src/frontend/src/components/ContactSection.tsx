import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Mail } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contact" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Card className="border-border bg-card shadow-subtle">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-3xl font-bold tracking-tight text-foreground">
              Let&apos;s Build Something Great Together
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground">
              I partner with operations leaders and senior stakeholders to
              design learning experiences that drive measurable team
              performance. If you are looking for a consultative, business-first
              learning designer, I would love to hear from you.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                variant="default"
                size="lg"
                className="gap-2"
                data-ocid="contact.email_button"
              >
                <a href="mailto:hello@example.com">
                  <Mail className="h-4 w-4" />
                  Get in Touch
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2"
                data-ocid="contact.portfolio_link"
              >
                <a href="#portfolio">
                  View Portfolio
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Prefer a quick call? Drop me a line and we will find a time that
              works.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
