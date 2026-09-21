import { ArrowUpRight } from "lucide-react";
import { PortalLink } from "@/components/portal-transition";

interface EkstraItem {
  title: string;
  slug: string;
  image: string;
}

const ekstraData: EkstraItem[] = [
  {
    title: "Futsal",
    slug: "futsal",
    image: "/images/ekstra/futsal.jpg",
  },
  {
    title: "MCRobo",
    slug: "mcrobo",
    image: "/images/ekstra/mcrobo.jpg",
  },
  {
    title: "Pramuka",
    slug: "pramuka",
    image: "/images/ekstra/pramuka.jpg",
  },
  {
    title: "Pramuka",
    slug: "pramuka-2",
    image: "/images/ekstra/pramuka.jpg",
  },
  {
    title: "Pramuka",
    slug: "pramuka-3",
    image: "/images/ekstra/pramuka.jpg",
  },
  {
    title: "Pramuka",
    slug: "pramuka-4",
    image: "/images/ekstra/pramuka.jpg",
  },
];

export function EkstraGrid() {
  return (
    <section className="w-full max-w-[1111px] mx-auto pt-8 sm:pt-12 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ekstraData.map((item) => (
          <PortalLink
            key={item.slug}
            href={`/ekstrakulikuler/${item.slug}`}
            label={item.title}
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] block cursor-pointer"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url('${item.image}')` }}
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-between h-full p-6">
              <h3 className="text-white text-xl sm:text-2xl font-bold">
                {item.title}
              </h3>
              <div className="flex justify-end">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white group-hover:text-blue-900 text-white transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </PortalLink>
        ))}
      </div>
    </section>
  );
}