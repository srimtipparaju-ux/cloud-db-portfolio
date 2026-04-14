import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Demo from "@/components/Demo";
import Architecture from "@/components/Architecture";

export default function Home() {
  return (
    <main className="bg-black text-white">
      <Navbar />
      <Hero />
      <About />
      <Architecture />
      <Projects />
      <Demo /> 
      <Skills />
      <Contact />
    </main>
  );
}