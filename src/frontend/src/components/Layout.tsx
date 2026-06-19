import { Navigation } from "./Navigation";

export function Layout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1">{children}</main>
      <footer className="bg-muted/40 border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {year}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="underline underline-offset-2 hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="footer.caffeine_link"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
