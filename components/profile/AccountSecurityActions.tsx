"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteAccount, updatePassword } from "@/app/profile/actions";

function SecuritySubmitButton({
  children,
  pendingText,
  variant = "primary",
  disabled = false,
}: {
  children: React.ReactNode;
  pendingText: string;
  variant?: "primary" | "danger" | "secondary";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  const variantClasses = {
    primary:
      "bg-white text-slate-950 hover:bg-lime-200 disabled:bg-white/30 disabled:text-white/40",
    secondary:
      "border border-white/15 bg-white/10 text-white hover:bg-white/15 disabled:text-white/30",
    danger:
      "bg-red-500 text-white hover:bg-red-400 disabled:bg-red-500/25 disabled:text-red-100/40",
  };

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-black transition disabled:cursor-not-allowed ${variantClasses[variant]}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}

export function AccountSecurityActions() {
  const [activeModal, setActiveModal] = useState<"password" | "delete" | null>(
    null,
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  return (
    <>
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-white/40">
          Account security
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveModal("password")}
            className="group rounded-3xl border border-white/10 bg-white/10 p-5 text-left transition hover:-translate-y-0.5 hover:bg-white/15"
          >
            <h3 className="text-lg font-black text-white">Change password</h3>

            <p className="mt-2 text-sm leading-6 text-white/50">
              Update your login password securely.
            </p>

            <span className="mt-4 inline-flex text-xs font-bold uppercase tracking-wide text-lime-200/70 transition group-hover:text-lime-100">
              Open password settings →
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal("delete")}
            className="group rounded-3xl border border-red-300/20 bg-red-400/10 p-5 text-left transition hover:-translate-y-0.5 hover:bg-red-400/15"
          >
            <h3 className="text-lg font-black text-red-100">Delete account</h3>

            <p className="mt-2 text-sm leading-6 text-red-100/60">
              Permanently delete your Picko account after confirmation.
            </p>

            <span className="mt-4 inline-flex text-xs font-bold uppercase tracking-wide text-red-200/70 transition group-hover:text-red-100">
              Open delete confirmation →
            </span>
          </button>
        </div>
      </div>

      {activeModal === "password" ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6 backdrop-blur-xl">
          <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 p-6 text-white shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-lime-200/70">
                  Account security
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight">
                  Change password
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/55">
                  Choose a new password with at least 6 characters.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
                aria-label="Close change password modal"
              >
                ×
              </button>
            </div>

            <form action={updatePassword} className="mt-6 grid gap-4">
              <div>
                <label
                  htmlFor="newPassword"
                  className="text-sm font-bold text-white/75"
                >
                  New password
                </label>

                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-white/30 hover:bg-white/15 focus:border-lime-300/50"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-bold text-white/75"
                >
                  Confirm new password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-white/30 hover:bg-white/15 focus:border-lime-300/50"
                />
              </div>

              <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 text-sm font-black text-white transition hover:bg-white/15"
                >
                  Cancel
                </button>

                <SecuritySubmitButton pendingText="Updating password...">
                  Update password
                </SecuritySubmitButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {activeModal === "delete" ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-6 backdrop-blur-xl">
          <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-red-300/20 bg-slate-950 p-6 text-white shadow-2xl shadow-red-950/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-red-200/70">
                  Destructive action
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-red-100">
                  Delete account
                </h2>

                <p className="mt-3 text-sm leading-6 text-red-100/60">
                  This permanently deletes your Picko account. Your active slots
                  will be released before deletion.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmation("");
                  setActiveModal(null);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
                aria-label="Close delete account modal"
              >
                ×
              </button>
            </div>

            <form action={deleteAccount} className="mt-6 grid gap-4">
              <div className="rounded-3xl border border-red-300/20 bg-red-400/10 p-4">
                <p className="text-sm font-semibold leading-6 text-red-100/80">
                  Type <span className="font-black text-white">DELETE</span> to
                  confirm. This cannot be undone.
                </p>
              </div>

              <div>
                <label
                  htmlFor="deleteConfirmation"
                  className="text-sm font-bold text-red-100/75"
                >
                  Confirmation
                </label>

                <input
                  id="deleteConfirmation"
                  name="confirmation"
                  type="text"
                  value={deleteConfirmation}
                  onChange={(event) =>
                    setDeleteConfirmation(event.target.value)
                  }
                  placeholder="DELETE"
                  className="mt-2 min-h-11 w-full rounded-2xl border border-red-300/20 bg-red-400/10 px-4 text-sm font-black tracking-widest text-white outline-none transition placeholder:text-red-100/25 hover:bg-red-400/15 focus:border-red-200/60"
                />
              </div>

              <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmation("");
                    setActiveModal(null);
                  }}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 text-sm font-black text-white transition hover:bg-white/15"
                >
                  Cancel
                </button>

                <SecuritySubmitButton
                  variant="danger"
                  pendingText="Deleting account..."
                  disabled={deleteConfirmation !== "DELETE"}
                >
                  Delete permanently
                </SecuritySubmitButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}