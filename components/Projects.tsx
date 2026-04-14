"use client";
import { motion } from "framer-motion";

export default function Projects() {
  return (
    <section id="projects" className="p-10 max-w-6xl mx-auto">
      <h2 className="text-3xl mb-6">Key Engineering Work</h2>

      <div className="grid md:grid-cols-2 gap-6">

        {[
          "OCI Cloud Database Platform",
          "SQL Performance Optimization Framework",
          "Enterprise Database Migration",
          "Automation & Deployment Pipelines"
        ].map((title, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-800 p-6 rounded-xl bg-gray-900"
          >
            <h3 className="text-xl text-green-400">{title}</h3>
            <p className="text-gray-300 mt-2">
              Built scalable enterprise database solutions with strong focus on
              performance, automation, and cloud-native architecture.
            </p>
          </motion.div>
        ))}

      </div>
    </section>
  );
}