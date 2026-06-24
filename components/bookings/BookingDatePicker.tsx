"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type BookingDatePickerProps = {
    selectedDate: string;
    todayDate: string;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseDateKey(dateKey: string) {
    return new Date(`${dateKey}T00:00:00+08:00`);
}

function formatDateKey(date: Date) {
    return new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Kuala_Lumpur",
    }).format(date);
}

function addDays(dateKey: string, days: number) {
    const date = parseDateKey(dateKey);
    date.setUTCDate(date.getUTCDate() + days);

    return formatDateKey(date);
}

function getMonthKey(dateKey: string) {
    return dateKey.slice(0, 7);
}

function addMonths(monthKey: string, months: number) {
    const [year, month] = monthKey.split("-").map(Number);
    const date = new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00+08:00`);

    date.setUTCMonth(date.getUTCMonth() + months);

    return formatDateKey(date).slice(0, 7);
}

function getDaysInMonth(monthKey: string) {
    const [year, month] = monthKey.split("-").map(Number);

    return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function getWeekdayIndex(dateKey: string) {
    const label = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        timeZone: "Asia/Kuala_Lumpur",
    }).format(parseDateKey(dateKey));

    return weekdayLabels.indexOf(label);
}

function formatMonthLabel(monthKey: string) {
    return new Intl.DateTimeFormat("en-MY", {
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kuala_Lumpur",
    }).format(parseDateKey(`${monthKey}-01`));
}

function formatSelectedDateLabel(dateKey: string) {
    return new Intl.DateTimeFormat("en-MY", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kuala_Lumpur",
    }).format(parseDateKey(dateKey));
}

function formatQuickDayLabel(dateKey: string, index: number) {
    if (index === 0) {
        return "Today";
    }

    return new Intl.DateTimeFormat("en-MY", {
        weekday: "short",
        timeZone: "Asia/Kuala_Lumpur",
    }).format(parseDateKey(dateKey));
}

export function BookingDatePicker({
    selectedDate,
    todayDate,
}: BookingDatePickerProps) {
    const router = useRouter();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(() => getMonthKey(selectedDate));

    const quickDates = useMemo(() => {
        return Array.from({ length: 7 }, (_, index) => {
            const dateKey = addDays(todayDate, index);

            return {
                dateKey,
                label: formatQuickDayLabel(dateKey, index),
                dayNumber: Number(dateKey.slice(-2)),
            };
        });
    }, [todayDate]);

    const calendarDays = useMemo(() => {
        const daysInMonth = getDaysInMonth(visibleMonth);
        const firstDateKey = `${visibleMonth}-01`;
        const leadingEmptyDays = getWeekdayIndex(firstDateKey);

        return [
            ...Array.from({ length: leadingEmptyDays }, () => null),
            ...Array.from({ length: daysInMonth }, (_, index) => {
                const dayNumber = index + 1;

                return `${visibleMonth}-${String(dayNumber).padStart(2, "0")}`;
            }),
        ];
    }, [visibleMonth]);

    function selectDate(dateKey: string) {
        if (dateKey < todayDate) {
            return;
        }

        setIsCalendarOpen(false);
        router.push(`/bookings/new?date=${dateKey}`, { scroll: false });
    }

    return (
        <div className="relative z-30 overflow-visible rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-6">      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-white/10 via-white/[0.03] to-black/20" />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-100">
                        Pick a date
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-white">
                        {formatSelectedDateLabel(selectedDate)}
                    </h2>
                </div>

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsCalendarOpen((current) => !current)}
                        className="inline-flex items-center gap-3 rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 backdrop-blur transition hover:bg-white/10"
                    >
                        <span aria-hidden="true">📅</span>
                        <span>Choose another date</span>
                        <span
                            className={`text-xs text-zinc-400 transition ${isCalendarOpen ? "rotate-180" : ""
                                }`}
                        >
                            ▾
                        </span>
                    </button>

                    {isCalendarOpen ? (
                        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-2xl">
                            <div className="mb-4 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-lg text-white transition hover:bg-white/10"
                                    aria-label="Previous month"
                                >
                                    ‹
                                </button>

                                <p className="text-base font-bold text-white">
                                    {formatMonthLabel(visibleMonth)}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-lg text-white transition hover:bg-white/10"
                                    aria-label="Next month"
                                >
                                    ›
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-500">
                                {weekdayLabels.map((weekday) => (
                                    <div key={weekday} className="py-2">
                                        {weekday}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-1 grid grid-cols-7 gap-1">
                                {calendarDays.map((dateKey, index) => {
                                    if (!dateKey) {
                                        return <div key={`empty-${index}`} />;
                                    }

                                    const isSelected = dateKey === selectedDate;
                                    const isPast = dateKey < todayDate;
                                    const dayNumber = Number(dateKey.slice(-2));

                                    return (
                                        <button
                                            key={dateKey}
                                            type="button"
                                            disabled={isPast}
                                            onClick={() => selectDate(dateKey)}
                                            className={`flex h-10 items-center justify-center rounded-xl text-sm font-bold transition ${isSelected
                                                    ? "bg-sky-400 text-zinc-950 shadow-[0_0_24px_rgba(56,189,248,0.35)]"
                                                    : isPast
                                                        ? "cursor-not-allowed text-zinc-700"
                                                        : "text-zinc-200 hover:bg-white/10 hover:text-white"
                                                }`}
                                        >
                                            {dayNumber}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {quickDates.map((date, index) => {
                    const isSelected = date.dateKey === selectedDate;

                    return (
                        <button
                            key={date.dateKey}
                            type="button"
                            onClick={() => selectDate(date.dateKey)}
                            className={`group rounded-2xl border px-4 py-4 text-center transition ${isSelected
                                    ? "border-sky-300 bg-sky-400 text-zinc-950 shadow-[0_0_35px_rgba(56,189,248,0.35)]"
                                    : "border-white/10 bg-black/25 text-white hover:border-white/20 hover:bg-white/10"
                                }`}
                        >
                            <span
                                className={`block text-xs font-bold uppercase tracking-[0.18em] ${isSelected ? "text-zinc-900/70" : "text-zinc-400"
                                    }`}
                            >
                                {date.label}
                            </span>

                            <span className="mt-2 block text-2xl font-black">
                                {date.dayNumber}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}