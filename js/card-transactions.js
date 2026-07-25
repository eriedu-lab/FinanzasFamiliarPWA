"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Movimientos de tarjetas
=====================================
*/

const CardTransactionManager = {

    storageKey:
        "financeCardTransactions",

    transactions: [],

    initialize() {

        const stored =
            Storage.load(
                this.storageKey
            );

        this.transactions =
            Array.isArray(stored)
                ? stored
                : [];

        this.wrapCardDeletion();

    },

    save() {

        Storage.save(
            this.storageKey,
            this.transactions
        );

    },

    getAll() {

        return [
            ...this.transactions
        ].sort(
            (
                first,
                second
            ) => {

                const dateDifference =
                    String(
                        second.date || ""
                    ).localeCompare(
                        String(
                            first.date || ""
                        )
                    );

                if (dateDifference !== 0) {

                    return dateDifference;

                }

                return String(
                    second.createdAt || ""
                ).localeCompare(
                    String(
                        first.createdAt || ""
                    )
                );

            }
        );

    },

    getByCard(cardId) {

        return this
            .getAll()
            .filter(
                transaction =>
                    transaction.cardId ===
                    String(cardId)
            );

    },

    getByMonth(monthKey) {

        return this
            .getAll()
            .filter(
                transaction =>
                    String(
                        transaction.date || ""
                    ).slice(0, 7) ===
                    String(monthKey)
            );

    },

    createTransaction(data) {

        const validation =
            this.validate(data);

        if (!validation.success) {

            return validation;

        }

        const card =
            CardManager.getById(
                String(data.cardId)
            );

        if (!card) {

            return {
                success: false,
                message:
                    "No se encontró la tarjeta."
            };

        }

        const amount =
            Number(data.amount);

        const effect =
            this.getBalanceEffect(
                data.type,
                amount
            );

        const newUsed =
            Number(card.used || 0) +
            effect;

        if (newUsed < 0) {

            return {
                success: false,
                message:
                    "El movimiento dejaría el saldo utilizado por debajo de cero."
            };

        }

        if (
            newUsed >
            Number(card.limit || 0)
        ) {

            return {
                success: false,
                message:
                    "El movimiento supera el límite de crédito disponible."
            };

        }

        const transaction = {

            id:
                crypto.randomUUID
                    ? crypto.randomUUID()
                    : (
                        Date.now().toString() +
                        Math.random()
                            .toString(16)
                            .slice(2)
                    ),

            cardId:
                String(data.cardId),

            type:
                String(data.type),

            description:
                String(
                    data.description || ""
                ).trim(),

            amount:
                amount,

            date:
                String(data.date),

            createdAt:
                new Date()
                    .toISOString()

        };

        this.transactions.push(
            transaction
        );

        card.used =
            newUsed;

        CardManager.save();
        this.save();

        return {
            success: true,
            transaction
        };

    },

    deleteTransaction(
        transactionId
    ) {

        const transaction =
            this.transactions.find(
                item =>
                    item.id ===
                    String(
                        transactionId
                    )
            );

        if (!transaction) {

            return {
                success: false,
                message:
                    "No se encontró el movimiento."
            };

        }

        const card =
            CardManager.getById(
                transaction.cardId
            );

        if (card) {

            const effect =
                this.getBalanceEffect(
                    transaction.type,
                    transaction.amount
                );

            const restoredUsed =
                Number(
                    card.used || 0
                ) -
                effect;

            card.used =
                Math.max(
                    0,
                    Math.min(
                        Number(
                            card.limit || 0
                        ),
                        restoredUsed
                    )
                );

            CardManager.save();

        }

        this.transactions =
            this.transactions.filter(
                item =>
                    item.id !==
                    transaction.id
            );

        this.save();

        return {
            success: true
        };

    },

    deleteByCard(cardId) {

        this.transactions =
            this.transactions.filter(
                transaction =>
                    transaction.cardId !==
                    String(cardId)
            );

        this.save();

    },

    getBalanceEffect(
        type,
        amount
    ) {

        const cleanAmount =
            Number(amount) || 0;

        if (
            type === "purchase" ||
            type === "adjustment-add"
        ) {

            return cleanAmount;

        }

        return -cleanAmount;

    },

    getHistoryImpact(
        transaction
    ) {

        if (
            transaction.type ===
            "purchase" ||
            transaction.type ===
            "adjustment-add"
        ) {

            return Number(
                transaction.amount
            ) || 0;

        }

        if (
            transaction.type ===
            "refund" ||
            transaction.type ===
            "adjustment-subtract"
        ) {

            return -(
                Number(
                    transaction.amount
                ) || 0
            );

        }

        /*
            Un pago reduce la deuda de la tarjeta,
            pero no vuelve a contarse como gasto para
            evitar duplicar una compra ya registrada.
        */
        return 0;

    },

    getTypeLabel(type) {

        const labels = {

            purchase:
                "Compra",

            payment:
                "Pago",

            refund:
                "Devolución",

            "adjustment-add":
                "Ajuste de cargo",

            "adjustment-subtract":
                "Ajuste a favor"

        };

        return labels[type] ||
            "Movimiento";

    },

    validate(data) {

        if (
            !data ||
            typeof data !==
            "object"
        ) {

            return {
                success: false,
                message:
                    "Los datos del movimiento no son válidos."
            };

        }

        const cardId =
            String(
                data.cardId || ""
            );

        const type =
            String(
                data.type || ""
            );

        const description =
            String(
                data.description || ""
            ).trim();

        const amount =
            Number(
                data.amount
            );

        const date =
            String(
                data.date || ""
            );

        const validTypes = [
            "purchase",
            "payment",
            "refund",
            "adjustment-add",
            "adjustment-subtract"
        ];

        if (!cardId) {

            return {
                success: false,
                message:
                    "Selecciona una tarjeta."
            };

        }

        if (
            !validTypes.includes(type)
        ) {

            return {
                success: false,
                message:
                    "Selecciona un tipo de movimiento."
            };

        }

        if (!description) {

            return {
                success: false,
                message:
                    "Escribe una descripción."
            };

        }

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return {
                success: false,
                message:
                    "Escribe un importe válido."
            };

        }

        if (!date) {

            return {
                success: false,
                message:
                    "Selecciona la fecha."
            };

        }

        return {
            success: true
        };

    },

    wrapCardDeletion() {

        if (
            typeof CardManager ===
            "undefined" ||
            CardManager
                .__transactionsDeleteWrapped
        ) {

            return;

        }

        const originalDelete =
            CardManager.deleteCard
                .bind(CardManager);

        CardManager.deleteCard =
            cardId => {

                this.deleteByCard(
                    cardId
                );

                return originalDelete(
                    cardId
                );

            };

        CardManager
            .__transactionsDeleteWrapped =
                true;

    }

};

CardTransactionManager.initialize();

window.CardTransactionManager =
    CardTransactionManager;
