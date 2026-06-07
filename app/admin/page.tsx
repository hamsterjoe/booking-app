import Link from "next/link";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPage() {
    const { user } = await requireAdmin();

    const supabase = await createSupabaseServerClient();

    const { count: courtCount } = await supabase
        .from("courts")
        .select("*", { count: "exact", head: true });

    const { count: slotCount } = await supabase
        .from("court_slots")
        .select("*", { count: "exact", head: true });

    const { count: bookingCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "confirmed"]);

    return (
        <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
            <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Picko admin
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-950">
                    Admin dashboard
                </h1>

                <p className="mt-3 max-w-2xl text-slate-600">
                    Manage Picko courts, slots, and bookings. You are signed in as{" "}
                    <span className="font-medium text-slate-900">{user.email}</span>.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-950">Courts</h2>
                    <p className="mt-4 text-4xl font-bold text-slate-950">
                        {courtCount ?? 0}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                        Total courts in the system.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-950">Court slots</h2>
                    <p className="mt-4 text-4xl font-bold text-slate-950">
                        {slotCount ?? 0}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                        Total court slots created.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-950">Active Bookings</h2>
                    <p className="mt-4 text-4xl font-bold text-slate-950">
                        {bookingCount ?? 0}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                        Pending or confirmed bookings.
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">Admin tools</h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Link
                        href="/admin/courts"
                        className="rounded-lg border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                        Manage courts
                    </Link>

                    <Link
                        href="/admin/slots"
                        className="rounded-lg border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                        Manage slots
                    </Link>

                    <Link
                        href="/admin/bookings"
                        className="rounded-lg border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                        View all bookings
                    </Link>
                </div>

                <p className="mt-4 text-sm text-slate-500">
                    These tools will be built in upcoming milestones.
                </p>
            </div>
        </section>
    );
}