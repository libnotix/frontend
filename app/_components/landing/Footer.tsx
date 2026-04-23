import Link from "next/link";

const Footer = () => {
    return (
        <footer className="border-t border-slate-200 bg-slate-50 py-12 text-slate-600">
            <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6">
                <div className="flex items-center gap-2 text-slate-900">
                    <span
                        aria-hidden
                        className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white font-bold"
                    >
                        T
                    </span>
                    <span className="text-lg font-semibold tracking-tight">
                        TanárSegéd
                    </span>
                </div>

                <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                    <Link
                        href="#megoldasok"
                        className="transition hover:text-slate-900"
                    >
                        Megoldások
                    </Link>
                    <Link
                        href="#funkciok"
                        className="transition hover:text-slate-900"
                    >
                        Funkciók
                    </Link>
                    <Link href="#gyik" className="transition hover:text-slate-900">
                        GYIK
                    </Link>
                    <Link
                        href="/auth/login"
                        className="transition hover:text-slate-900"
                    >
                        Bejelentkezés
                    </Link>
                </nav>

                <p className="text-xs text-slate-500">
                    © {new Date().getFullYear()} TanárSegéd. Minden jog
                    fenntartva.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
