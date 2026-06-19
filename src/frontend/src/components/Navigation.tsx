import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

const navLinks = [
  { label: "Resume", href: "#resume" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Contact", href: "#contact" },
];

export function Navigation() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const handleClick = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b shadow-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button
            type="button"
            className="text-lg font-display font-semibold text-foreground tracking-tight"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            data-ocid="nav.home_link"
          >
            Terry Brutus
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                onClick={() => handleClick(link.href)}
                data-ocid={`nav.link.${link.label.toLowerCase()}`}
              >
                {link.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              data-ocid="nav.theme_toggle"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </nav>

          {/* Mobile menu */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              data-ocid="nav.theme_toggle_mobile"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  data-ocid="nav.open_menu_button"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="mt-8 flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleClick(link.href)}
                      data-ocid={`nav.mobile_link.${link.label.toLowerCase()}`}
                    >
                      {link.label}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
