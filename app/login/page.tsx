import { LoginCard } from "@/components/auth/LoginCard";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <section className="flex min-h-screen items-center justify-center bg-black px-4 pb-8 pt-28 text-white sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl justify-center">
        <LoginCard error={params.error} message={params.message} />
      </div>
    </section>
  );
}