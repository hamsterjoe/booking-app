"use client";

import { useState } from "react";

export function DiscountCodeToggle() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mt-4">
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                aria-expanded={isOpen}
                className="text-sm font-bold text-blue-600 transition hover:text-blue-700"
            >
                Apply a discount code
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? "mt-3 max-h-32 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="rounded-2xl border border-zinc-200 bg-white/70 p-3 shadow-sm backdrop-blur">
                    <label
                        htmlFor="discount-code"
                        className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500"
                    >
                        Discount code
                    </label>

                    <div className="mt-2 flex gap-2">
                        <input
                            id="discount-code"
                            name="discountCode"
                            type="text"
                            placeholder="Enter code"
                            className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />

                        <button
                            type="button"
                            className="rounded-xl bg-zinc-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-zinc-800"
                        >
                            Apply
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-zinc-500">
                        Coupon validation will be connected in a future milestone.
                    </p>
                </div>
            </div>
        </div>
    );
}