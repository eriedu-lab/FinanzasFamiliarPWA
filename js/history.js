"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Historial financiero mensual
=====================================
*/

const FinancialHistoryManager = {

    getMonthKey(value) {

        const date =
            value instanceof Date
                ? value
                : new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";

        }

        return [
            date.getFullYear(),
            String(
                date.getMonth() + 1
            ).padStart(2, "0")
        ].join("-");

    },

    getCurrentMonthKey() {

        return this.getMonthKey(
            new Date()
        );

    },

    normalizeMonthKey(
        monthKey
    ) {

        const value =
            String(
                monthKey || ""
            );

        if (
            /^\d{4}-\d{2}$/
                .test(value)
        ) {

            const parts =
                value
                    .split("-")
                    .map(Number);

            if (
                parts[1] >= 1 &&
                parts[1] <= 12
            ) {

                return value;

            }

        }

        return this
            .getCurrentMonthKey();

    },

    shiftMonth(
        monthKey,
        amount
    ) {

        const normalizedMonth =
            this.normalizeMonthKey(
                monthKey
            );

        const parts =
            normalizedMonth
                .split("-")
                .map(Number);

        return this.getMonthKey(
            new Date(
                parts[0],
                parts[1] - 1 +
                    Number(amount || 0),
                1
            )
        );

    },

    getMonthLabel(monthKey) {

        const normalizedMonth =
            this.normalizeMonthKey(
                monthKey
            );

        const parts =
            normalizedMonth
                .split("-")
                .map(Number);

        return new Intl.DateTimeFormat(
            "es-MX",
            {
                month:
                    "long",
                year:
                    "numeric"
            }
        ).format(
            new Date(
                parts[0],
                parts[1] - 1,
                1
            )
        );

    },

    getIncomes(monthKey) {

        return typeof IncomeManager ===
            "undefined"
            ? []
            : IncomeManager
                .getAll()
                .filter(
                    income =>
                        String(
                            income.date || ""
                        ).slice(0, 7) ===
                        monthKey
                );

    },

    getExpenses(monthKey) {

        return typeof ExpenseManager ===
            "undefined"
            ? []
            : ExpenseManager
                .getAll()
                .filter(
                    expense =>
                        String(
                            expense.date || ""
                        ).slice(0, 7) ===
                        monthKey
                );

    },

    getCardTransactions(monthKey) {

        return typeof CardTransactionManager ===
            "undefined"
            ? []
            : CardTransactionManager
                .getByMonth(
                    monthKey
                );

    },

    getScheduledPlans(monthKey) {

        if (
            typeof PaymentPlanManager ===
            "undefined"
        ) {

            return [];

        }

        return PaymentPlanManager
            .getAll()
            .map(
                plan => {

                    const payment =
                        this.getPlanPaymentForMonth(
                            plan,
                            monthKey
                        );

                    return payment > 0
                        ? {
                            ...plan,
                            monthlyPayment:
                                payment
                        }
                        : null;

                }
            )
            .filter(Boolean);

    },

    getPlanPaymentForMonth(
        plan,
        monthKey
    ) {

        const firstDate =
            String(
                plan.firstPaymentDate || ""
            );

        if (!firstDate) {

            return 0;

        }

        const first =
            firstDate
                .slice(0, 7)
                .split("-")
                .map(Number);

        const selected =
            String(monthKey)
                .split("-")
                .map(Number);

        const installmentIndex =
            (
                selected[0] * 12 +
                selected[1] - 1
            ) -
            (
                first[0] * 12 +
                first[1] - 1
            );

        const totalInstallments =
            Number(
                plan.totalInstallments
            ) || 0;

        if (
            installmentIndex < 0 ||
            installmentIndex >=
                totalInstallments
        ) {

            return 0;

        }

        return PaymentPlanManager
            .getMonthlyPayment(plan);

    },

    getSummary(monthKey) {

        monthKey =
            this.normalizeMonthKey(
                monthKey
            );

        const incomes =
            this.getIncomes(
                monthKey
            );

        const expenses =
            this.getExpenses(
                monthKey
            );

        const cardTransactions =
            this.getCardTransactions(
                monthKey
            );

        const plans =
            this.getScheduledPlans(
                monthKey
            );

        const incomeTotal =
            this.sum(
                incomes,
                "amount"
            );

        const directExpenseTotal =
            this.sum(
                expenses,
                "amount"
            );

        const cardSpendingTotal =
            cardTransactions.reduce(
                (
                    total,
                    transaction
                ) => {

                    return total +
                        CardTransactionManager
                            .getHistoryImpact(
                                transaction
                            );

                },
                0
            );

        const expenseTotal =
            directExpenseTotal +
            cardSpendingTotal;

        const planTotal =
            this.sum(
                plans,
                "monthlyPayment"
            );

        return {
            monthKey,
            label:
                this.getMonthLabel(
                    monthKey
                ),
            incomes,
            expenses,
            cardTransactions,
            plans,
            incomeTotal,
            directExpenseTotal,
            cardSpendingTotal,
            expenseTotal,
            planTotal,
            balance:
                incomeTotal -
                expenseTotal -
                planTotal,
            categories:
                this.getExpenseCategories(
                    expenses,
                    cardTransactions
                ),
            movements:
                this.getMovements(
                    incomes,
                    expenses,
                    cardTransactions,
                    plans,
                    monthKey
                )
        };

    },

    getComparison(monthKey) {

        const current =
            this.getSummary(
                monthKey
            );

        const previous =
            this.getSummary(
                this.shiftMonth(
                    monthKey,
                    -1
                )
            );

        return {
            current,
            previous,
            income:
                this.getDifference(
                    current.incomeTotal,
                    previous.incomeTotal
                ),
            expenses:
                this.getDifference(
                    current.expenseTotal,
                    previous.expenseTotal
                ),
            plans:
                this.getDifference(
                    current.planTotal,
                    previous.planTotal
                ),
            balance:
                this.getDifference(
                    current.balance,
                    previous.balance
                )
        };

    },

    getDifference(
        current,
        previous
    ) {

        const amount =
            Number(current) -
            Number(previous);

        return {
            amount,
            percentage:
                Number(previous) !== 0
                    ? (
                        amount /
                        Math.abs(
                            Number(previous)
                        )
                    ) * 100
                    : null
        };

    },

    getExpenseCategories(
        expenses,
        cardTransactions
    ) {

        const categoryMap = {};

        expenses.forEach(
            expense => {

                const category =
                    String(
                        expense.category ||
                        "Otros"
                    );

                categoryMap[category] =
                    (
                        categoryMap[
                            category
                        ] || 0
                    ) +
                    Number(
                        expense.amount || 0
                    );

            }
        );

        cardTransactions.forEach(
            transaction => {

                const impact =
                    CardTransactionManager
                        .getHistoryImpact(
                            transaction
                        );

                if (impact === 0) {

                    return;

                }

                categoryMap[
                    "Tarjetas"
                ] =
                    (
                        categoryMap[
                            "Tarjetas"
                        ] || 0
                    ) +
                    impact;

            }
        );

        const positiveEntries =
            Object.entries(
                categoryMap
            )
            .filter(
                (
                    [
                        ,
                        amount
                    ]
                ) =>
                    amount > 0
            );

        const total =
            positiveEntries.reduce(
                (
                    sum,
                    [
                        ,
                        amount
                    ]
                ) =>
                    sum +
                    amount,
                0
            );

        return positiveEntries
            .map(
                (
                    [
                        category,
                        amount
                    ]
                ) => ({
                    category,
                    amount,
                    percentage:
                        total > 0
                            ? (
                                amount /
                                total
                            ) * 100
                            : 0
                })
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    second.amount -
                    first.amount
            );

    },

    getMovements(
        incomes,
        expenses,
        cardTransactions,
        plans,
        monthKey
    ) {

        const incomeItems =
            incomes.map(
                income => ({
                    id:
                        income.id,
                    kind:
                        "Ingreso",
                    name:
                        income.name,
                    category:
                        income.category ||
                        "Otros",
                    amount:
                        Number(
                            income.amount
                        ) || 0,
                    date:
                        income.date,
                    sign:
                        1
                })
            );

        const expenseItems =
            expenses.map(
                expense => ({
                    id:
                        expense.id,
                    kind:
                        "Gasto",
                    name:
                        expense.name,
                    category:
                        expense.category ||
                        "Otros",
                    amount:
                        Number(
                            expense.amount
                        ) || 0,
                    date:
                        expense.date,
                    sign:
                        -1
                })
            );

        const cardItems =
            cardTransactions.map(
                transaction => {

                    const impact =
                        CardTransactionManager
                            .getHistoryImpact(
                                transaction
                            );

                    const card =
                        typeof CardManager !==
                        "undefined"
                            ? CardManager
                                .getById(
                                    transaction.cardId
                                )
                            : null;

                    return {
                        id:
                            transaction.id,
                        kind:
                            CardTransactionManager
                                .getTypeLabel(
                                    transaction.type
                                ),
                        name:
                            transaction.description,
                        category:
                            card
                                ? card.name
                                : "Tarjeta",
                        amount:
                            Number(
                                transaction.amount
                            ) || 0,
                        date:
                            transaction.date,
                        sign:
                            impact > 0
                                ? -1
                                : (
                                    impact < 0
                                        ? 1
                                        : 0
                                )
                    };

                }
            );

        const planItems =
            plans.map(
                plan => ({
                    id:
                        plan.id,
                    kind:
                        "Plan programado",
                    name:
                        plan.description,
                    category:
                        plan.cardName ||
                        "Mensualidad",
                    amount:
                        Number(
                            plan.monthlyPayment
                        ) || 0,
                    date:
                        `${monthKey}-01`,
                    sign:
                        -1
                })
            );

        return [
            ...incomeItems,
            ...expenseItems,
            ...cardItems,
            ...planItems
        ].sort(
            (
                first,
                second
            ) =>
                String(
                    second.date
                ).localeCompare(
                    String(
                        first.date
                    )
                )
        );

    },

    sum(
        items,
        property
    ) {

        return items.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item[property] || 0
                ),
            0
        );

    }

};

window.FinancialHistoryManager =
    FinancialHistoryManager;
