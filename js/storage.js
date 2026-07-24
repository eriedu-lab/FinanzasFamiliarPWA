"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Storage Manager
=====================================
*/

const StorageKeys = {

    INCOMES: "ff_incomes",

    EXPENSES: "ff_expenses",

    cards: "ff_cards",

    commitments: "ff_commitments",

    goals: "ff_goals",

    history: "ff_history",

    settings: "ff_settings"

};

const Storage = {

    load(key) {

        try {

            const data = localStorage.getItem(key);

            if (!data) {

                return [];

            }

            return JSON.parse(data);

        }

        catch {

            return [];

        }

    },

    save(key, value) {

        localStorage.setItem(

            key,

            JSON.stringify(value)

        );

    },

    clear() {

        Object.values(StorageKeys)

            .forEach(

                key =>

                localStorage.removeItem(key)

            );

    }

};