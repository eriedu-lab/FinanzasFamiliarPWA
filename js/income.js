"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Income Manager
=====================================
*/

const IncomeManager = {

    incomes: [],

    initialize() {

        let savedIncomes =
            Storage.load(
                StorageKeys.INCOMES
            );

        /*
            Migración de versiones anteriores:
            antes se utilizaba StorageKeys.incomes,
            que generaba la clave "undefined".
        */
        if (
            !Array.isArray(savedIncomes) ||
            savedIncomes.length === 0
        ) {

            const legacyIncomes =
                Storage.load(
                    "undefined"
                );

            if (
                Array.isArray(
                    legacyIncomes
                ) &&
                legacyIncomes.length > 0
            ) {

                savedIncomes =
                    legacyIncomes;

                Storage.save(
                    StorageKeys.INCOMES,
                    legacyIncomes
                );

            }

        }

        this.incomes =
            Array.isArray(savedIncomes)
                ? savedIncomes
                : [];

    },

    createIncome(
        name,
        amount,
        date,
        category
    ) {

        const parsedAmount =
            Number(amount);

        if (
            !name ||
            !Number.isFinite(parsedAmount) ||
            parsedAmount <= 0
        ) {

            return {
                success: false,
                message:
                    "Escribe un nombre y una cantidad válida."
            };

        }

        const income = {

            id:
                Date.now().toString() +
                Math.random()
                    .toString(16)
                    .slice(2),

            name:
                name.trim(),

            amount:
                parsedAmount,

            date:
                date ||
                new Date()
                    .toISOString()
                    .slice(0, 10),

            category:
                category ||
                "Otros",

            createdAt:
                new Date()
                    .toISOString()

        };

        this.incomes.push(
            income
        );

        this.save();

        return {
            success: true,
            income: income
        };

    },

    deleteIncome(
        incomeId
    ) {

        const previousLength =
            this.incomes.length;

        this.incomes =
            this.incomes.filter(
                function (income) {

                    return income.id !== incomeId;

                }
            );

        if (
            this.incomes.length ===
            previousLength
        ) {

            return false;

        }

        this.save();

        return true;

    },

    updateIncome(
        incomeId,
        changes
    ) {

        const income =
            this.incomes.find(
                function (item) {

                    return item.id === incomeId;

                }
            );

        if (!income) {

            return {
                success: false,
                message:
                    "No se encontró el ingreso."
            };

        }

        if (
            changes.name !== undefined
        ) {

            const updatedName =
                String(
                    changes.name
                ).trim();

            if (!updatedName) {

                return {
                    success: false,
                    message:
                        "El nombre no puede estar vacío."
                };

            }

            income.name =
                updatedName;

        }

        if (
            changes.amount !== undefined
        ) {

            const updatedAmount =
                Number(
                    changes.amount
                );

            if (
                !Number.isFinite(
                    updatedAmount
                ) ||
                updatedAmount <= 0
            ) {

                return {
                    success: false,
                    message:
                        "La cantidad no es válida."
                };

            }

            income.amount =
                updatedAmount;

        }

        if (
            changes.date !== undefined
        ) {

            income.date =
                changes.date;

        }

        if (
            changes.category !== undefined
        ) {

            income.category =
                changes.category;

        }

        this.save();

        return {
            success: true,
            income: income
        };

    },

    getAll() {

        return [
            ...this.incomes
        ].sort(
            function (
                firstIncome,
                secondIncome
            ) {

                return (
                    new Date(
                        secondIncome.date
                    ) -
                    new Date(
                        firstIncome.date
                    )
                );

            }
        );

    },

    getTotal() {

        return this.incomes.reduce(
            function (
                total,
                income
            ) {

                return (
                    total +
                    Number(
                        income.amount
                    )
                );

            },
            0
        );

    },

    save() {

        Storage.save(
            StorageKeys.INCOMES,
            this.incomes
        );

    }

};

IncomeManager.initialize();
