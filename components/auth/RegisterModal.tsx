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
        className="relative z-10 w-full max-w-xl"
      >
        <Link
          href="/"
          aria-label="Close sign up modal"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl font-semibold text-white backdrop-blur transition hover:bg-white/20"
        >
          ×
        </Link>

        <h2 id="signup-modal-title" className="sr-only">
          Sign up for Picko
        </h2>

        <RegisterCard
          error={error}
          message={message}
          errorRedirectTo="/?auth=signup"
        />
      </div>
    </div>
  );
}