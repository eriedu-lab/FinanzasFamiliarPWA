"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Administrador de planes de pago
=====================================
*/

const PaymentPlanManager = {

    storageKey: "financePaymentPlans",

    plans: [],

    initialize() {

        const storedPlans =
            Storage.load(
                this.storageKey
            );

        if (
            Array.isArray(storedPlans)
        ) {

            this.plans =
                storedPlans.map(
                    plan => {

                        return {

                            id:
                                String(
                                    plan.id
                                ),

                            description:
                                String(
                                    plan.description || ""
                                ),

                            cardName:
                                String(
                                    plan.cardName || ""
                                ),

                            totalAmount:
                                Number(
                                    plan.totalAmount
                                ) || 0,

                            totalInstallments:
                                Number(
                                    plan.totalInstallments
                                ) || 1,

                            paidInstallments:
                                Number(
                                    plan.paidInstallments
                                ) || 0,

                            purchaseDate:
                                String(
                                    plan.purchaseDate || ""
                                ),

                            firstPaymentDate:
                                String(
                                    plan.firstPaymentDate || ""
                                )

                        };

                    }
                );

        } else {

            this.plans = [];

        }

    },

    save() {

        Storage.save(
            this.storageKey,
            this.plans
        );

    },

    getAll() {

        return [
            ...this.plans
        ];

    },

    getById(planId) {

        return this.plans.find(
            plan =>
                plan.id ===
                String(planId)
        ) || null;

    },

    createPlan(data) {

        const validation =
            this.validatePlan(
                data
            );

        if (!validation.success) {

            return validation;

        }

        const newPlan = {

            id:
                this.createId(),

            description:
                String(
                    data.description
                ).trim(),

            cardName:
                String(
                    data.cardName
                ).trim(),

            totalAmount:
                Number(
                    data.totalAmount
                ),

            totalInstallments:
                Number(
                    data.totalInstallments
                ),

            paidInstallments:
                Number(
                    data.paidInstallments
                ),

            purchaseDate:
                String(
                    data.purchaseDate || ""
                ),

            firstPaymentDate:
                String(
                    data.firstPaymentDate || ""
                )

        };

        this.plans.push(
            newPlan
        );

        this.save();

        return {

            success: true,

            plan: newPlan

        };

    },

    updatePlan(
        planId,
        data
    ) {

        const validation =
            this.validatePlan(
                data
            );

        if (!validation.success) {

            return validation;

        }

        const planIndex =
            this.plans.findIndex(
                plan =>
                    plan.id ===
                    String(planId)
            );

        if (planIndex === -1) {

            return {

                success: false,

                message:
                    "No se encontró el plan de pago."

            };

        }

        const updatedPlan = {

            id:
                this.plans[
                    planIndex
                ].id,

            description:
                String(
                    data.description
                ).trim(),

            cardName:
                String(
                    data.cardName
                ).trim(),

            totalAmount:
                Number(
                    data.totalAmount
                ),

            totalInstallments:
                Number(
                    data.totalInstallments
                ),

            paidInstallments:
                Number(
                    data.paidInstallments
                ),

            purchaseDate:
                String(
                    data.purchaseDate || ""
                ),

            firstPaymentDate:
                String(
                    data.firstPaymentDate || ""
                )

        };

        this.plans[
            planIndex
        ] = updatedPlan;

        this.save();

        return {

            success: true,

            plan: updatedPlan

        };

    },

    deletePlan(planId) {

        const originalLength =
            this.plans.length;

        this.plans =
            this.plans.filter(
                plan =>
                    plan.id !==
                    String(planId)
            );

        if (
            this.plans.length ===
            originalLength
        ) {

            return {

                success: false,

                message:
                    "No se encontró el plan de pago."

            };

        }

        this.save();

        return {

            success: true

        };

    },

    getMonthlyPayment(plan) {

        const totalAmount =
            Number(
                plan.totalAmount
            ) || 0;

        const totalInstallments =
            Number(
                plan.totalInstallments
            ) || 0;

        if (
            totalInstallments <= 0
        ) {

            return 0;

        }

        return (
            totalAmount /
            totalInstallments
        );

    },

    getRemainingInstallments(plan) {

        const totalInstallments =
            Number(
                plan.totalInstallments
            ) || 0;

        const paidInstallments =
            Number(
                plan.paidInstallments
            ) || 0;

        return Math.max(
            totalInstallments -
            paidInstallments,
            0
        );

    },

    getRemainingBalance(plan) {

        const monthlyPayment =
            this.getMonthlyPayment(
                plan
            );

        const remainingInstallments =
            this.getRemainingInstallments(
                plan
            );

        return (
            monthlyPayment *
            remainingInstallments
        );

    },

    getTotalMonthlyPayments() {

        return this.plans.reduce(
            (
                total,
                plan
            ) => {

                const remainingInstallments =
                    this.getRemainingInstallments(
                        plan
                    );

                if (
                    remainingInstallments <= 0
                ) {

                    return total;

                }

                return (
                    total +
                    this.getMonthlyPayment(
                        plan
                    )
                );

            },
            0
        );

    },

    getTotalRemainingBalance() {

        return this.plans.reduce(
            (
                total,
                plan
            ) => {

                return (
                    total +
                    this.getRemainingBalance(
                        plan
                    )
                );

            },
            0
        );

    },

    getActivePlans() {

        return this.plans.filter(
            plan => {

                return (
                    this.getRemainingInstallments(
                        plan
                    ) > 0
                );

            }
        );

    },

    getCompletedPlans() {

        return this.plans.filter(
            plan => {

                return (
                    this.getRemainingInstallments(
                        plan
                    ) === 0
                );

            }
        );

    },

    registerPayment(planId) {

        const plan =
            this.getById(
                planId
            );

        if (!plan) {

            return {

                success: false,

                message:
                    "No se encontró el plan de pago."

            };

        }

        if (
            plan.paidInstallments >=
            plan.totalInstallments
        ) {

            return {

                success: false,

                message:
                    "Este plan ya está completamente pagado."

            };

        }

        plan.paidInstallments += 1;

        this.save();

        return {

            success: true,

            plan: plan

        };

    },

    undoPayment(planId) {

        const plan =
            this.getById(
                planId
            );

        if (!plan) {

            return {

                success: false,

                message:
                    "No se encontró el plan de pago."

            };

        }

        if (
            plan.paidInstallments <= 0
        ) {

            return {

                success: false,

                message:
                    "Este plan todavía no tiene pagos registrados."

            };

        }

        plan.paidInstallments -= 1;

        this.save();

        return {

            success: true,

            plan: plan

        };

    },

    validatePlan(data) {

        if (
            !data ||
            typeof data !==
            "object"
        ) {

            return {

                success: false,

                message:
                    "Los datos del plan no son válidos."

            };

        }

        const description =
            String(
                data.description || ""
            ).trim();

        const cardName =
            String(
                data.cardName || ""
            ).trim();

        const totalAmount =
            Number(
                data.totalAmount
            );

        const totalInstallments =
            Number(
                data.totalInstallments
            );

        const paidInstallments =
            Number(
                data.paidInstallments
            );

        if (!description) {

            return {

                success: false,

                message:
                    "Escribe la descripción de la compra."

            };

        }

        if (!cardName) {

            return {

                success: false,

                message:
                    "Escribe el nombre de la tarjeta."

            };

        }

        if (
            !Number.isFinite(
                totalAmount
            ) ||
            totalAmount <= 0
        ) {

            return {

                success: false,

                message:
                    "El monto total debe ser mayor que cero."

            };

        }

        if (
            !Number.isInteger(
                totalInstallments
            ) ||
            totalInstallments <= 0
        ) {

            return {

                success: false,

                message:
                    "El número de mensualidades debe ser un número entero mayor que cero."

            };

        }

        if (
            !Number.isInteger(
                paidInstallments
            ) ||
            paidInstallments < 0
        ) {

            return {

                success: false,

                message:
                    "Las mensualidades pagadas no pueden ser negativas."

            };

        }

        if (
            paidInstallments >
            totalInstallments
        ) {

            return {

                success: false,

                message:
                    "Las mensualidades pagadas no pueden ser mayores que las mensualidades totales."

            };

        }

        return {

            success: true

        };

    },

    createId() {

        return (
            Date.now().toString() +
            "-" +
            Math.random()
                .toString(16)
                .slice(2)
        );

    },

    loadInterface() {

        if (
            document.querySelector(
                'script[src="js/plans-ui.js"]'
            )
        ) {

            return;

        }

        const script =
            document.createElement(
                "script"
            );

        script.src =
            "js/plans-ui.js";

        script.onload =
            function () {

                if (
                    typeof PaymentPlansUI !==
                    "undefined"
                ) {

                    PaymentPlansUI.initialize();

                }

            };

        script.onerror =
            function () {

                console.error(
                    "No se pudo cargar js/plans-ui.js"
                );

            };

        document.body.appendChild(
            script
        );

    }

};

PaymentPlanManager.initialize();

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            PaymentPlanManager
                .loadInterface();

        }
    );

} else {

    PaymentPlanManager
        .loadInterface();

}