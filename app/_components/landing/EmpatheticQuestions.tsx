const ClockIcon = () => (
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
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
    </svg>
);

const PenIcon = () => (
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
        <path d="M4 20h4l10-10-4-4L4 16v4z" />
        <path d="M13.5 6.5l4 4" />
    </svg>
);

const HeartIcon = () => (
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
        <path d="M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5C19 15.5 12 20 12 20z" />
    </svg>
);

type QuestionCard = {
    quote: string;
    body: string;
    accent: "sky" | "emerald" | "amber";
    icon: React.ReactNode;
};

const cards: QuestionCard[] = [
    {
        quote: "„Már megint az estémbe nyúlik az órafelkészülés?”",
        body:
            "A vázlatírás nem kell, hogy órákig tartson. Eszközünkkel a strukturális feladatokat levesszük a válláról, így akár 3x gyorsabban összeállíthatja az óra menetét, anélkül, hogy a szakmai minőségből engedne.",
        accent: "sky",
        icon: <ClockIcon />,
    },
    {
        quote: "„Hogyan javítsak ki ennyi dolgozatot reggelig?”",
        body:
            "A kézírás digitalizálása és a félautomatizált javítássegéd nem váltja ki az Ön munkáját, de felgyorsítja a folyamatot. A rendszer segít kibogarászni a betűket és javaslatot tesz az értékelésre, hogy Önnek csak a finomhangolás maradjon.",
        accent: "emerald",
        icon: <PenIcon />,
    },
    {
        quote: "„Elvész a lényeg az adminisztrációban?”",
        body:
            "A papírmunka és az adatok tologatása helyett figyeljen újra a diákokra. Legyen szó online vagy kinyomtatott dolgozatról, a rendszer észrevétlenül rendszerezi az eredményeket, így Önnek több energiája marad a valódi tanításra.",
        accent: "amber",
        icon: <HeartIcon />,
    },
];

const accentStyles: Record<QuestionCard["accent"], string> = {
    sky: "from-sky-100 to-sky-50 text-sky-700 ring-sky-200",
    emerald: "from-emerald-100 to-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "from-amber-100 to-amber-50 text-amber-700 ring-amber-200",
};

const EmpatheticQuestions = () => {
    return (
        <section
            id="megoldasok"
            className="bg-white py-20 text-slate-900 md:py-28"
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Megértjük a kihívásait
                    </span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                        Ismerős pillanatok a hétköznapokból?
                    </h2>
                    <p className="mt-4 text-base text-slate-600 md:text-lg">
                        Nem egy újabb kötelező eszközt kínálunk. Azokat a
                        helyzeteket vesszük le a válláról, amelyek a
                        legtöbb idejét viszik el.
                    </p>
                </div>

                <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {cards.map((card, idx) => (
                        <article
                            key={idx}
                            className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div
                                className={`inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-inset ${accentStyles[card.accent]}`}
                            >
                                {card.icon}
                            </div>

                            <h3 className="mt-6 text-xl font-semibold leading-snug text-slate-900">
                                {card.quote}
                            </h3>
                            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                                {card.body}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default EmpatheticQuestions;
