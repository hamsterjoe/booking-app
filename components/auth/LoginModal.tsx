import Link from "next/link";
import { LoginCard } from "@/components/auth/LoginCard";

type LoginModalProps = {
  error?: string;
  message?: string;
};

export function LoginModal({ error, message }: LoginModalProps) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8">
      <Link
        href="/"
        aria-label="Close login modal"
        className="absolute inset-0 bg-black/45 backdrop-blur-md"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        className="relative z-10 flex max-h-[70vh] w-full max-w-lg items-center"
      >
        <Link
          href="/"
          aria-label="Close login modal"
          className="absolute right-3 -top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950/90 text-lg font-semibold leading-none text-white shadow-xl shadow-black/40 backdrop-blur transition hover:bg-white hover:text-zinc-950"
        >
          ×
        </Link>

        <h2 id="login-modal-title" className="sr-only">
          Log in to Picko
        </h2>

        <LoginCard
          error={error}
          message={message}
          errorRedirectTo="/?auth=login"
          registerHref="/?auth=signup"
        />
      </div>
    </div>
  );
}