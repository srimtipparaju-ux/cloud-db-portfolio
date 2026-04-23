"use client";

const certs = [
  {
    name: "AWS Certified Solutions Architect Associate",
    image: "/aws-badge.png",
    link: "https://www.credly.com/badges/f2fffb3e-d8f5-4724-ad4e-03e6c8ef7b57/public_url",
  },
  {
    name: "Certfied Kubernetes Administrator",
    image: "/cka-badge.png",
    link: "https://www.credly.com/badges/fd5a5589-1f7d-4c64-9b28-56caf5ea7614/public_url",
  },
  // Add more here later
];

export default function Certifications() {
  return (
    <section className="py-16 px-6 text-center">
      <h2 className="text-3xl mb-10">Certifications</h2>

      <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">

  {certs.map((cert, index) => (
    <a
      key={index}
      href={cert.link}
      target="_blank"
      rel="noopener noreferrer"
      className="
        bg-gray-900
        p-6
        rounded-3xl
        border border-gray-700
        hover:border-green-500
        hover:shadow-[0_0_25px_rgba(34,197,94,0.35)]
        hover:scale-105
        transition-all duration-300
        w-64
      "
    >
      <img
        src={cert.image}
        alt={cert.name}
        className="w-28 mx-auto mb-4"
      />

      <p className="text-gray-300 text-sm text-center">
        {cert.name}
      </p>
    </a>
  ))}

</div>
    </section>
  );
}