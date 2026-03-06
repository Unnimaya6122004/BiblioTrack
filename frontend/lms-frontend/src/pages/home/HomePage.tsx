import Navbar from "./components/Navbar"
import HeroSection from "./components/HeroSection"
import StatsSection from "./components/StatsSection"
import QuotesSection from "./components/QuotesSection"
import FeaturedBooks from "./components/FeaturedBooks"
import CTASection from "./components/CTASection"
import Footer from "./components/Footer"
import ParticlesBackground from "../../components/ui/ParticlesBackground"
import ScrollToTopButton from "../../components/ui/Button/ScrollToTopButton"

export default function HomePage() {
  return (
      <div className="relative min-h-screen overflow-hidden">
      
      <ParticlesBackground />

      <Navbar />

      <HeroSection />

      <StatsSection />

      <QuotesSection />

      <FeaturedBooks />

      <CTASection />

      <Footer />

      <ScrollToTopButton />

    </div>
  )
}