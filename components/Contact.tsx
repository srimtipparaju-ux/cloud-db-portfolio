"use client";

import { FaLinkedin } from "react-icons/fa";

export default function Contact() {
  return (
    <section className="p-10 text-center">
      <h2 className="text-3xl mb-6">Contact</h2>

      <div className="space-y-3 text-gray-400">

        {/* Email */}
        <p className="flex items-center justify-center gap-2">
          <span>📧</span>
          <span>srim.tipparaju@gmail.com</span>
        </p>

        {/* Phone */}
        <p className="flex items-center justify-center gap-2">
          <span>📞</span>
          <span>(337) 853-2128</span>
        </p>

        {/* LinkedIn */}
        <p className="flex items-center justify-center gap-2">
          <FaLinkedin className="text-[#0A66C2]" />
          <a
            href="https://www.linkedin.com/in/sritipparaju"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            LinkedIn
          </a>
        </p>

        {/* Location */}
        <p className="flex items-center justify-center gap-2">
          <span>📍</span>
          <span>Nashville, TN</span>
        </p>

      </div>

      {/* US Citizen */}
      <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mt-6">
        <span className="tracking-wide">
          US CITIZEN • NO SPONSORSHIP REQUIRED
        </span>
      </div>

      {/* Footer */}
      <p className="mt-6 text-gray-500 text-sm">
        Open to full-time roles and cloud engineering opportunities.
      </p>
    </section>
  );
}