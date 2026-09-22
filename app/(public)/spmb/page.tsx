import { Hero } from "@/components/hero";
import { Sambutan } from "./section/summary";
import CountdownSection from "./section/countdown";
import FaqSection from "./section/faq";
import TimelineSection from "./section/timeline";
import PreparationSection from "./section/preparation";

export default function SpmbPage() {
    return (
        <main className="flex min-h-full flex-col items-center">
            <Hero
                title="SPMB"
                backgroundImage="/images/ppdb.webp"
            />
            <Sambutan />


            <PreparationSection />
            <TimelineSection />
            <FaqSection
                title="Frequently Asked Questions (FAQ)"
                subtitle="Pertanyaan seputar proses penerimaan peserta didik"
            />

            <CountdownSection />
        </main>
    );
}

