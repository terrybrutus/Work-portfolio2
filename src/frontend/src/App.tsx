import {
  useListProjects,
  useResume,
  useSeedPortfolio,
  useSeedResume,
} from "@/hooks/useQueries";
import { useEffect } from "react";
import { ContactSection } from "./components/ContactSection";
import { HeroSection } from "./components/HeroSection";
import { Layout } from "./components/Layout";
import { PortfolioSection } from "./components/PortfolioSection";
import { ResumeSection } from "./components/ResumeSection";

export default function App() {
  const resumeQuery = useResume();
  const portfolioQuery = useListProjects();
  const { mutate: seedResume } = useSeedResume();
  const { mutate: seedPortfolio } = useSeedPortfolio();

  useEffect(() => {
    if (
      resumeQuery.data === undefined ||
      (Array.isArray(resumeQuery.data) && resumeQuery.data.length === 0)
    ) {
      seedResume();
    }
    if (
      portfolioQuery.data === undefined ||
      (Array.isArray(portfolioQuery.data) && portfolioQuery.data.length === 0)
    ) {
      seedPortfolio();
    }
  }, [resumeQuery.data, portfolioQuery.data, seedResume, seedPortfolio]);

  return (
    <Layout>
      <HeroSection />
      <ResumeSection />
      <PortfolioSection />
      <ContactSection />
    </Layout>
  );
}
