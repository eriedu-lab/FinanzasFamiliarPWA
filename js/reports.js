"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Centro Premium - Motor de datos
=====================================
*/

const PremiumReports = {

    getAllRecords() {

        const records = [];

        if (
            typeof IncomeManager !==
            "undefined"
        ) {

            IncomeManager.getAll()
                .forEach(
                    income => {

                        records.push(
                            {
                                id:
                                    String(
                                        income.id
                                    ),

                                type:
                                    "income",

                                typeLabel:
                                    "Ingreso",

                                name:
                                    String(
                                        income.name ||
                                        "Ingreso"
                                    ),

                                category:
                                    String(
                                        income.category ||
                                        "Otros"
                                    ),

                                amount:
                                    Number(
                                        income.amount || 0
                                    ),

                                date:
                                    String(
                                        income.date || ""
                                    ),

                                detail:
                                    String(
                                        income.category ||
                                        "Otros"
                                    )
                            }
                        );

                    }
                );

        }

        if (
            typeof ExpenseManager !==
            "undefined"
        ) {

            ExpenseManager.getAll()
                .forEach(
                    expense => {

                        records.push(
                            {
                                id:
                                    String(
                                        expense.id
                                    ),

                                type:
                                    "expense",

                                typeLabel:
                                    "Gasto",

                                name:
                                    String(
                                        expense.name ||
                                        "Gasto"
                                    ),

                                category:
                                    String(
                                        expense.category ||
                                        "Otros"
                                    ),

                                amount:
                                    Number(
                                        expense.amount || 0
                                    ),

                                date:
                                    String(
                                        expense.date || ""
                                    ),

                                detail:
                                    String(
                                        expense.type ||
                                        expense.category ||
                                        "Gasto"
                                    )
                            }
                        );

                    }
                );

        }

        if (
            typeof CardTransactionManager !==
            "undefined"
        ) {

            CardTransactionManager.getAll()
                .forEach(
                    transaction => {

                        const card =
                            typeof CardManager !==
                            "undefined"
                                ? CardManager.getById(
                                    transaction.cardId
                                )
                                : null;

                        const transactionType =
                            String(
                                transaction.type || ""
                            );

                        const isPayment =
                            transactionType ===
                            "payment";

                        records.push(
                            {
                                id:
                                    String(
                                        transaction.id
                                    ),

                                type:
                                    "card",

                                typeLabel:
                                    isPayment
                                        ? "Pago de tarjeta"
                                        : "Movimiento de tarjeta",

                                name:
                                    String(
                                        transaction.description ||
                                        card?.name ||
                                        "Tarjeta"
                                    ),

                                category:
                                    isPayment
                                        ? "Pago de tarjeta"
                                        : "Tarjeta",

                                amount:
                                    Number(
                                        transaction.amount || 0
                                    ),

                                date:
                                    String(
                                        transaction.date || ""
                                    ),

                                detail:
                                    [
                                        card?.name,
                                        card?.bank,
                                        transactionType
                                    ]
                                    .filter(Boolean)
                                    .join(" · ")
                            }
                        );

                    }
                );

        }

        if (
            typeof PaymentPlanManager !==
            "undefined"
        ) {

            PaymentPlanManager.getAll()
                .forEach(
                    plan => {

                        const totalInstallments =
                            Math.max(
                                Number(
                                    plan.totalInstallments || 1
                                ),
                                1
                            );

                        const monthlyAmount =
                            Number(
                                plan.totalAmount || 0
                            ) /
                            totalInstallments;

                        records.push(
                            {
                                id:
                                    String(
                                        plan.id
                                    ),

                                type:
                                    "plan",

                                typeLabel:
                                    "Plan de pago",

                                name:
                                    String(
                                        plan.description ||
                                        "Plan de pago"
                                    ),

                                category:
                                    "Plan de pago",

                                amount:
                                    monthlyAmount,

                                date:
                                    String(
                                        plan.firstPaymentDate ||
                                        plan.purchaseDate ||
                                        ""
                                    ),

                                detail:
                                    [
                                        plan.cardName,
                                        `${plan.paidInstallments || 0}/${totalInstallments} mensualidades`
                                    ]
                                    .filter(Boolean)
                                    .join(" · ")
                            }
                        );

                    }
                );

        }

        return records.sort(
            (
                first,
                second
            ) =>
                String(
                    second.date || ""
                ).localeCompare(
                    String(
                        first.date || ""
                    )
                )
        );

    },

    getAvailableYears(records) {

        const years =
            records
                .map(
                    record =>
                        String(
                            record.date || ""
                        ).slice(
                            0,
                            4
                        )
                )
                .filter(
                    year =>
                        /^\d{4}$/.test(
                            year
                        )
                );

        years.push(
            String(
                new Date().getFullYear()
            )
        );

        return [
            ...new Set(years)
        ].sort(
            (
                first,
                second
            ) =>
                Number(second) -
                Number(first)
        );

    },

    getCategories(records) {

        return [
            ...new Set(
                records
                    .map(
                        record =>
                            String(
                                record.category ||
                                "Otros"
                            )
                    )
                    .filter(Boolean)
            )
        ].sort(
            (
                first,
                second
            ) =>
                first.localeCompare(
                    second,
                    "es"
                )
        );

    },

    filter(records, filters) {

        const search =
            this.normalize(
                filters.search
            );

        const minimum =
            Number(
                filters.minimum
            );

        const maximum =
            Number(
                filters.maximum
            );

        return records.filter(
            record => {

                if (
                    filters.periodType ===
                    "month" &&
                    String(
                        record.date || ""
                    ).slice(0, 7) !==
                    filters.month
                ) {

                    return false;

                }

                if (
                    filters.periodType ===
                    "year" &&
                    String(
                        record.date || ""
                    ).slice(0, 4) !==
                    filters.year
                ) {

                    return false;

                }

                if (
                    filters.type !==
                    "all" &&
                    record.type !==
                    filters.type
                ) {

                    return false;

                }

                if (
                    filters.category !==
                    "all" &&
                    record.category !==
                    filters.category
                ) {

                    return false;

                }

                if (
                    Number.isFinite(minimum) &&
                    minimum > 0 &&
                    record.amount <
                    minimum
                ) {

                    return false;

                }

                if (
                    Number.isFinite(maximum) &&
                    maximum > 0 &&
                    record.amount >
                    maximum
                ) {

                    return false;

                }

                if (search) {

                    const haystack =
                        this.normalize(
                            [
                                record.name,
                                record.category,
                                record.typeLabel,
                                record.detail,
                                record.amount,
                                record.date
                            ].join(" ")
                        );

                    if (
                        !haystack.includes(
                            search
                        )
                    ) {

                        return false;

                    }

                }

                return true;

            }
        );

    },

    summarize(records) {

        let income = 0;
        let expense = 0;
        let commitments = 0;

        records.forEach(
            record => {

                if (
                    record.type ===
                    "income"
                ) {

                    income +=
                        record.amount;

                } else if (
                    record.type ===
                    "expense"
                ) {

                    expense +=
                        record.amount;

                } else {

                    commitments +=
                        record.amount;

                }

            }
        );

        const expensesOnly =
            records.filter(
                record =>
                    record.type ===
                    "expense"
            );

        const largestExpense =
            expensesOnly
                .slice()
                .sort(
                    (
                        first,
                        second
                    ) =>
                        second.amount -
                        first.amount
                )[0] || null;

        const categoryTotals = {};

        expensesOnly.forEach(
            record => {

                categoryTotals[
                    record.category
                ] =
                    (
                        categoryTotals[
                            record.category
                        ] || 0
                    ) +
                    record.amount;

            }
        );

        const topCategory =
            Object.entries(
                categoryTotals
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    second[1] -
                    first[1]
            )[0] || null;

        return {
            income,
            expense,
            commitments,
            balance:
                income -
                expense -
                commitments,
            count:
                records.length,
            largestExpense,
            topCategory
        };

    },

    toCsv(records) {

        const rows = [
            [
                "Fecha",
                "Tipo",
                "Nombre",
                "Categoría",
                "Detalle",
                "Monto"
            ]
        ];

        records.forEach(
            record => {

                rows.push(
                    [
                        record.date,
                        record.typeLabel,
                        record.name,
                        record.category,
                        record.detail,
                        record.amount.toFixed(2)
                    ]
                );

            }
        );

        return rows
            .map(
                row =>
                    row
                        .map(
                            value =>
                                `"${String(
                                    value ?? ""
                                ).replace(
                                    /"/g,
                                    '""'
                                )}"`
                        )
                        .join(",")
            )
            .join("\n");

    },

    summaryToCsv(summary, periodLabel) {

        const rows = [
            ["Reporte financiero", periodLabel],
            [],
            ["Concepto", "Monto"],
            ["Ingresos", summary.income.toFixed(2)],
            ["Gastos", summary.expense.toFixed(2)],
            ["Tarjetas y planes", summary.commitments.toFixed(2)],
            ["Balance", summary.balance.toFixed(2)],
            [],
            ["Movimientos encontrados", summary.count]
        ];

        if (summary.largestExpense) {
            rows.push(
                [
                    "Mayor gasto",
                    `${summary.largestExpense.name} - ${summary.largestExpense.amount.toFixed(2)}`
                ]
            );
        }

        if (summary.topCategory) {
            rows.push(
                [
                    "Categoría principal",
                    `${summary.topCategory[0]} - ${Number(summary.topCategory[1]).toFixed(2)}`
                ]
            );
        }

        return rows
            .map(
                row =>
                    row
                        .map(
                            value =>
                                `"${String(
                                    value ?? ""
                                ).replace(
                                    /"/g,
                                    '""'
                                )}"`
                        )
                        .join(",")
            )
            .join("\n");

    },

    normalize(value) {

        return String(
            value ?? ""
        )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();

    }

};

window.PremiumReports =
    PremiumReports;
