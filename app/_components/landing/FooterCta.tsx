import Link from "next/link";

const FooterCta = () => {
    return (
        <section
            className="relative overflow-hidden bg-gradient-to-br from-sky-900 via-slate-900 to-emerald-900 py-20 text-white md:py-28"
            aria-labelledby="footer-cta-title"
        >
            <div
                aria-hidden
                className="absolute -left-32 top-1/2 size-[32rem] -translate-y-1/2 rounded-full bg-sky-500/20 blur-3xl"
            />
            <div
                aria-hidden
                className="absolute -right-32 top-0 size-[28rem] rounded-full bg-emerald-500/20 blur-3xl"
            />

            <div className="container relative mx-auto px-4 md:px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                        <span className="size-1.5 rounded-full bg-emerald-300" />
                        Kezdje el ma, tíz perc alatt
                    </span>
                    <h2
                        id="footer-cta-title"
                        className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
                    >
                        Vegye vissza az irányítást{" "}
                        <span className="bg-gradient-to-r from-sky-200 to-emerald-200 bg-clip-text text-transparent">
                            az ideje felett!
                        </span>
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
                        Csatlakozzon azokhoz a pedagógusokhoz, akik estéiket
                        már nem a dolgozatok javításával, hanem a
                        családjukkal töltik.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/auth/register"
                            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-slate-900 shadow-lg shadow-black/30 transition hover:bg-white/90"
                        >
                            Regisztráció tanárként
                        </Link>
                        <Link
                            href="/auth/login"
                            className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
                        >
                            Már regisztráltam
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FooterCta;
