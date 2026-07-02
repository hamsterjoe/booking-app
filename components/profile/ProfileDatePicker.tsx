"use client";

import { useMemo, useState } from "react";

type ProfileDatePickerProps = {
    name: string;
    defaultValue?: string | null;
};

const monthLabels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function pad(value: number) {
    return String(value).padStart(2, "0");
}

function toDateKey(year: number, monthIndex: number, day: number) {
    return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function formatDisplayDate(value: string | null) {
    if (!value) {
        return "Select date of birth";
    }

    return new Intl.DateTimeFormat("en-MY", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date(`${value}T00:00:00`));
}

export function ProfileDatePicker({
    name,
    defaultValue = null,
}: ProfileDatePickerProps) {
    const today = new Date();
    const defaultDate = defaultValue
        ? new Date(`${defaultValue}T00:00:00`)
        : new Date(today.getFullYear() - 18, 0, 1);

    const [selectedDate, setSelectedDate] = useState<string | null>(
        defaultValue ?? null,
    );
    const [isOpen, setIsOpen] = useState(false);
    const [displayYear, setDisplayYear] = useState(defaultDate.getFullYear());
    const [displayMonth, setDisplayMonth] = useState(defaultDate.getMonth());

    const currentYear = today.getFullYear();

    const years = useMemo(
        () =>
            Array.from({ length: 101 }).map((_, index) => currentYear - index),
        [currentYear],
    );

    const days = useMemo(() => {
        const firstDay = new Date(displayYear, displayMonth, 1);
        const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
        const firstWeekday = firstDay.getDay();

        return [
            ...Array.from({ length: firstWeekday }).map(() => null),
            ...Array.from({ length: daysInMonth }).map((_, index) => index + 1),
        ];
    }, [displayMonth, displayYear]);

    return (
        <div className="relative">
            <input type="hidden" name={name} value={selectedDate ?? ""} />

            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="flex min-h-11 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 text-left text-sm text-white outline-none transition hover:bg-white/15 focus:border-lime-300/50"
            >
                <span>{formatDisplayDate(selectedDate)}</span>
                <span className="text-white/40">▾</span>
            </button>

            {isOpen ? (
                <div className="absolute left-0 right-0 z-[90] mt-3 max-h-[26rem] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-2xl">
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            value={displayMonth}
                            onChange={(event) => setDisplayMonth(Number(event.target.value))}
                            className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-lime-300/50"
                        >
                            {monthLabels.map((month, index) => (
                                <option key={month} value={index} className="bg-slate-950">
                                    {month}
                                </option>
                            ))}
                        </select>

                        <select
                            value={displayYear}
                            onChange={(event) => setDisplayYear(Number(event.target.value))}
                            className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-lime-300/50"
                        >
                            {years.map((year) => (
                                <option key={year} value={year} className="bg-slate-950">
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-wide text-white/35">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                            <div key={`${day}-${index}`} className="py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="mt-1 grid grid-cols-7 gap-1">
                        {days.map((day, index) => {
                            if (!day) {
                                return <div key={`blank-${index}`} />;
                            }

                            const dateKey = toDateKey(displayYear, displayMonth, day);
                            const isSelected = selectedDate === dateKey;
                            const isFuture =
                                new Date(`${dateKey}T00:00:00`).getTime() >
                                new Date(
                                    today.getFullYear(),
                                    today.getMonth(),
                                    today.getDate(),
                                ).getTime();

                            return (
                                <button
                                    key={dateKey}
                                    type="button"
                                    disabled={isFuture}
                                    onClick={() => {
                                        setSelectedDate(dateKey);
                                        setIsOpen(false);
                                    }}
                                    className={`flex h-9 items-center justify-center rounded-xl text-sm font-bold transition ${isSelected
                                        ? "bg-lime-300 text-slate-950"
                                        : "text-white hover:bg-white/10"
                                        } ${isFuture ? "cursor-not-allowed opacity-25" : ""}`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setSelectedDate(null);
                            setIsOpen(false);
                        }}
                        className="mt-4 w-full rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-white/15"
                    >
                        Clear date
                    </button>
                </div>
            ) : null}
        </div>
    );
}