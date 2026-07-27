"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Administrador de Gastos
=====================================
*/

const ExpenseManager = {

    expenses: [],

    initialize() {

        const savedExpenses =
            Storage.load(
                StorageKeys.EXPENSES,
                []
            );

        this.expenses =
            Array.isArray(savedExpenses)
                ? savedExpenses
                : [];

    },

    createExpense(
        name,
        amount,
        date,
        category,
        type,
        recurring = {}
    ) {

        const cleanName =
            String(name || "").trim();

        const cleanAmount =
            Number(amount);

        const cleanDate =
            String(date || "").trim();

        const cleanCategory =
            String(category || "Otros").trim();

        const cleanType =
            String(type || "Variable").trim();

        if (!cleanName) {

            return {
                success: false,
                message:
                    "Escribe el nombre del gasto."
            };

        }

        if (
            !Number.isFinite(cleanAmount) ||
            cleanAmount <= 0
        ) {

            return {
                success: false,
                message:
                    "Escribe una cantidad válida."
            };

        }

        if (!cleanDate) {

            return {
                success: false,
                message:
                    "Selecciona la fecha del gasto."
            };

        }

        const expense = {

            id:
                crypto.randomUUID
                    ? crypto.randomUUID()
                    : String(Date.now()),

            name:
                cleanName,

            amount:
                cleanAmount,

            date:
                cleanDate,

            category:
                cleanCategory,

            type:
                cleanType,

            startDate:
                cleanType === "Fijo"
                    ? String(recurring.startDate || cleanDate)
                    : "",

            hasEndDate:
                cleanType === "Fijo"
                    ? Boolean(recurring.hasEndDate)
                    : false,

            endDate:
                cleanType === "Fijo" && recurring.hasEndDate
                    ? String(recurring.endDate || "")
                    : "",

            createdAt:
                new Date().toISOString()

        };

        this.expenses.push(
            expense
        );

        this.save();

        return {
            success: true,
            expense
        };

    },

    updateExpense(
        expenseId,
        values
    ) {

        const expense =
            this.expenses.find(
                item =>
                    item.id === expenseId
            );

        if (!expense) {

            return {
                success: false,
                message:
                    "No se encontró el gasto."
            };

        }

        const cleanName =
            String(
                values.name || ""
            ).trim();

        const cleanAmount =
            Number(
                values.amount
            );

        const cleanDate =
            String(
                values.date || ""
            ).trim();

        const cleanCategory =
            String(
                values.category || "Otros"
            ).trim();

        const cleanType =
            String(
                values.type || "Variable"
            ).trim();

        if (!cleanName) {

            return {
                success: false,
                message:
                    "Escribe el nombre del gasto."
            };

        }

        if (
            !Number.isFinite(cleanAmount) ||
            cleanAmount <= 0
        ) {

            return {
                success: false,
                message:
                    "Escribe una cantidad válida."
            };

        }

        if (!cleanDate) {

            return {
                success: false,
                message:
                    "Selecciona la fecha del gasto."
            };

        }

        expense.name =
            cleanName;

        expense.amount =
            cleanAmount;

        expense.date =
            cleanDate;

        expense.category =
            cleanCategory;

        expense.type =
            cleanType;

        expense.startDate = cleanType === "Fijo"
            ? String(values.startDate || cleanDate)
            : "";
        expense.hasEndDate = cleanType === "Fijo"
            ? Boolean(values.hasEndDate)
            : false;
        expense.endDate = cleanType === "Fijo" && values.hasEndDate
            ? String(values.endDate || "")
            : "";

        this.save();

        return {
            success: true,
            expense
        };

    },

    deleteExpense(
        expenseId
    ) {

        const previousLength =
            this.expenses.length;

        this.expenses =
            this.expenses.filter(
                item =>
                    item.id !== expenseId
            );

        if (
            this.expenses.length ===
            previousLength
        ) {

            return {
                success: false,
                message:
                    "No se encontró el gasto."
            };

        }

        this.save();

        return {
            success: true
        };

    },

    getAll() {

        return [
            ...this.expenses
        ].sort(
            function (
                firstExpense,
                secondExpense
            ) {

                return new Date(
                    secondExpense.date
                ) - new Date(
                    firstExpense.date
                );

            }
        );

    },

    getTotal() {

        return this.expenses.reduce(
            function (
                total,
                expense
            ) {

                return total +
                    Number(
                        expense.amount || 0
                    );

            },
            0
        );

    },

    isActiveInMonth(expense, monthKey) {
        const key = String(monthKey || "").slice(0, 7);
        if (!key) return false;
        if (String(expense.type || "") !== "Fijo") {
            return String(expense.date || "").slice(0, 7) === key;
        }
        const start = String(expense.startDate || expense.date || "").slice(0, 7);
        const end = expense.hasEndDate ? String(expense.endDate || "").slice(0, 7) : "";
        return (!start || key >= start) && (!end || key <= end);
    },

    getByMonth(monthKey) {
        return this.expenses.filter(expense => this.isActiveInMonth(expense, monthKey));
    },

    getTotalByMonth(monthKey) {
        return this.getByMonth(monthKey).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    },

    save() {

        Storage.save(
            StorageKeys.EXPENSES,
            this.expenses
        );

    }

};

ExpenseManager.initialize();