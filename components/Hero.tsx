"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="h-screen flex flex-col justify-center items-center text-center px-6 bg-gradient-to-b from-black to-gray-900">

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold mb-4"
      >
        Sri Manaswi Tipparaju
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl text-green-400 mb-6"
      >
        Cloud Database Engineer
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-2xl text-gray-300 mb-6"
      >
        Designing scalable cloud-native Oracle database systems using OCI,
        Autonomous DB, and high-performance architectures.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex gap-4"
      >
        <a href="#projects" className="bg-green-500 px-6 py-2 rounded hover:scale-105 transition">
          View Projects
        </a>

        <a
          href="/Sri_Tipparaju_Cloud_DB_resume.pdf"
          download
          className="border px-6 py-2 rounded hover:bg-white hover:text-black transition"
        >
          Resume(PDF)
        </a>
      </motion.div>
    </section>
  );
}