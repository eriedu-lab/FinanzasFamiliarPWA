"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Administrador de Tarjetas
=====================================
*/

const CardManager = {

    cards: [],

    initialize() {

        this.cards =
            Storage.load(StorageKeys.cards);

        if (!Array.isArray(this.cards)) {

            this.cards = [];

        }

    },

    save() {

        Storage.save(
            StorageKeys.cards,
            this.cards
        );

    },

    getAll() {

        return [...this.cards];

    },

    getById(id) {

        return this.cards.find(
            card => card.id === id
        );

    },

    createCard(data) {

        const validation =
            this.validateCard(data);

        if (!validation.success) {

            return validation;

        }

        const card = {

            id:
                crypto.randomUUID(),

            name:
                data.name.trim(),

            bank:
                data.bank.trim(),

            limit:
                Number(data.limit),

            used:
                Number(data.used),

            cutDay:
                Number(data.cutDay),

            dueDay:
                Number(data.dueDay),

            color:
                data.color || "#2563eb"

        };

        this.cards.push(card);

        this.save();

        return {

            success: true,

            card

        };

    },

    updateCard(id, data) {

        const validation =
            this.validateCard(data);

        if (!validation.success) {

            return validation;

        }

        const cardIndex =
            this.cards.findIndex(
                card => card.id === id
            );

        if (cardIndex === -1) {

            return {

                success: false,

                message:
                    "No se encontró la tarjeta."

            };

        }

        this.cards[cardIndex] = {

            ...this.cards[cardIndex],

            name:
                data.name.trim(),

            bank:
                data.bank.trim(),

            limit:
                Number(data.limit),

            used:
                Number(data.used),

            cutDay:
                Number(data.cutDay),

            dueDay:
                Number(data.dueDay),

            color:
                data.color || "#2563eb"

        };

        this.save();

        return {

            success: true,

            card:
                this.cards[cardIndex]

        };

    },

    deleteCard(id) {

        this.cards =
            this.cards.filter(
                card =>
                    card.id !== id
            );

        this.save();

        return {

            success: true

        };

    },

    getTotalLimit() {

        return this.cards.reduce(

            (sum, card) =>

                sum +
                Number(card.limit || 0),

            0

        );

    },

    getTotalUsed() {

        return this.cards.reduce(

            (sum, card) =>

                sum +
                Number(card.used || 0),

            0

        );

    },

    getTotalAvailable() {

        return (
            this.getTotalLimit() -
            this.getTotalUsed()
        );

    },

    validateCard(data) {

        const name =
            String(data.name || "").trim();

        const bank =
            String(data.bank || "").trim();

        const limit =
            Number(data.limit);

        const used =
            Number(data.used);

        const cutDay =
            Number(data.cutDay);

        const dueDay =
            Number(data.dueDay);

        if (!name) {

            return {

                success: false,

                message:
                    "Escribe el nombre de la tarjeta."

            };

        }

        if (!bank) {

            return {

                success: false,

                message:
                    "Escribe el nombre del banco."

            };

        }

        if (
            !Number.isFinite(limit) ||
            limit <= 0
        ) {

            return {

                success: false,

                message:
                    "El límite de crédito debe ser mayor que cero."

            };

        }

        if (
            !Number.isFinite(used) ||
            used < 0
        ) {

            return {

                success: false,

                message:
                    "El saldo utilizado no puede ser negativo."

            };

        }

        if (used > limit) {

            return {

                success: false,

                message:
                    "El saldo utilizado no puede superar el límite de crédito."

            };

        }

        if (
            !Number.isInteger(cutDay) ||
            cutDay < 1 ||
            cutDay > 31
        ) {

            return {

                success: false,

                message:
                    "El día de corte debe estar entre 1 y 31."

            };

        }

        if (
            !Number.isInteger(dueDay) ||
            dueDay < 1 ||
            dueDay > 31
        ) {

            return {

                success: false,

                message:
                    "El día límite de pago debe estar entre 1 y 31."

            };

        }

        return {

            success: true

        };

    }

};

CardManager.initialize();