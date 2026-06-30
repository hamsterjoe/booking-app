"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ToastMessageProps = {
  message?: string;
  error?: string;
};

export function ToastMessage({ message, error }: ToastMessageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const text = error ?? message;
  const type = error ? "error" : "success";
  const [isOpen, setIsOpen] = useState(Boolean(text));

  useEffect(() => {
    if (!text) {
      return;
    }

    setIsOpen(true);

    const timeout = window.setTimeout(() => {
      dismissToast();
    }, 4500);

    return () => {
      window.clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  function dismissToast() {
    setIsOpen(false);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("message");
    params.delete("error");

    const queryString = params.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  if (!text || !isOpen) {
    return null;
  }

  return (
    <div className="fixed right-6 top-28 z-[100] w-[min(24rem,calc(100vw-3rem))]">
      <div
        className={`rounded-2xl border p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl ${
          type === "error"
            ? "border-red-400/30 bg-red-500/15 text-red-100"
            : "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
              type === "error"
                ? "bg-red-400/20 text-red-100"
                : "bg-emerald-400/20 text-emerald-100"
            }`}
          >
            {type === "error" ? "!" : "✓"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">
              {type === "error" ? "Something went wrong" : "Success"}
            </p>
            <p className="mt-1 text-sm leading-5 opacity-90">{text}</p>
          </div>

          <button
            type="button"
            onClick={dismissToast}
            aria-label="Dismiss notification"
            className="rounded-full px-2 text-lg leading-none opacity-70 transition hover:opacity-100"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}