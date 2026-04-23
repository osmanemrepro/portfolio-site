import CustomCursor from "@/components/portfolio/CustomCursor";
import ScrollProgress from "@/components/portfolio/ScrollProgress";
import Navigation from "@/components/portfolio/Navigation";
import HeroSection from "@/components/portfolio/HeroSection";
import AboutSection from "@/components/portfolio/AboutSection";
import SkillsSection from "@/components/portfolio/SkillsSection";
import ProjectsSection from "@/components/portfolio/ProjectsSection";
import ExperienceSection from "@/components/portfolio/ExperienceSection";
import ContactSection from "@/components/portfolio/ContactSection";
import Footer from "@/components/portfolio/Footer";
import ActivityWidget from "@/components/portfolio/ActivityWidget";
import ParticleField from "@/components/portfolio/ParticleField";
import CursorTrail from "@/components/portfolio/CursorTrail";
import ThemeSwitcher from "@/components/portfolio/ThemeSwitcher";
import ScrollToTop from "@/components/portfolio/ScrollToTop";
import CommandPalette from "@/components/portfolio/CommandPalette";
import Globe3D from "@/components/portfolio/Globe3D";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <ParticleField />
      <CursorTrail />
      <CustomCursor />
      <ScrollProgress />
      <ThemeSwitcher />
      <CommandPalette />
      <Navigation />
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ExperienceSection />
      <ContactSection />
      <Footer />
      <ActivityWidget />
      <ScrollToTop />
      <Globe3D />
    </main>
  );
}
