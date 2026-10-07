import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import ForInstitutions from "@/components/landing/ForInstitutions";
import HowItWorks from "@/components/landing/HowItWorks";
import Demo from "@/components/landing/Demo";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import NeuralCanvas from "@/components/landing/NeuralCanvas";

export default function LandingPage() {
  return (
    <main className="relative bg-slate-50 dark:bg-black text-slate-900 dark:text-white min-h-screen overflow-x-hidden selection:bg-mint/30 selection:text-white transition-colors duration-300">
      <NeuralCanvas />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Features />
        <ForInstitutions />
        <HowItWorks />
        <Demo />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
