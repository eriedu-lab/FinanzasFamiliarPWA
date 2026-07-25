"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Motor de estadísticas
=====================================
*/

const StatisticsManager = {

    currentMonthKey() {

        const now = new Date();

        return [
            now.getFullYear(),
            String(
                now.getMonth() + 1
            ).padStart(2, "0")
        ].join("-");

    },

    shiftMonth(
        monthKey,
        amount
    ) {

        const parts =
            String(monthKey)
                .split("-")
                .map(Number);

        const date =
            new Date(
                parts[0],
                parts[1] - 1 +
                    Number(amount || 0),
                1
            );

        return [
            date.getFullYear(),
            String(
                date.getMonth() + 1
            ).padStart(2, "0")
        ].join("-");

    },

    monthLabel(monthKey) {

        const parts =
            String(monthKey)
                .split("-")
                .map(Number);

        return new Intl.DateTimeFormat(
            "es-MX",
            {
                month: "short",
                year: "2-digit"
            }
        ).format(
            new Date(
                parts[0],
                parts[1] - 1,
                1
            )
        );

    },

    allIncomes() {

        return typeof IncomeManager !==
            "undefined"
            ? IncomeManager.getAll()
            : [];

    },

    allExpenses() {

        return typeof ExpenseManager !==
            "undefined"
            ? ExpenseManager.getAll()
            : [];

    },

    allCards() {

        return typeof CardManager !==
            "undefined"
            ? CardManager.getAll()
            : [];

    },

    allCardTransactions() {

        return typeof CardTransactionManager !==
            "undefined"
            ? CardTransactionManager.getAll()
            : [];

    },

    monthlyData(monthKey) {

        const incomes =
            this.allIncomes()
                .filter(
                    item =>
                        String(
                            item.date || ""
                        ).slice(0, 7) ===
                        monthKey
                );

        const expenses =
            this.allExpenses()
                .filter(
                    item =>
                        String(
                            item.date || ""
                        ).slice(0, 7) ===
                        monthKey
                );

        const cardTransactions =
            this.allCardTransactions()
                .filter(
                    item =>
                        String(
                            item.date || ""
                        ).slice(0, 7) ===
                        monthKey
                );

        const incomeTotal =
            this.sum(
                incomes,
                "amount"
            );

        const directExpenses =
            this.sum(
                expenses,
                "amount"
            );

        const cardExpenses =
            cardTransactions.reduce(
                (
                    total,
                    item
                ) => {

                    if (
                        typeof CardTransactionManager ===
                        "undefined"
                    ) {

                        return total;

                    }

                    return total +
                        CardTransactionManager
                            .getHistoryImpact(
                                item
                            );

                },
                0
            );

        const expenseTotal =
            directExpenses +
            cardExpenses;

        return {
            monthKey,
            incomes,
            expenses,
            cardTransactions,
            incomeTotal,
            expenseTotal,
            balance:
                incomeTotal -
                expenseTotal
        };

    },

    lastMonths(count = 12) {

        const current =
            this.currentMonthKey();

        const result = [];

        for (
            let index =
                count - 1;
            index >= 0;
            index -= 1
        ) {

            const monthKey =
                this.shiftMonth(
                    current,
                    -index
                );

            result.push(
                {
                    ...this.monthlyData(
                        monthKey
                    ),
                    label:
                        this.monthLabel(
                            monthKey
                        )
                }
            );

        }

        return result;

    },

    categoryTotals(monthKey) {

        const month =
            this.monthlyData(
                monthKey
            );

        const totals = {};

        month.expenses.forEach(
            expense => {

                const category =
                    String(
                        expense.category ||
                        "Otros"
                    );

                totals[category] =
                    (
                        totals[category] ||
                        0
                    ) +
                    Number(
                        expense.amount || 0
                    );

            }
        );

        month.cardTransactions.forEach(
            transaction => {

                if (
                    typeof CardTransactionManager ===
                    "undefined"
                ) {

                    return;

                }

                const impact =
                    CardTransactionManager
                        .getHistoryImpact(
                            transaction
                        );

                if (impact > 0) {

                    totals.Tarjetas =
                        (
                            totals.Tarjetas ||
                            0
                        ) +
                        impact;

                }

            }
        );

        return Object.entries(
            totals
        )
        .map(
            (
                [
                    name,
                    amount
                ]
            ) => ({
                name,
                amount
            })
        )
        .filter(
            item =>
                item.amount > 0
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

    cardUsage() {

        return this.allCards()
            .map(
                card => {

                    const limit =
                        Number(
                            card.limit || 0
                        );

                    const used =
                        Number(
                            card.used || 0
                        );

                    return {
                        id:
                            card.id,
                        name:
                            card.name,
                        bank:
                            card.bank,
                        limit,
                        used,
                        available:
                            Math.max(
                                limit - used,
                                0
                            ),
                        percentage:
                            limit > 0
                                ? (
                                    used /
                                    limit
                                ) * 100
                                : 0
                    };

                }
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    second.percentage -
                    first.percentage
            );

    },

    topExpenses(limit = 10) {

        const direct =
            this.allExpenses()
                .map(
                    item => ({
                        id:
                            item.id,
                        name:
                            item.name ||
                            "Gasto",
                        category:
                            item.category ||
                            "Otros",
                        date:
                            item.date,
                        amount:
                            Number(
                                item.amount || 0
                            )
                    })
                );

        const card =
            this.allCardTransactions()
                .filter(
                    item => {

                        if (
                            typeof CardTransactionManager ===
                            "undefined"
                        ) {

                            return false;

                        }

                        return CardTransactionManager
                            .getHistoryImpact(
                                item
                            ) > 0;

                    }
                )
                .map(
                    item => {

                        const foundCard =
                            typeof CardManager !==
                            "undefined"
                                ? CardManager
                                    .getById(
                                        item.cardId
                                    )
                                : null;

                        return {
                            id:
                                item.id,
                            name:
                                item.description ||
                                "Compra con tarjeta",
                            category:
                                foundCard
                                    ? foundCard.name
                                    : "Tarjeta",
                            date:
                                item.date,
                            amount:
                                Number(
                                    item.amount || 0
                                )
                        };

                    }
                );

        return [
            ...direct,
            ...card
        ]
        .sort(
            (
                first,
                second
            ) =>
                second.amount -
                first.amount
        )
        .slice(
            0,
            limit
        );

    },

    insights() {

        const months =
            this.lastMonths(12);

        const current =
            months[
                months.length - 1
            ];

        const categories =
            this.categoryTotals(
                current.monthKey
            );

        const cards =
            this.cardUsage();

        const highestExpenseMonth =
            [
                ...months
            ].sort(
                (
                    first,
                    second
                ) =>
                    second.expenseTotal -
                    first.expenseTotal
            )[0];

        const highestIncomeMonth =
            [
                ...months
            ].sort(
                (
                    first,
                    second
                ) =>
                    second.incomeTotal -
                    first.incomeTotal
            )[0];

        const recent =
            months.slice(-3);

        const previous =
            months.slice(-6, -3);

        const recentBalance =
            this.average(
                recent.map(
                    item =>
                        item.balance
                )
            );

        const previousBalance =
            this.average(
                previous.map(
                    item =>
                        item.balance
                )
            );

        const trend =
            recentBalance >
                previousBalance
                ? "mejorando"
                : recentBalance <
                    previousBalance
                    ? "bajando"
                    : "estable";

        return {
            topCategory:
                categories[0] ||
                null,
            mostUsedCard:
                cards[0] ||
                null,
            highestExpenseMonth,
            highestIncomeMonth,
            trend,
            recentBalance,
            previousBalance
        };

    },

    dashboard() {

        const months =
            this.lastMonths(12);

        const current =
            months[
                months.length - 1
            ];

        const savingsRate =
            current.incomeTotal > 0
                ? (
                    current.balance /
                    current.incomeTotal
                ) * 100
                : 0;

        return {
            current,
            months,
            savingsRate,
            averageBalance:
                this.average(
                    months.map(
                        item =>
                            item.balance
                    )
                ),
            categories:
                this.categoryTotals(
                    current.monthKey
                ),
            cards:
                this.cardUsage(),
            topExpenses:
                this.topExpenses(10),
            insights:
                this.insights()
        };

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

    },

    average(values) {

        if (!values.length) {

            return 0;

        }

        return values.reduce(
            (
                total,
                value
            ) =>
                total +
                Number(value || 0),
            0
        ) /
        values.length;

    }

};

window.StatisticsManager =
    StatisticsManager;
