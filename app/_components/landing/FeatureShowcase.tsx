const SparkleIcon = () => (
    <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
        <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z" />
    </svg>
);

const PaperIcon = () => (
    <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M7 3h8l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h6" />
    </svg>
);

const ChartIcon = () => (
    <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M4 20h16" />
        <path d="M7 16v-5M12 16V8M17 16v-3" />
    </svg>
);

const ShieldIcon = () => (
    <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

const HandIcon = () => (
    <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M7 11V6a2 2 0 0 1 4 0v5" />
        <path d="M11 11V4a2 2 0 0 1 4 0v7" />
        <path d="M15 11V6a2 2 0 0 1 4 0v8a7 7 0 0 1-7 7h-1a6 6 0 0 1-6-6v-4a2 2 0 0 1 4 0" />
    </svg>
);

type Feature = {
    title: string;
    description: string;
    icon: React.ReactNode;
    soon?: boolean;
};

const features: Feature[] = [
    {
        title: "Választható AI támogatás",
        description:
            "Nem kötelező használni, de bármikor segítségül hívhatja. Az AI segít a pontszámítási feltételek alapján előkészíteni a javítást, de soha nem hoz döntést Ön helyett. Ha a rendszer bizonytalan egy válasznál, azonnal jelzi, és megkérdezi az Ön véleményét.",
        icon: <SparkleIcon />,
    },
    {
        title: "Hibrid szabadság",
        description:
            "Szereti a papír illatát? Mi is. Generáljon nyomtatható dolgozatokat, írassa meg őket offline, majd a rendszer segítségével pillanatok alatt vigye be az eredményeket a digitális térbe.",
        icon: <PaperIcon />,
    },
    {
        title: "Személyre szabott figyelem",
        description:
            "Minden diák más tempóban halad. Hamarosan érkező statisztikai modulunk segít, hogy ne Önnek kelljen Excel-táblák felett görnyednie: a rendszer automatikusan javasol gyakorló feladatokat a lemaradóknak vagy az extra motivációt igénylőknek.",
        icon: <ChartIcon />,
        soon: true,
    },
];

const Promise = ({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
}) => (
    <div className="flex gap-4">
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
            {icon}
        </div>
        <div>
            <h4 className="font-semibold text-slate-900">{title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {description}
            </p>
        </div>
    </div>
);

const FeatureShowcase = () => {
    return (
        <section
            id="funkciok"
            className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-20 text-slate-900 md:py-28"
        >
            <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
            />

            <div className="container mx-auto px-4 md:px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                        A tanár-fókuszú megközelítés
                    </span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                        Egy digitális asszisztens,{" "}
                        <span className="text-sky-700">aki Önt szolgálja</span>
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-lg italic leading-relaxed text-slate-600">
                        „Nem egy újabb kötelező szoftvert alkottunk, hanem egy
                        segítő kezet, ami ott és akkor támogatja, amikor a
                        legnagyobb a nyomás.”
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {features.map((feature, idx) => (
                        <article
                            key={idx}
                            className="relative flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
                        >
                            {feature.soon && (
                                <span className="absolute right-6 top-6 inline-flex items-center rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                                    Hamarosan
                                </span>
                            )}
                            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/10 to-emerald-500/10 text-sky-700 ring-1 ring-inset ring-sky-200">
                                {feature.icon}
                            </div>

                            <h3 className="mt-6 text-xl font-semibold text-slate-900">
                                {feature.title}
                            </h3>
                            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                                {feature.description}
                            </p>
                        </article>
                    ))}
                </div>

                <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-2">
                    <Promise
                        title="Pszichológiai biztonság"
                        description="Az AI nem írja felül a tanárt. A hivatalos jegyet minden esetben Ön hagyja jóvá – a szakmai kontroll végig megmarad."
                        icon={<ShieldIcon />}
                    />
                    <Promise
                        title="Megértő hangvétel"
                        description="Nem azt mondjuk: „Vegyen meg minket.” Azt mondjuk: „Tudjuk, hogy nehéz. Itt egy eszköz, amivel könnyebb lehet.”"
                        icon={<HandIcon />}
                    />
                </div>
            </div>
        </section>
    );
};

export default FeatureShowcase;
