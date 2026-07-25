"use strict";

/* =====================================
   INTERFAZ DEL CALENDARIO FINANCIERO
===================================== */

const FinancialCalendarUI = (() => {

    let calendarView = null;
    let calendarGrid = null;
    let calendarMonthTitle = null;
    let selectedDateTitle = null;
    let selectedDateEvents = null;
    let calendarEmptyState = null;

    let currentYear = 0;
    let currentMonth = 0;
    let selectedDate = null;

    const WEEKDAY_SHORT_NAMES = [
        "Lun",
        "Mar",
        "Mié",
        "Jue",
        "Vie",
        "Sáb",
        "Dom"
    ];

    function getCalendarModule() {

        return window.FinancialCalendar || null;

    }

    function createElement(
        tagName,
        className = "",
        textContent = ""
    ) {

        const element =
            document.createElement(tagName);

        if (className) {

            element.className =
                className;

        }

        if (textContent) {

            element.textContent =
                textContent;

        }

        return element;

    }

    function createCalendarView() {

        const existingView =
            document.getElementById(
                "view-calendario"
            );

        if (existingView) {

            calendarView =
                existingView;

            assignElements();

            return;

        }

        const mainContent =
            document.querySelector(
                ".main-content"
            );

        if (!mainContent) {

            console.error(
                "No se encontró el contenedor principal de la aplicación."
            );

            return;

        }

        calendarView =
            createElement(
                "section",
                "app-view calendar-view"
            );

        calendarView.id =
            "view-calendario";

        calendarView.hidden =
            true;

        const header =
            createElement(
                "div",
                "view-header calendar-view-header"
            );

        const headerContent =
            createElement("div");

        const eyebrow =
            createElement(
                "p",
                "view-eyebrow",
                "Organización financiera"
            );

        const title =
            createElement(
                "h2",
                "",
                "Calendario financiero"
            );

        const description =
            createElement(
                "p",
                "view-description",
                "Consulta las fechas importantes de tus pagos, tarjetas y movimientos."
            );

        headerContent.append(
            eyebrow,
            title,
            description
        );

        const todayButton =
            createElement(
                "button",
                "secondary-button calendar-today-button",
                "Hoy"
            );

        todayButton.id =
            "calendar-today-button";

        todayButton.type =
            "button";

        header.append(
            headerContent,
            todayButton
        );

        const calendarCard =
            createElement(
                "article",
                "section-card financial-calendar-card"
            );

        const controls =
            createElement(
                "div",
                "calendar-controls"
            );

        const previousButton =
            createElement(
                "button",
                "icon-button calendar-navigation-button",
                "‹"
            );

        previousButton.id =
            "calendar-previous-month";

        previousButton.type =
            "button";

        previousButton.setAttribute(
            "aria-label",
            "Mes anterior"
        );

        calendarMonthTitle =
            createElement(
                "h3",
                "calendar-month-title"
            );

        calendarMonthTitle.id =
            "calendar-month-title";

        const nextButton =
            createElement(
                "button",
                "icon-button calendar-navigation-button",
                "›"
            );

        nextButton.id =
            "calendar-next-month";

        nextButton.type =
            "button";

        nextButton.setAttribute(
            "aria-label",
            "Mes siguiente"
        );

        controls.append(
            previousButton,
            calendarMonthTitle,
            nextButton
        );

        const weekdayHeader =
            createElement(
                "div",
                "calendar-weekdays"
            );

        WEEKDAY_SHORT_NAMES.forEach(
            weekdayName => {

                const weekday =
                    createElement(
                        "span",
                        "calendar-weekday",
                        weekdayName
                    );

                weekdayHeader.appendChild(
                    weekday
                );

            }
        );

        calendarGrid =
            createElement(
                "div",
                "calendar-grid"
            );

        calendarGrid.id =
            "calendar-grid";

        calendarCard.append(
            controls,
            weekdayHeader,
            calendarGrid
        );

        const selectedDayCard =
            createElement(
                "article",
                "section-card calendar-events-card"
            );

        const selectedDayHeader =
            createElement(
                "div",
                "section-card-header calendar-events-header"
            );

        const selectedDayHeaderContent =
            createElement("div");

        const selectedDayEyebrow =
            createElement(
                "p",
                "card-overline",
                "Movimientos del día"
            );

        selectedDateTitle =
            createElement(
                "h2",
                "calendar-selected-date-title"
            );

        selectedDateTitle.id =
            "calendar-selected-date-title";

        selectedDayHeaderContent.append(
            selectedDayEyebrow,
            selectedDateTitle
        );

        selectedDayHeader.appendChild(
            selectedDayHeaderContent
        );

        calendarEmptyState =
            createElement(
                "div",
                "empty-state compact calendar-empty-state"
            );

        calendarEmptyState.id =
            "calendar-empty-state";

        const emptyIcon =
            createElement(
                "div",
                "empty-state-icon",
                "📆"
            );

        const emptyContent =
            createElement("div");

        const emptyTitle =
            createElement(
                "h3",
                "",
                "No hay movimientos en esta fecha"
            );

        const emptyDescription =
            createElement(
                "p",
                "",
                "Los pagos, gastos e ingresos aparecerán aquí cuando tengan esta fecha."
            );

        emptyContent.append(
            emptyTitle,
            emptyDescription
        );

        calendarEmptyState.append(
            emptyIcon,
            emptyContent
        );

        selectedDateEvents =
            createElement(
                "div",
                "records-list calendar-events-list"
            );

        selectedDateEvents.id =
            "calendar-events-list";

        selectedDayCard.append(
            selectedDayHeader,
            calendarEmptyState,
            selectedDateEvents
        );

        calendarView.append(
            header,
            calendarCard,
            selectedDayCard
        );

        mainContent.appendChild(
            calendarView
        );

        assignElements();
        addCalendarEvents();

    }

    function assignElements() {

        calendarView =
            document.getElementById(
                "view-calendario"
            );

        calendarGrid =
            document.getElementById(
                "calendar-grid"
            );

        calendarMonthTitle =
            document.getElementById(
                "calendar-month-title"
            );

        selectedDateTitle =
            document.getElementById(
                "calendar-selected-date-title"
            );

        selectedDateEvents =
            document.getElementById(
                "calendar-events-list"
            );

        calendarEmptyState =
            document.getElementById(
                "calendar-empty-state"
            );

    }

    function addCalendarEvents() {

        const previousButton =
            document.getElementById(
                "calendar-previous-month"
            );

        const nextButton =
            document.getElementById(
                "calendar-next-month"
            );

        const todayButton =
            document.getElementById(
                "calendar-today-button"
            );

        if (previousButton) {

            previousButton.addEventListener(
                "click",
                () => {

                    changeMonth(-1);

                }
            );

        }

        if (nextButton) {

            nextButton.addEventListener(
                "click",
                () => {

                    changeMonth(1);

                }
            );

        }

        if (todayButton) {

            todayButton.addEventListener(
                "click",
                goToToday
            );

        }

    }

    function initializeCurrentDate() {

        const calendar =
            getCalendarModule();

        if (!calendar) {

            return;

        }

        const current =
            calendar.getCurrentMonth();

        currentYear =
            current.year;

        currentMonth =
            current.month;

        selectedDate =
            calendar.getToday();

    }

    function getIncomeRecords() {

        if (
            !window.IncomeManager ||
            typeof window.IncomeManager.getAll !==
                "function"
        ) {

            return [];

        }

        const incomes =
            window.IncomeManager.getAll();

        return Array.isArray(incomes)
            ? incomes
            : [];

    }

    function getExpenseRecords() {

        if (
            !window.ExpenseManager ||
            typeof window.ExpenseManager.getAll !==
                "function"
        ) {

            return [];

        }

        const expenses =
            window.ExpenseManager.getAll();

        return Array.isArray(expenses)
            ? expenses
            : [];

    }

    function getCardRecords() {

        if (
            !window.CardManager ||
            typeof window.CardManager.getAll !==
                "function"
        ) {

            return [];

        }

        const cards =
            window.CardManager.getAll();

        return Array.isArray(cards)
            ? cards
            : [];

    }

    function getPaymentPlanRecords() {

        if (
            !window.PaymentPlanManager ||
            typeof window.PaymentPlanManager.getAll !==
                "function"
        ) {

            return [];

        }

        const plans =
            window.PaymentPlanManager.getAll();

        return Array.isArray(plans)
            ? plans
            : [];

    }

    function createInstallmentDate(
        firstPaymentDate,
        installmentIndex
    ) {

        const calendar =
            getCalendarModule();

        if (!calendar) {

            return null;

        }

        const baseDate =
            calendar.normalizeDate(
                firstPaymentDate
            );

        if (!baseDate) {

            return null;

        }

        const targetYear =
            baseDate.getFullYear();

        const targetMonth =
            baseDate.getMonth() +
            installmentIndex;

        const normalizedMonth =
            new Date(
                targetYear,
                targetMonth,
                1
            );

        const requestedDay =
            baseDate.getDate();

        const validDay =
            Math.min(
                requestedDay,
                calendar.getDaysInMonth(
                    normalizedMonth.getFullYear(),
                    normalizedMonth.getMonth()
                )
            );

        return new Date(
            normalizedMonth.getFullYear(),
            normalizedMonth.getMonth(),
            validDay
        );

    }

    function createMonthlyDate(
        year,
        month,
        requestedDay
    ) {

        const calendar =
            getCalendarModule();

        if (!calendar) {

            return null;

        }

        const validDay = Math.min(
            Math.max(
                Number(requestedDay) || 1,
                1
            ),
            calendar.getDaysInMonth(
                year,
                month
            )
        );

        return new Date(
            year,
            month,
            validDay
        );

    }

    function createCardEvents() {

        const calendar =
            getCalendarModule();

        if (!calendar) {

            return [];

        }

        return getCardRecords()
            .flatMap(
                card => {

                    const cardName =
                        card.name ||
                        "Tarjeta";

                    const bankName =
                        card.bank ||
                        "Banco no especificado";

                    const usedAmount =
                        Number(card.used) || 0;

                    const cutEvent =
                        calendar.createEvent({
                            id:
                                `card-cut-${card.id}-${currentYear}-${currentMonth}`,

                            type:
                                "cardCut",

                            title:
                                `Corte de ${cardName}`,

                            description:
                                `${bankName} · Día de corte`,

                            date:
                                createMonthlyDate(
                                    currentYear,
                                    currentMonth,
                                    card.cutDay
                                ),

                            amount:
                                usedAmount,

                            status:
                                "pending",

                            sourceId:
                                card.id,

                            source:
                                "card"
                        });

                    const paymentEvent =
                        calendar.createEvent({
                            id:
                                `card-payment-${card.id}-${currentYear}-${currentMonth}`,

                            type:
                                "cardPayment",

                            title:
                                `Pago de ${cardName}`,

                            description:
                                `${bankName} · Fecha límite de pago`,

                            date:
                                createMonthlyDate(
                                    currentYear,
                                    currentMonth,
                                    card.dueDay
                                ),

                            amount:
                                usedAmount,

                            status:
                                "pending",

                            sourceId:
                                card.id,

                            source:
                                "card"
                        });

                    const cardColor =
                        card.color ||
                        "#2563eb";

                    if (cutEvent) {
                        cutEvent.color = cardColor;
                    }

                    if (paymentEvent) {
                        paymentEvent.color = cardColor;
                    }

                    return [
                        cutEvent,
                        paymentEvent
                    ].filter(Boolean);

                }
            );

    }

    function createPaymentPlanEvents() {

        const calendar =
            getCalendarModule();

        if (!calendar) {

            return [];

        }

        return getPaymentPlanRecords()
            .flatMap(
                plan => {

                    const totalInstallments =
                        Math.max(
                            Number(
                                plan.totalInstallments
                            ) || 0,
                            0
                        );

                    const paidInstallments =
                        Math.min(
                            Math.max(
                                Number(
                                    plan.paidInstallments
                                ) || 0,
                                0
                            ),
                            totalInstallments
                        );

                    const totalAmount =
                        Number(
                            plan.totalAmount
                        ) || 0;

                    const monthlyPayment =
                        totalInstallments > 0
                            ? totalAmount /
                                totalInstallments
                            : 0;

                    const events = [];

                    for (
                        let installmentIndex = 0;
                        installmentIndex <
                            totalInstallments;
                        installmentIndex += 1
                    ) {

                        const paymentDate =
                            createInstallmentDate(
                                plan.firstPaymentDate,
                                installmentIndex
                            );

                        if (!paymentDate) {

                            continue;

                        }

                        const installmentNumber =
                            installmentIndex + 1;

                        const isPaid =
                            installmentIndex <
                            paidInstallments;

                        const event =
                            calendar.createEvent({
                                id:
                                    `payment-plan-${plan.id}-${installmentNumber}`,

                                type:
                                    "paymentPlan",

                                title:
                                    plan.description ||
                                    "Plan de pago",

                                description:
                                    `${
                                        plan.cardName ||
                                        "Tarjeta"
                                    } · Mensualidad ${
                                        installmentNumber
                                    } de ${
                                        totalInstallments
                                    } · ${
                                        isPaid
                                            ? "Pagada"
                                            : "Pendiente"
                                    }`,

                                date:
                                    paymentDate,

                                amount:
                                    monthlyPayment,

                                status:
                                    isPaid
                                        ? "completed"
                                        : "pending",

                                sourceId:
                                    plan.id,

                                source:
                                    "paymentPlan"
                            });

                        if (event) {

                            event.installmentNumber =
                                installmentNumber;

                            event.totalInstallments =
                                totalInstallments;

                            event.isPaid =
                                isPaid;

                            events.push(event);

                        }

                    }

                    return events;

                }
            );

    }

    function getEventColor(event) {

        if (event.color) {
            return event.color;
        }

        const colors = {
            income: "#16a34a",
            expense: "#dc2626",
            cardCut: "#f59e0b",
            cardPayment: "#7c3aed",
            paymentPlan: "#2563eb",
            movement: "#64748b"
        };

        return (
            colors[event.type] ||
            colors.movement
        );

    }

    function createIncomeEvents() {

        const calendar =
            getCalendarModule();

        if (!calendar) {

            return [];

        }

        return getIncomeRecords()
            .map(
                income => {

                    return calendar.createEvent({
                        id:
                            `income-${income.id}`,

                        type:
                            "income",

                        title:
                            income.name ||
                            "Ingreso",

                        description:
                            income.category ||
                            "Ingreso",

                        date:
                            income.date,

                        amount:
                            Number(
                                income.amount
                            ) || 0,

                        status:
                            "completed",

                        sourceId:
                            income.id,

                        source:
                            "income"
                    });

                }
            )
            .filter(Boolean);

    }

    function createExpenseEvents() {

        const calendar =
            getCalendarModule();

        if (!calendar) {

            return [];

        }

        return getExpenseRecords()
            .map(
                expense => {

                    return calendar.createEvent({
                        id:
                            `expense-${expense.id}`,

                        type:
                            "expense",

                        title:
                            expense.name ||
                            "Gasto",

                        description:
                            expense.category ||
                            expense.type ||
                            "Gasto",

                        date:
                            expense.date,

                        amount:
                            Number(
                                expense.amount
                            ) || 0,

                        status:
                            "completed",

                        sourceId:
                            expense.id,

                        source:
                            "expense"
                    });

                }
            )
            .filter(Boolean);

    }

    function getAllEvents() {

        const calendar =
            getCalendarModule();

        if (!calendar) {

            return [];

        }

        const events = [
            ...createIncomeEvents(),
            ...createExpenseEvents(),
            ...createCardEvents(),
            ...createPaymentPlanEvents()
        ];

        return calendar.sortEvents(
            events
        );

    }

    function getEventsForSelectedDate() {

        const calendar =
            getCalendarModule();

        if (
            !calendar ||
            !selectedDate
        ) {

            return [];

        }

        return calendar.getEventsForDay(
            getAllEvents(),
            selectedDate
        );

    }

    function getEventsForVisibleMonth() {

        const calendar =
            getCalendarModule();

        if (!calendar) {

            return [];

        }

        return calendar.getEventsForMonth(
            getAllEvents(),
            currentYear,
            currentMonth
        );

    }

    function renderCalendar() {

        const calendar =
            getCalendarModule();

        if (
            !calendar ||
            !calendarGrid ||
            !calendarMonthTitle
        ) {

            return;

        }

        calendarMonthTitle.textContent =
            `${calendar.getMonthName(
                currentMonth
            )} ${currentYear}`;

        calendarGrid.innerHTML =
            "";

        const monthCells =
            calendar.getMonthGrid(
                currentYear,
                currentMonth
            );

        const monthEvents =
            getEventsForVisibleMonth();

        const groupedEvents =
            calendar.groupEventsByDate(
                monthEvents
            );

        monthCells.forEach(
            cell => {

                if (!cell.belongsToMonth) {

                    const emptyCell =
                        createElement(
                            "div",
                            "calendar-day calendar-day-empty"
                        );

                    emptyCell.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                    calendarGrid.appendChild(
                        emptyCell
                    );

                    return;

                }

                const dayButton =
                    createElement(
                        "button",
                        "calendar-day"
                    );

                dayButton.type =
                    "button";

                dayButton.dataset.date =
                    cell.dateKey;

                dayButton.setAttribute(
                    "aria-label",
                    calendar.formatDate(
                        cell.date
                    )
                );

                const dayNumber =
                    createElement(
                        "span",
                        "calendar-day-number",
                        String(cell.day)
                    );

                dayButton.appendChild(
                    dayNumber
                );

                const dayEvents =
                    groupedEvents[
                        cell.dateKey
                    ] || [];

                if (dayEvents.length > 0) {

                    dayButton.classList.add(
                        "calendar-day-has-events"
                    );

                    const indicators =
                        createElement(
                            "span",
                            "calendar-event-indicators"
                        );

                    indicators.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                    const uniqueEventTypes =
                        dayEvents.filter(
                            (event, index, events) =>
                                events.findIndex(
                                    comparedEvent =>
                                        comparedEvent.type ===
                                            event.type
                                ) === index
                        ).slice(0, 4);

                    uniqueEventTypes.forEach(
                        event => {

                            const indicator =
                                createElement(
                                    "span",
                                    `calendar-event-indicator calendar-event-indicator-${event.type}`
                                );

                            indicator.style.backgroundColor =
                                getEventColor(event);

                            indicators.appendChild(
                                indicator
                            );

                        }
                    );

                    dayButton.appendChild(
                        indicators
                    );

                    dayButton.setAttribute(
                        "aria-label",
                        `${calendar.formatDate(
                            cell.date
                        )}. ${dayEvents.length} ${
                            dayEvents.length === 1
                                ? "movimiento"
                                : "movimientos"
                        }.`
                    );

                }

                if (cell.isToday) {

                    dayButton.classList.add(
                        "calendar-day-today"
                    );

                }

                if (
                    selectedDate &&
                    calendar.isSameDay(
                        cell.date,
                        selectedDate
                    )
                ) {

                    dayButton.classList.add(
                        "calendar-day-selected"
                    );

                }

                dayButton.addEventListener(
                    "click",
                    () => {

                        selectDate(
                            cell.date
                        );

                    }
                );

                calendarGrid.appendChild(
                    dayButton
                );

            }
        );

        renderSelectedDate();

    }

    function selectDate(date) {

        const calendar =
            getCalendarModule();

        if (!calendar) {

            return;

        }

        const normalizedDate =
            calendar.normalizeDate(date);

        if (!normalizedDate) {

            return;

        }

        selectedDate =
            normalizedDate;

        currentYear =
            normalizedDate.getFullYear();

        currentMonth =
            normalizedDate.getMonth();

        renderCalendar();

    }

    function renderSelectedDate() {

        const calendar =
            getCalendarModule();

        if (
            !calendar ||
            !selectedDateTitle ||
            !selectedDateEvents ||
            !calendarEmptyState
        ) {

            return;

        }

        selectedDateTitle.textContent =
            calendar.formatDate(
                selectedDate
            );

        selectedDateEvents.innerHTML =
            "";

        const events =
            getEventsForSelectedDate();

        if (events.length === 0) {

            calendarEmptyState.hidden =
                false;

            selectedDateEvents.hidden =
                true;

            return;

        }

        calendarEmptyState.hidden =
            true;

        selectedDateEvents.hidden =
            false;

        events.forEach(
            event => {

                selectedDateEvents.appendChild(
                    createEventCard(event)
                );

            }
        );

    }

    function createEventCard(event) {

        const calendar =
            getCalendarModule();

        const card =
            createElement(
                "article",
                `record-card calendar-event-card calendar-event-${event.type}`
            );

        card.style.borderLeft =
            `4px solid ${getEventColor(event)}`;

        const header =
            createElement(
                "div",
                "record-card-header"
            );

        const content =
            createElement("div");

        const category =
            createElement(
                "p",
                "record-category",
                getEventTypeLabel(
                    event.type
                )
            );

        const title =
            createElement(
                "h3",
                "",
                event.title ||
                "Movimiento"
            );

        content.append(
            category,
            title
        );

        const originalAmount =
            Number(
                event.amount
            ) || 0;

        const displayedAmount =
            event.type === "expense"
                ? -Math.abs(originalAmount)
                : originalAmount;

        const amount =
            createElement(
                "strong",
                `record-amount calendar-event-amount calendar-event-amount-${event.type}`,
                calendar.formatCurrency(
                    displayedAmount
                )
            );

        header.append(
            content,
            amount
        );

        card.appendChild(
            header
        );

        if (
            event.type === "paymentPlan"
        ) {

            const status =
                createElement(
                    "p",
                    `secondary-text calendar-payment-plan-status ${
                        event.status === "completed"
                            ? "is-completed"
                            : "is-pending"
                    }`,
                    event.status === "completed"
                        ? "✓ Mensualidad pagada"
                        : "• Mensualidad pendiente"
                );

            card.appendChild(
                status
            );

        }

        if (event.description) {

            const description =
                createElement(
                    "p",
                    "secondary-text",
                    event.description
                );

            card.appendChild(
                description
            );

        }

        return card;

    }

    function getEventTypeLabel(type) {

        const labels = {
            income: "Ingreso",
            expense: "Gasto",
            cardPayment: "Fecha límite de pago",
            cardCut: "Corte de tarjeta",
            paymentPlan: "Plan de pago",
            movement: "Movimiento"
        };

        return (
            labels[type] ||
            "Movimiento"
        );

    }

    function changeMonth(difference) {

        const calendar =
            getCalendarModule();

        if (!calendar) {

            return;

        }

        const movedMonth =
            calendar.moveMonth(
                currentYear,
                currentMonth,
                difference
            );

        currentYear =
            movedMonth.year;

        currentMonth =
            movedMonth.month;

        selectedDate =
            new Date(
                currentYear,
                currentMonth,
                1
            );

        renderCalendar();

    }

    function goToToday() {

        const calendar =
            getCalendarModule();

        if (!calendar) {

            return;

        }

        const today =
            calendar.getToday();

        currentYear =
            today.getFullYear();

        currentMonth =
            today.getMonth();

        selectedDate =
            today;

        renderCalendar();

    }

    function showCalendarView() {

        if (!calendarView) {

            createCalendarView();

        }

        if (!calendarView) {

            return;

        }

        if (
            typeof window.showView !==
            "function"
        ) {

            console.error(
                "El controlador principal de navegación no está disponible."
            );

            return;

        }

        window.showView(
            "calendario",
            "Calendario",
            "Fechas de pagos y movimientos"
        );

        renderCalendar();

    }

    function hideCalendarView() {

        if (!calendarView) {

            return;

        }

        calendarView.classList.remove(
            "active"
        );

        calendarView.hidden =
            true;

    }

    function findCalendarMenuButton() {

        const menuButtons =
            document.querySelectorAll(
                "#view-mas .menu-item"
            );

        return Array.from(
            menuButtons
        ).find(
            button => {

                const buttonText =
                    button.textContent
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim()
                        .toLowerCase();

                return buttonText.includes(
                    "calendario financiero"
                );

            }
        ) || null;

    }

    function connectCalendarMenuButton() {

        const calendarButton =
            findCalendarMenuButton();

        if (!calendarButton) {

            console.warn(
                "No se encontró el botón de Calendario financiero."
            );

            return;

        }

        if (
            calendarButton.dataset
                .calendarConnected ===
            "true"
        ) {

            return;

        }

        calendarButton.dataset
            .calendarConnected =
            "true";

        calendarButton.addEventListener(
            "click",
            showCalendarView
        );

    }

    function connectMainNavigation() {

        document
            .querySelectorAll(
                ".nav-button"
            )
            .forEach(
                button => {

                    if (
                        button.dataset
                            .calendarHideConnected ===
                        "true"
                    ) {

                        return;

                    }

                    button.dataset
                        .calendarHideConnected =
                        "true";

                    button.addEventListener(
                        "click",
                        hideCalendarView
                    );

                }
            );

        document
            .querySelectorAll(
                "[data-navigation]"
            )
            .forEach(
                button => {

                    if (
                        button.dataset
                            .calendarHideConnected ===
                        "true"
                    ) {

                        return;

                    }

                    button.dataset
                        .calendarHideConnected =
                        "true";

                    button.addEventListener(
                        "click",
                        hideCalendarView
                    );

                }
            );

    }

    function initialize() {

        const calendar =
            getCalendarModule();

        if (!calendar) {

            console.error(
                "FinancialCalendar no está disponible."
            );

            return;

        }

        createCalendarView();
        initializeCurrentDate();
        renderCalendar();
        connectCalendarMenuButton();

    }

    return {
        initialize,
        showCalendarView,
        hideCalendarView,
        renderCalendar,
        goToToday,
        getAllEvents
    };

})();

window.FinancialCalendarUI =
    FinancialCalendarUI;

document.addEventListener(
    "DOMContentLoaded",
    () => {

        FinancialCalendarUI.initialize();

    }
);