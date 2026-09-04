"use client"
import CurtainSlider from "@/components/curtain-slider/curtain-slider";
import HeroCarousel from "@/components/hero-carousel";
import Image from "next/image";
import { Navbar } from '@/components/navbar'
import Summary from "@/components/summary";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      {/* <MultiLevelDrawerMenu></MultiLevelDrawerMenu> */}
      {/* <Hero></Hero> */}
      <Navbar></Navbar>
      <HeroCarousel></HeroCarousel>
      <Summary></Summary>
      <Footer></Footer>
    </main>
  );
}
