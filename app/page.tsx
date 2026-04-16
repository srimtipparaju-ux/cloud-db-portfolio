import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Demo from "@/components/Demo";
import Architecture from "@/components/Architecture";
import Certifications from "@/components/Certifications";

// ✅ NEW IMPORTS
import AIDashboard from "@/components/AIDashboard";
import VisitorCounter from "@/components/VisitorCounter";

export default function Home() {
  return (
    <main className="bg-black text-white">
      <Navbar />
      <Hero />
      <Certifications /> 
      <About />
      <Architecture />
      <Projects />
      <div className="grid md:grid-cols-2 gap-10 px-6 items-stretch">
  <AIDashboard />
  <Demo />
</div>
      <Skills />
      <Contact />
      <VisitorCounter />
    </main>
  );
}