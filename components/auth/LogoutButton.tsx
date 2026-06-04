import { logout } from "@/app/auth/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm font-medium text-slate-600 hover:text-slate-950"
      >
        Log out
      </button>
    </form>
  );
}