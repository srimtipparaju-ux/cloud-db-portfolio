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
  {
    name: "Azure AI Apps and Agents Developer Associate",
    image: "/MS_Azure_AI.png",
    link: "https://learn.microsoft.com/api/credentials/share/en-us/SriManaswiTipparaju-1662/BD82E3C8FDAEB371?sharingId=218D95A276223888",
    expires: "exp. Jun 2027",
    verifier: "Microsoft Learn",
  },
  {
    name: "NVIDIA Certified Professional: Agentic AI",
    image: "/nvidia-badge.png",
    link: "https://www.credly.com/badges/fa97c8da-cabe-4e8d-aee5-0e006ddaeb72/public_url",
    expires: "exp. Jun 2028",
  },
];

export default function Certifications() {
  return (
    <section className="px-6 py-10 max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-center gap-4">
        {certs.map((cert) => (
          <a
            key={cert.name}
            href={cert.link}
            target="_blank"
            rel="noopener noreferrer"
            className="panel panel-hover flex items-center justify-center gap-4 px-5 py-4 w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
          >
            <img src={cert.image} alt={cert.name} className="w-14 h-14 object-contain shrink-0" />
              <div className="text-center">
              <div className="text-sm text-[var(--ink)]">{cert.name}</div>
              <div className="font-mono text-[11px] text-[var(--ink-dim)] mt-1">
                Verified on {cert.verifier ?? "Credly"} · {cert.expires}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}