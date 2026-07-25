"use strict";

/* =====================================
   CALENDARIO FINANCIERO
===================================== */

const FinancialCalendar = (() => {

    const MONTH_NAMES = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
    ];

    const WEEKDAY_NAMES = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado"
    ];

    function createId() {

        return (
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 9)
        );

    }

    function isValidDate(date) {

        return (
            date instanceof Date &&
            !Number.isNaN(date.getTime())
        );

    }

    function normalizeDate(value) {

        if (!value) {
            return null;
        }

        if (value instanceof Date) {

            const copy = new Date(value);

            copy.setHours(0, 0, 0, 0);

            return isValidDate(copy)
                ? copy
                : null;

        }

        if (typeof value === "string") {

            const trimmedValue = value.trim();

            if (!trimmedValue) {
                return null;
            }

            const simpleDateMatch =
                trimmedValue.match(
                    /^(\d{4})-(\d{2})-(\d{2})$/
                );

            if (simpleDateMatch) {

                const year =
                    Number(simpleDateMatch[1]);

                const month =
                    Number(simpleDateMatch[2]) - 1;

                const day =
                    Number(simpleDateMatch[3]);

                const localDate =
                    new Date(
                        year,
                        month,
                        day,
                        0,
                        0,
                        0,
                        0
                    );

                return isValidDate(localDate)
                    ? localDate
                    : null;

            }

        }

        const parsedDate = new Date(value);

        if (!isValidDate(parsedDate)) {
            return null;
        }

        parsedDate.setHours(0, 0, 0, 0);

        return parsedDate;

    }

    function toDateKey(value) {

        const date = normalizeDate(value);

        if (!date) {
            return "";
        }

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }

    function formatDate(value) {

        const date = normalizeDate(value);

        if (!date) {
            return "";
        }

        return new Intl.DateTimeFormat(
            "es-MX",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        ).format(date);

    }

    function formatShortDate(value) {

        const date = normalizeDate(value);

        if (!date) {
            return "";
        }

        return new Intl.DateTimeFormat(
            "es-MX",
            {
                day: "2-digit",
                month: "short"
            }
        ).format(date);

    }

    function formatCurrency(value) {

        const numberValue =
            Number(value) || 0;

        return new Intl.NumberFormat(
            "es-MX",
            {
                style: "currency",
                currency: "MXN",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ).format(numberValue);

    }

    function getMonthName(monthIndex) {

        return MONTH_NAMES[monthIndex] || "";

    }

    function getWeekdayName(dayIndex) {

        return WEEKDAY_NAMES[dayIndex] || "";

    }

    function getToday() {

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        return today;

    }

    function getCurrentMonth() {

        const today = getToday();

        return {
            year: today.getFullYear(),
            month: today.getMonth()
        };

    }

    function getMonthStart(
        year,
        month
    ) {

        return new Date(
            year,
            month,
            1,
            0,
            0,
            0,
            0
        );

    }

    function getMonthEnd(
        year,
        month
    ) {

        return new Date(
            year,
            month + 1,
            0,
            0,
            0,
            0,
            0
        );

    }

    function getDaysInMonth(
        year,
        month
    ) {

        return getMonthEnd(
            year,
            month
        ).getDate();

    }

    function isSameDay(
        firstValue,
        secondValue
    ) {

        const firstDate =
            normalizeDate(firstValue);

        const secondDate =
            normalizeDate(secondValue);

        if (!firstDate || !secondDate) {
            return false;
        }

        return (
            firstDate.getFullYear() ===
                secondDate.getFullYear() &&
            firstDate.getMonth() ===
                secondDate.getMonth() &&
            firstDate.getDate() ===
                secondDate.getDate()
        );

    }

    function isDateInMonth(
        value,
        year,
        month
    ) {

        const date = normalizeDate(value);

        if (!date) {
            return false;
        }

        return (
            date.getFullYear() === year &&
            date.getMonth() === month
        );

    }

    function sortEvents(events) {

        return [...events].sort(
            (
                firstEvent,
                secondEvent
            ) => {

                const firstDate =
                    normalizeDate(
                        firstEvent.date
                    );

                const secondDate =
                    normalizeDate(
                        secondEvent.date
                    );

                if (!firstDate && !secondDate) {
                    return 0;
                }

                if (!firstDate) {
                    return 1;
                }

                if (!secondDate) {
                    return -1;
                }

                const dateDifference =
                    firstDate.getTime() -
                    secondDate.getTime();

                if (dateDifference !== 0) {
                    return dateDifference;
                }

                return String(
                    firstEvent.title || ""
                ).localeCompare(
                    String(
                        secondEvent.title || ""
                    ),
                    "es"
                );

            }
        );

    }

    function createEvent({
        id,
        type,
        title,
        description,
        date,
        amount,
        status,
        sourceId,
        source
    }) {

        const normalizedDate =
            normalizeDate(date);

        if (!normalizedDate) {
            return null;
        }

        return {
            id:
                id ||
                createId(),

            type:
                type ||
                "movement",

            title:
                String(
                    title ||
                    "Movimiento"
                ).trim(),

            description:
                String(
                    description || ""
                ).trim(),

            date:
                toDateKey(
                    normalizedDate
                ),

            amount:
                Number(amount) || 0,

            status:
                status ||
                "pending",

            sourceId:
                sourceId || null,

            source:
                source || null
        };

    }

    function getEventsForDay(
        events,
        date
    ) {

        return sortEvents(
            events.filter(
                (event) =>
                    isSameDay(
                        event.date,
                        date
                    )
            )
        );

    }

    function getEventsForMonth(
        events,
        year,
        month
    ) {

        return sortEvents(
            events.filter(
                (event) =>
                    isDateInMonth(
                        event.date,
                        year,
                        month
                    )
            )
        );

    }

    function getUpcomingEvents(
        events,
        maximumResults = 5
    ) {

        const today =
            getToday();

        return sortEvents(
            events.filter(
                (event) => {

                    const eventDate =
                        normalizeDate(
                            event.date
                        );

                    return (
                        eventDate &&
                        eventDate.getTime() >=
                            today.getTime()
                    );

                }
            )
        ).slice(
            0,
            maximumResults
        );

    }

    function groupEventsByDate(events) {

        return sortEvents(events).reduce(
            (
                groups,
                event
            ) => {

                const dateKey =
                    toDateKey(
                        event.date
                    );

                if (!dateKey) {
                    return groups;
                }

                if (!groups[dateKey]) {
                    groups[dateKey] = [];
                }

                groups[dateKey].push(
                    event
                );

                return groups;

            },
            {}
        );

    }

    function getMonthGrid(
        year,
        month
    ) {

        const firstDay =
            getMonthStart(
                year,
                month
            );

        const daysInMonth =
            getDaysInMonth(
                year,
                month
            );

        const mondayBasedOffset =
            (
                firstDay.getDay() + 6
            ) % 7;

        const cells = [];

        for (
            let index = 0;
            index < mondayBasedOffset;
            index += 1
        ) {

            cells.push({
                day: null,
                date: null,
                dateKey: "",
                belongsToMonth: false
            });

        }

        for (
            let day = 1;
            day <= daysInMonth;
            day += 1
        ) {

            const date =
                new Date(
                    year,
                    month,
                    day,
                    0,
                    0,
                    0,
                    0
                );

            cells.push({
                day,
                date,
                dateKey:
                    toDateKey(date),

                belongsToMonth: true,

                isToday:
                    isSameDay(
                        date,
                        getToday()
                    )
            });

        }

        while (
            cells.length % 7 !== 0
        ) {

            cells.push({
                day: null,
                date: null,
                dateKey: "",
                belongsToMonth: false
            });

        }

        return cells;

    }

    function moveMonth(
        year,
        month,
        difference
    ) {

        const date =
            new Date(
                year,
                month + difference,
                1
            );

        return {
            year:
                date.getFullYear(),

            month:
                date.getMonth()
        };

    }

    return {
        MONTH_NAMES,
        WEEKDAY_NAMES,
        normalizeDate,
        toDateKey,
        formatDate,
        formatShortDate,
        formatCurrency,
        getMonthName,
        getWeekdayName,
        getToday,
        getCurrentMonth,
        getMonthStart,
        getMonthEnd,
        getDaysInMonth,
        isSameDay,
        isDateInMonth,
        sortEvents,
        createEvent,
        getEventsForDay,
        getEventsForMonth,
        getUpcomingEvents,
        groupEventsByDate,
        getMonthGrid,
        moveMonth
    };

})();

window.FinancialCalendar =
    FinancialCalendar;