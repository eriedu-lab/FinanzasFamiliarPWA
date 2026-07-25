"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Administrador de Presupuesto
=====================================
*/

const BudgetManager = {

    storageKey:
        "finanzasFamiliarBudgets",

    data: {
        general: {},
        categories: {}
    },

    initialize() {

        const savedData =
            Storage.load(
                this.storageKey,
                {
                    general: {},
                    categories: {}
                }
            );

        this.data = {
            general:
                savedData &&
                typeof savedData.general ===
                    "object"
                    ? savedData.general
                    : {},

            categories:
                savedData &&
                typeof savedData.categories ===
                    "object"
                    ? savedData.categories
                    : {}
        };

    },

    getMonthKey(
        year,
        month
    ) {

        return (
            String(year) +
            "-" +
            String(month + 1)
                .padStart(2, "0")
        );

    },

    getCurrentMonthKey() {

        const today =
            new Date();

        return this.getMonthKey(
            today.getFullYear(),
            today.getMonth()
        );

    },

    setGeneralBudget(
        monthKey,
        amount
    ) {

        const cleanAmount =
            Number(amount);

        if (
            !monthKey ||
            !Number.isFinite(cleanAmount) ||
            cleanAmount < 0
        ) {

            return {
                success: false,
                message:
                    "Escribe un presupuesto general válido."
            };

        }

        this.data.general[monthKey] =
            cleanAmount;

        this.save();

        return {
            success: true
        };

    },

    setCategoryBudget(
        monthKey,
        category,
        amount
    ) {

        const cleanCategory =
            String(category || "")
                .trim();

        const cleanAmount =
            Number(amount);

        if (!cleanCategory) {

            return {
                success: false,
                message:
                    "Selecciona una categoría."
            };

        }

        if (
            !Number.isFinite(cleanAmount) ||
            cleanAmount < 0
        ) {

            return {
                success: false,
                message:
                    "Escribe una cantidad válida."
            };

        }

        if (
            !this.data.categories[
                monthKey
            ]
        ) {

            this.data.categories[
                monthKey
            ] = {};

        }

        this.data.categories[
            monthKey
        ][cleanCategory] =
            cleanAmount;

        this.save();

        return {
            success: true
        };

    },

    deleteCategoryBudget(
        monthKey,
        category
    ) {

        if (
            !this.data.categories[
                monthKey
            ]
        ) {

            return;

        }

        delete this.data.categories[
            monthKey
        ][category];

        this.save();

    },

    getGeneralBudget(
        monthKey
    ) {

        return Number(
            this.data.general[
                monthKey
            ] || 0
        );

    },

    getCategoryBudgets(
        monthKey
    ) {

        return {
            ...(
                this.data.categories[
                    monthKey
                ] || {}
            )
        };

    },

    getExpensesForMonth(
        monthKey
    ) {

        if (
            typeof ExpenseManager ===
            "undefined"
        ) {

            return [];

        }

        return ExpenseManager
            .getAll()
            .filter(
                expense =>
                    String(
                        expense.date || ""
                    ).slice(0, 7) ===
                    monthKey
            );

    },

    getSpentForMonth(
        monthKey
    ) {

        return this
            .getExpensesForMonth(
                monthKey
            )
            .reduce(
                (
                    total,
                    expense
                ) =>
                    total +
                    Number(
                        expense.amount || 0
                    ),
                0
            );

    },

    getSpentByCategory(
        monthKey,
        category
    ) {

        return this
            .getExpensesForMonth(
                monthKey
            )
            .filter(
                expense =>
                    String(
                        expense.category ||
                        "Otros"
                    ) === category
            )
            .reduce(
                (
                    total,
                    expense
                ) =>
                    total +
                    Number(
                        expense.amount || 0
                    ),
                0
            );

    },

    getSummary(
        monthKey
    ) {

        const budget =
            this.getGeneralBudget(
                monthKey
            );

        const spent =
            this.getSpentForMonth(
                monthKey
            );

        const remaining =
            budget - spent;

        const percentage =
            budget > 0
                ? (
                    spent /
                    budget
                ) * 100
                : 0;

        return {
            budget,
            spent,
            remaining,
            percentage
        };

    },

    getStatus(
        percentage
    ) {

        if (percentage >= 100) {

            return "danger";

        }

        if (percentage >= 80) {

            return "warning";

        }

        return "healthy";

    },

    save() {

        Storage.save(
            this.storageKey,
            this.data
        );

    }

};

BudgetManager.initialize();

window.BudgetManager =
    BudgetManager;
