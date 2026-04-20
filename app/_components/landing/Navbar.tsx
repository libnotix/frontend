import Link from "next/link";

const navLinks = [
    { href: "#megoldasok", label: "Megoldások" },
    { href: "#funkciok", label: "Funkciók" },
    { href: "#gyik", label: "GYIK" },
];

const LandingNavbar = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
            <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-white"
                    aria-label="TanárSegéd – Főoldal"
                >
                    <span
                        aria-hidden
                        className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-emerald-400 text-slate-950 font-bold"
                    >
                        T
                    </span>
                    <span className="text-lg font-semibold tracking-tight">
                        TanárSegéd
                    </span>
                </Link>

                <ul className="hidden items-center gap-8 md:flex">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className="text-sm font-medium text-white/80 transition hover:text-white"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-2">
                    <Link
                        href="/auth/login"
                        className="hidden sm:inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-white/90 transition hover:bg-white/10"
                    >
                        Bejelentkezés
                    </Link>
                    <Link
                        href="/auth/register"
                        className="inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white/90"
                    >
                        Próbálja ki ingyen
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default LandingNavbar;
