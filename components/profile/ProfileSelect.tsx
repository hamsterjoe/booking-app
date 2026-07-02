"use client";

import { useState } from "react";

type ProfileSelectOption = {
    label: string;
    value: string;
    description?: string;
};

type ProfileSelectProps = {
    name: string;
    defaultValue?: string | null;
    placeholder: string;
    options: ProfileSelectOption[];
};

export function ProfileSelect({
    name,
    defaultValue = "",
    placeholder,
    options,
}: ProfileSelectProps) {
    const [selectedValue, setSelectedValue] = useState(defaultValue ?? "");
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find((option) => option.value === selectedValue);

    return (
        <div className="relative">
            <input type="hidden" name={name} value={selectedValue} />

            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="flex min-h-11 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 text-left text-sm text-white outline-none transition hover:bg-white/15 focus:border-lime-300/50"
            >
                <span>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="text-white/40">▾</span>
            </button>

            {isOpen ? (
                <div className="absolute left-0 right-0 z-[80] mt-3 max-h-72 overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-2xl">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedValue("");
                            setIsOpen(false);
                        }}
                        className="w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-white/50 transition hover:bg-white/10"
                    >
                        {placeholder}
                    </button>

                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                setSelectedValue(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full rounded-2xl px-4 py-3 text-left transition hover:bg-white/10 ${selectedValue === option.value ? "bg-white/10" : ""
                                }`}
                        >
                            <span className="block text-sm font-bold text-white">
                                {option.label}
                            </span>

                            {option.description ? (
                                <span className="mt-1 block text-xs text-white/45">
                                    {option.description}
                                </span>
                            ) : null}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}