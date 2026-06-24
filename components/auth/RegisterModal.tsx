import Link from "next/link";
import { RegisterCard } from "@/components/auth/RegisterCard";

type RegisterModalProps = {
    error?: string;
    message?: string;
};

export function RegisterModal({ error, message }: RegisterModalProps) {
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8">
            <Link
                href="/"
                aria-label="Close sign up modal"
                className="absolute inset-0 bg-black/45 backdrop-blur-md"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="signup-modal-title"
                className="relative z-10 flex max-h-[70vh] w-full max-w-lg items-center"
            >
                <Link
                    href="/"
                    aria-label="Close sign up modal"
                    className="absolute right-3 -top-8 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950/90 text-lg font-semibold leading-none text-white shadow-xl shadow-black/40 backdrop-blur transition hover:bg-white hover:text-zinc-950"                >
                    ×
                </Link>

                <h2 id="signup-modal-title" className="sr-only">
                    Sign up for Picko
                </h2>

                <RegisterCard
                    error={error}
                    message={message}
                    errorRedirectTo="/?auth=signup"
                    loginHref="/?auth=login"
                />
            </div>
        </div>
    );
}