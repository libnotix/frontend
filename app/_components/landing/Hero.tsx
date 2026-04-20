import Image from "next/image";
import Link from "next/link";

const Hero = () => {
    return (
        <section
            className="relative isolate flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden"
            aria-labelledby="hero-title"
        >
            <Image
                src="/landing-hero.png"
                alt=""
                fill
                priority
                sizes="100vw"
                className="-z-10 object-cover object-center"
            />

            <div className="relative container mx-auto px-4 py-24 text-center md:px-6 md:py-32">
                <div className="mx-auto max-w-4xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md [text-shadow:_0_1px_6px_rgba(2,6,23,0.6)]">
                        <span className="size-1.5 rounded-full bg-emerald-300" />
                        Digitális asszisztens pedagógusoknak
                    </span>

                    <h1
                        id="hero-title"
                        className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-white [text-shadow:_0_2px_18px_rgba(2,6,23,0.55),_0_1px_2px_rgba(2,6,23,0.45)] sm:text-5xl md:text-6xl lg:text-7xl"
                    >
                        Több idő a diákokra,
                        <br />
                        több idő önmagára.
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white [text-shadow:_0_1px_10px_rgba(2,6,23,0.6),_0_1px_2px_rgba(2,6,23,0.5)] sm:text-lg md:text-xl">
                        Egy digitális segítőtárs, amely leveszi a válláról az
                        adminisztráció terhét. Gyorsítsa meg az órai
                        felkészülést és a dolgozatok értékelését egyetlen
                        felületen: intelligens megoldások, amelyek nem
                        helyettesítik, hanem támogatják a tanári munkát – hogy
                        az estéi végre újra a családjáról és a pihenésről
                        szóljanak.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/auth/register"
                            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-slate-900 shadow-lg shadow-slate-950/30 transition hover:bg-white/90 hover:shadow-xl"
                        >
                            Próbálja ki ingyen!
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
