"use client";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full bg-black/70 backdrop-blur-md z-50 border-b border-gray-800"
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4 text-white">
        <h1 className="font-bold text-lg">Sri Tipparaju</h1>

        <div className="flex gap-6 text-sm">
          <a href="#projects" className="hover:text-green-400">Projects</a>
          <a href="#skills" className="hover:text-green-400">Skills</a>
          <a href="#contact" className="hover:text-green-400">Contact</a>
        </div>
      </div>
    </motion.nav>
  );
}