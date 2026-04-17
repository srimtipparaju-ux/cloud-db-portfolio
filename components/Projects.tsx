"use client";
import { motion } from "framer-motion";

export default function Projects() {
  const projects = [
    {
      title: "OCI Cloud Database Platform",
      desc: "Designed and managed large-scale Oracle Autonomous Database and multitenant environments on OCI, supporting cloud management applications with high availability and scalability."
    },
    {
      title: "SQL Performance Optimization Framework",
      desc: "Led cross-team initiatives to analyze and tune complex SQL and PL/SQL workloads using AWR, ADDM, and SQL Monitor, improving query performance and reducing system latency."
    },
    {
      title: "Enterprise Database Migration",
      desc: "Executed cross-platform database migration for a Fortune 10 customer, moving Oracle Enterprise Manager infrastructure from Solaris to Linux using Data Pump and optimized strategies."
    },
    {
      title: "Automation & Deployment Pipelines",
      desc: "Built automated database provisioning and deployment pipelines in OCI using Python and shell scripting, reducing manual effort and accelerating environment setup across teams."
    }
  ];

  return (
    <section id="projects" className="p-10 max-w-6xl mx-auto">
      <h2 className="text-3xl mb-6">Key Engineering Work</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-800 p-6 rounded-xl bg-gray-900"
          >
            <h3 className="text-xl text-green-400">{project.title}</h3>
            <p className="text-gray-300 mt-2">{project.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}