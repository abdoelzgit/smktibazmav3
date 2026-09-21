import { Hero } from "@/components/hero";
import { Sambutan } from "./section/summary";

export default function SpmbPage() {
    return (
        <main className="flex min-h-full flex-col items-center">
            <Hero
                title="SPMB"
                backgroundImage="/images/ppdb.webp"
            />
            <Sambutan />

        </main>
    );
}
