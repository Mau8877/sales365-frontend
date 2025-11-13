import Header from "./components/SaaS/layouts/Header";
import Footer from "./components/SaaS/layouts/Footer";
import HeroSection from "./components/SaaS/sections/HeroSection";
import FeaturesSection from "./components/SaaS/sections/FeaturesSection";
import MoreFeaturesSection from "./components/SaaS/sections/MoreFeaturesSection";
import PricingSection from "./components/SaaS/sections/PricingSection";
import AboutSection from "./components/SaaS/sections/AboutSection";

const SaaSHomePage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <MoreFeaturesSection />
        <PricingSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default SaaSHomePage;
