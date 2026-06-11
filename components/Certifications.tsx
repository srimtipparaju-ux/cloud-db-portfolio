"use client";

const certs = [
  {
    name: "AWS Certified Solutions Architect — Associate",
    image: "/aws-badge.png",
    link: "https://www.credly.com/badges/f2fffb3e-d8f5-4724-ad4e-03e6c8ef7b57/public_url",
    expires: "exp. Apr 2029",
  },
  {
    name: "Certified Kubernetes Administrator",
    image: "/cka-badge.png",
    link: "https://www.credly.com/badges/fd5a5589-1f7d-4c64-9b28-56caf5ea7614/public_url",
    expires: "exp. Apr 2028",
  },
];

export default function Certifications() {
  return (
    <section className="px-6 py-10 max-w-6xl mx-auto">
      <div className="flex flex-wrap gap-4">
        {certs.map((cert) => (
          <a
            key={cert.name}
            href={cert.link}
            target="_blank"
            rel="noopener noreferrer"
            className="panel panel-hover flex items-center gap-4 px-5 py-4 flex-1 min-w-[280px]"
          >
            <img src={cert.image} alt={cert.name} className="w-14 h-14 object-contain" />
            <div>
              <div className="text-sm text-[var(--ink)]">{cert.name}</div>
              <div className="font-mono text-[11px] text-[var(--ink-dim)] mt-1">
                Verified on Credly · {cert.expires}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
