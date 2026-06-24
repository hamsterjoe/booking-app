import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

type LoginCardProps = {
    error?: string;
    message?: string;
    errorRedirectTo?: string;
    registerHref?: string;
};

export function LoginCard({
    error,
    message,
    errorRedirectTo = "/login",
    registerHref = "/register",
}: LoginCardProps) {
    return (
        <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/85 shadow-2xl shadow-black/50 backdrop-blur-2xl">
            <div className="px-6 py-6 sm:px-8 sm:py-7">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-300 shadow-[0_0_35px_rgba(125,211,252,0.4)]">
                    <div className="h-9 w-9 rounded-full border-[5px] border-sky-500 bg-sky-200 shadow-inner" />
                </div>

                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-100">
                        Welcome back
                    </p>

                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Log in to Picko
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                        Access your dashboard, manage bookings, and get back on court faster.
                    </p>
                </div>

                {error ? (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.08)]">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-400/20 text-xs font-bold text-red-200">
                            !
                        </div>

                        <div>
                            <p className="font-semibold text-red-100">Login failed</p>
                            <p className="mt-1 leading-5 text-red-200/90">{error}</p>
                        </div>
                    </div>
                ) : null}

                {message ? (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.08)]">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-xs font-bold text-emerald-200">
                            ✓
                        </div>

                        <div>
                            <p className="font-semibold text-emerald-100">Success</p>
                            <p className="mt-1 leading-5 text-emerald-200/90">{message}</p>
                        </div>
                    </div>
                ) : null}

                <LoginForm errorRedirectTo={errorRedirectTo} />
            </div>

            <div className="border-t border-white/10 bg-white/[0.03] px-6 py-4 text-center text-sm text-zinc-400 sm:px-8">
                Not a member?{" "}
                <Link href={registerHref} className="font-bold text-white hover:underline">
                    Sign up
                </Link>
            </div>
        </div>
    );
}