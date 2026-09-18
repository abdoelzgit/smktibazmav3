import Image from "next/image";

const partners = [
  {
    name: "Pertalife Insurance",
    logo: "/images/partners/pertalife.png",
  },
  {
    name: "Pertamina Retail",
    logo: "/images/partners/pertamina-retail.png",
  },
  {
    name: "PTC (Pertamina Training & Consulting)",
    logo: "/images/partners/ptc.png",
  },
  {
    name: "Pertamina Geothermal Energy",
    logo: "/images/partners/pertamina-geothermal.png",
  },
  {
    name: "Shared Services",
    logo: "/images/partners/shared-services.png",
  },
  {
    name: "Pertamina Gas Negara",
    logo: "/images/partners/pertamina-gas.png",
  },
];

export function PartnersGrid() {
  return (
    <section className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="relative bg-gray-50 rounded-2xl p-8 h-40 flex items-center justify-center hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={partner.logo}
                alt={partner.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}