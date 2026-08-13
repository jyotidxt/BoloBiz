import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import FeatureGrid from "@/components/landing/FeatureGrid";
import LanguageDemo from "@/components/landing/LanguageDemo";
import ConversationDemo from "@/components/landing/ConversationDemo";
import DashboardPreview from "@/components/landing/DashboardPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import Vision from "@/components/landing/Vision";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div style={styles.appContainer}>
      {/* Floating Navbar */}
      <Navbar />

      {/* Hero Intro */}
      <Hero />

      {/* Feature Catalog Grid */}
      <FeatureGrid />

      {/* Dialect NLU Translation Demo */}
      <LanguageDemo />

      {/* Interactive Sandbox Chat Terminal */}
      <ConversationDemo />

      {/* Dashboard Graphic Mockup */}
      <DashboardPreview />

      {/* Stepper Steps */}
      <HowItWorks />

      {/* Core brand vision statement */}
      <Vision />

      {/* Call to action */}
      <CTA />

      {/* Professional Footer */}
      <Footer />
    </div>
  );
}

const styles = {
  appContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
    overflowX: "hidden" as const,
  },
};
