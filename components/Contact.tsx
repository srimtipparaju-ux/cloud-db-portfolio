"use client";

export default function Contact() {
  return (
    <section className="p-10 text-center">
      <h2 className="text-3xl mb-6">Contact</h2>

      <div className="space-y-3 text-gray-400">

        {/* Email */}
        <p>
          📧 srim.tipparaju@gmail.com
        </p>

        {/* Phone */}
        <p>
          📞 (337) 853-2128
        </p>

        {/* Location */}
        <p>
          📍 Nashville, TN
        </p>

      </div>

      {/* 🔥 US CITIZEN LINE WITH EMOJI FIX */}
      <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mt-6">
        <span className="tracking-wide">
          US CITIZEN • NO SPONSORSHIP REQUIRED
        </span>
      </div>

      {/* Footer line */}
      <p className="mt-6 text-gray-500 text-sm">
        Open to full-time roles and cloud engineering opportunities.
      </p>
    </section>
  );
}