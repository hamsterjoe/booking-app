import { RegisterCard } from "@/components/auth/RegisterCard";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  return (
    <section className="min-h-screen bg-black px-4 pb-16 pt-36 text-white sm:px-6">
      <div className="mx-auto flex max-w-6xl justify-center">
        <RegisterCard error={params.error} message={params.message} />
      </div>
    </section>
  );
}