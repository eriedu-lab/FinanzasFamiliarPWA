"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Gestor de metas de ahorro
=====================================
*/

const GoalManager = {

    storageKey:
        StorageKeys.goals,

    getAll() {

        const goals =
            Storage.load(
                this.storageKey
            );

        return Array.isArray(goals)
            ? goals
            : [];

    },

    saveAll(goals) {

        Storage.save(
            this.storageKey,
            goals
        );

    },

    createGoal(data) {

        const validation =
            this.validateGoal(data);

        if (!validation.success) {

            return validation;

        }

        const initialSaved =
            Number(data.saved) || 0;

        const goal = {

            id:
                this.createId(),

            name:
                String(data.name).trim(),

            target:
                Number(data.target),

            saved:
                initialSaved,

            deadline:
                data.deadline,

            createdAt:
                new Date().toISOString(),

            contributions:
                initialSaved > 0
                    ? [
                        {
                            id:
                                this.createId(),

                            amount:
                                initialSaved,

                            note:
                                "Ahorro inicial",

                            date:
                                new Date().toISOString()
                        }
                    ]
                    : []

        };

        const goals =
            this.getAll();

        goals.push(goal);

        this.saveAll(goals);

        return {

            success: true,

            goal

        };

    },

    updateGoal(goalId, data) {

        const goals =
            this.getAll();

        const index =
            goals.findIndex(
                goal =>
                    goal.id === goalId
            );

        if (index < 0) {

            return {

                success: false,

                message:
                    "No se encontró la meta."

            };

        }

        const validation =
            this.validateGoal(
                {
                    name:
                        data.name,

                    target:
                        data.target,

                    saved:
                        goals[index].saved,

                    deadline:
                        data.deadline
                }
            );

        if (!validation.success) {

            return validation;

        }

        goals[index] = {

            ...goals[index],

            name:
                String(data.name).trim(),

            target:
                Number(data.target),

            deadline:
                data.deadline,

            updatedAt:
                new Date().toISOString()

        };

        this.saveAll(goals);

        return {

            success: true,

            goal:
                goals[index]

        };

    },

    deleteGoal(goalId) {

        const goals =
            this.getAll();

        const filtered =
            goals.filter(
                goal =>
                    goal.id !== goalId
            );

        if (
            filtered.length ===
            goals.length
        ) {

            return {

                success: false,

                message:
                    "No se encontró la meta."

            };

        }

        this.saveAll(filtered);

        return {

            success: true

        };

    },

    addContribution(
        goalId,
        amount,
        note
    ) {

        const numericAmount =
            Number(amount);

        if (
            !Number.isFinite(
                numericAmount
            ) ||
            numericAmount <= 0
        ) {

            return {

                success: false,

                message:
                    "La aportación debe ser mayor que cero."

            };

        }

        const goals =
            this.getAll();

        const index =
            goals.findIndex(
                goal =>
                    goal.id === goalId
            );

        if (index < 0) {

            return {

                success: false,

                message:
                    "No se encontró la meta."

            };

        }

        const contribution = {

            id:
                this.createId(),

            amount:
                numericAmount,

            note:
                String(note || "")
                    .trim() ||
                "Aportación",

            date:
                new Date().toISOString()

        };

        const contributions =
            Array.isArray(
                goals[index].contributions
            )
                ? goals[index].contributions
                : [];

        contributions.unshift(
            contribution
        );

        goals[index].contributions =
            contributions;

        goals[index].saved =
            Math.max(
                0,
                Number(
                    goals[index].saved
                ) + numericAmount
            );

        goals[index].updatedAt =
            new Date().toISOString();

        this.saveAll(goals);

        return {

            success: true,

            contribution,

            goal:
                goals[index]

        };

    },

    deleteContribution(
        goalId,
        contributionId
    ) {

        const goals =
            this.getAll();

        const goalIndex =
            goals.findIndex(
                goal =>
                    goal.id === goalId
            );

        if (goalIndex < 0) {

            return {

                success: false,

                message:
                    "No se encontró la meta."

            };

        }

        const contributions =
            Array.isArray(
                goals[goalIndex]
                    .contributions
            )
                ? goals[goalIndex]
                    .contributions
                : [];

        const contribution =
            contributions.find(
                item =>
                    item.id ===
                    contributionId
            );

        if (!contribution) {

            return {

                success: false,

                message:
                    "No se encontró la aportación."

            };

        }

        goals[goalIndex].contributions =
            contributions.filter(
                item =>
                    item.id !==
                    contributionId
            );

        goals[goalIndex].saved =
            Math.max(
                0,
                Number(
                    goals[goalIndex].saved
                ) -
                Number(
                    contribution.amount
                )
            );

        this.saveAll(goals);

        return {

            success: true

        };

    },

    getSummary() {

        const goals =
            this.getAll();

        const target =
            goals.reduce(
                (
                    total,
                    goal
                ) =>
                    total +
                    Number(
                        goal.target || 0
                    ),
                0
            );

        const saved =
            goals.reduce(
                (
                    total,
                    goal
                ) =>
                    total +
                    Number(
                        goal.saved || 0
                    ),
                0
            );

        return {

            count:
                goals.length,

            target,

            saved,

            remaining:
                Math.max(
                    0,
                    target - saved
                ),

            percentage:
                target > 0
                    ? Math.min(
                        100,
                        (
                            saved /
                            target
                        ) * 100
                    )
                    : 0

        };

    },

    getProgress(goal) {

        const target =
            Number(
                goal.target
            ) || 0;

        const saved =
            Number(
                goal.saved
            ) || 0;

        return {

            target,

            saved,

            remaining:
                Math.max(
                    0,
                    target - saved
                ),

            percentage:
                target > 0
                    ? Math.min(
                        100,
                        (
                            saved /
                            target
                        ) * 100
                    )
                    : 0,

            completed:
                target > 0 &&
                saved >= target

        };

    },

    validateGoal(data) {

        const name =
            String(
                data.name || ""
            ).trim();

        const target =
            Number(
                data.target
            );

        const saved =
            Number(
                data.saved || 0
            );

        if (!name) {

            return {

                success: false,

                message:
                    "Escribe el nombre de la meta."

            };

        }

        if (
            !Number.isFinite(target) ||
            target <= 0
        ) {

            return {

                success: false,

                message:
                    "La cantidad objetivo debe ser mayor que cero."

            };

        }

        if (
            !Number.isFinite(saved) ||
            saved < 0
        ) {

            return {

                success: false,

                message:
                    "El ahorro inicial no puede ser negativo."

            };

        }

        if (!data.deadline) {

            return {

                success: false,

                message:
                    "Selecciona una fecha límite."

            };

        }

        return {

            success: true

        };

    },

    createId() {

        if (
            window.crypto &&
            typeof window.crypto
                .randomUUID ===
                "function"
        ) {

            return window.crypto
                .randomUUID();

        }

        return (
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .slice(2)
        );

    }

};

window.GoalManager =
    GoalManager;
