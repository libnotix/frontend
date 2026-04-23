import type { Metadata } from "next";
import LandingNavbar from "./_components/landing/Navbar";
import Hero from "./_components/landing/Hero";
import EmpatheticQuestions from "./_components/landing/EmpatheticQuestions";
import FeatureShowcase from "./_components/landing/FeatureShowcase";
import Faq from "./_components/landing/Faq";
import FooterCta from "./_components/landing/FooterCta";
import Footer from "./_components/landing/Footer";

export const metadata: Metadata = {
    title: "TanárSegéd – Több idő a diákokra, több idő önmagára",
    description:
        "Digitális segítőtárs pedagógusoknak, amely leveszi a válláról az adminisztráció terhét. Gyorsabb óra-felkészülés, félautomata dolgozatjavítás, intelligens segítség – a tanári munka támogatására.",
};

export default function LandingPage() {
    return (
        <main className="flex w-full min-w-0 flex-1 flex-col bg-white">
            <LandingNavbar />
            <Hero />
            <EmpatheticQuestions />
            <FeatureShowcase />
            <Faq />
            <FooterCta />
            <Footer />
        </main>
    );
}
