import { Hero } from "@/components/hero";
import { Sambutan } from "./section/summary";
import CountdownSection from "./section/countdown";
import FaqSection from "./section/faq";
import TimelineSection from "./section/timeline";

export default function SpmbPage() {
    return (
        <main className="flex min-h-full flex-col items-center">
            <Hero
                title="SPMB"
                backgroundImage="/images/ppdb.webp"
            />
            <Sambutan />
            
            <FaqSection
                title="Persyaratan Pendaftar"
                subtitle="Pertanyaan yang sering diajukan"
            />
            <TimelineSection />
            <CountdownSection />
        </main>
    );
}

