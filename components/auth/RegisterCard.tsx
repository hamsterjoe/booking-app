import Link from "next/link";
import { register } from "@/app/auth/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";

type RegisterCardProps = {
    error?: string;
    message?: string;
    errorRedirectTo?: string;
};

export function RegisterCard({
    error,
    message,
    errorRedirectTo = "/register",
}: RegisterCardProps) {
    return (
        <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/85 shadow-2xl shadow-black/50 backdrop-blur-2xl">
            <div className="px-6 py-6 sm:px-8 sm:py-7">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-300 shadow-[0_0_35px_rgba(250,204,21,0.4)]">
                    <div className="h-9 w-9 rounded-full border-[5px] border-yellow-500 bg-yellow-200 shadow-inner" />
                </div>

                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-100">
                        Join us today
                    </p>

                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Create your Picko account
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                        Book courts faster, manage your games, and keep every reservation in one
                        clean dashboard.
                    </p>
                </div>

                {error ? (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.08)]">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-400/20 text-xs font-bold text-red-200">
                            !
                        </div>

                        <div>
                            <p className="font-semibold text-red-100">Sign up failed</p>
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

                <form action={register} className="mt-6 space-y-4">
                    <input type="hidden" name="errorRedirectTo" value={errorRedirectTo} />

                    <div>
                        <label htmlFor="email" className="text-sm font-semibold text-white">
                            Email address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="mt-2 w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="text-sm font-semibold text-white"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="Create a password"
                            className="mt-2 w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10"
                        />
                        <p className="mt-2 text-xs text-zinc-500">
                            Use at least 6 characters.
                        </p>
                    </div>

                    <SubmitButton
                        pendingText="Creating account..."
                        className="w-full rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400"
                    >
                        Sign up
                    </SubmitButton>
                </form>
            </div>

            <div className="border-t border-white/10 bg-white/[0.03] px-6 py-4 text-center text-sm text-zinc-400 sm:px-8">                Already have an account?{" "}
                <Link href="/login" className="font-bold text-white hover:underline">
                    Log in
                </Link>
            </div>
        </div>
    );
}