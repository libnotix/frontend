const faqs = [
    {
        question: "Kötelező az AI-t használnom?",
        answer:
            "Dehogy! Az AI nálunk egy opcionális segédasszisztens. Ha Ön a manuális javítást preferálja, a rendszer minden egyéb kényelmi funkciója (tárolás, szerkesztés) továbbra is rendelkezésére áll.",
    },
    {
        question: "Hogyan kezeli a rendszer a kézírást?",
        answer:
            "Fejlett képfelismerő algoritmusunk segít „kibogarászni” a nehezebben olvasható szövegeket is, így digitalizálva azokat a későbbi elemzéshez.",
    },
    {
        question: "Jogi szempontból elfogadható az automatizált javítás?",
        answer:
            "Igen, mivel a szoftver csak javaslatot tesz. A hivatalos jegyet minden esetben a pedagógus hagyja jóvá, így a szakmai kontroll megmarad.",
    },
];

const Faq = () => {
    return (
        <section id="gyik" className="bg-white py-20 text-slate-900 md:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Bizalomépítés
                    </span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                        Gyakori kérdések
                    </h2>
                    <p className="mt-4 text-base text-slate-600 md:text-lg">
                        Tisztán és őszintén – hogy biztos lehessen benne,
                        milyen döntést hoz.
                    </p>
                </div>

                <div className="mx-auto mt-12 max-w-3xl divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    {faqs.map((faq, idx) => (
                        <details
                            key={idx}
                            className="group px-6 py-5 open:bg-slate-50/60 [&_summary::-webkit-details-marker]:hidden"
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-1 text-left">
                                <span className="text-base font-semibold text-slate-900 sm:text-lg">
                                    {faq.question}
                                </span>
                                <span
                                    aria-hidden
                                    className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition group-open:rotate-45 group-open:border-emerald-200 group-open:bg-emerald-50 group-open:text-emerald-700"
                                >
                                    <svg
                                        viewBox="0 0 20 20"
                                        className="size-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    >
                                        <path d="M10 4v12M4 10h12" />
                                    </svg>
                                </span>
                            </summary>
                            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Faq;
