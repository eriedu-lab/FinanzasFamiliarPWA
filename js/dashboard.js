"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Dashboard Principal
=====================================
*/

const Dashboard = {

    elements: {},

    initialize() {

        this.elements = {

            balance:
                document.getElementById(
                    "dashboard-balance"
                ),

            income:
                document.getElementById(
                    "dashboard-income"
                ),

            expenses:
                document.getElementById(
                    "dashboard-expenses"
                ),

            healthScore:
                document.getElementById(
                    "health-score"
                ),

            healthMessage:
                document.getElementById(
                    "health-message"
                ),

            healthProgress:
                document.getElementById(
                    "health-progress"
                )

        };

        if (
            !this.elements.balance ||
            !this.elements.income ||
            !this.elements.expenses
        ) {

            return;

        }

        this.render();

    },

    render() {

        const totalIncome =
            IncomeManager.getTotal();

        const totalExpenses =
            ExpenseManager.getTotal();

        const balance =
            totalIncome - totalExpenses;

        this.elements.income.textContent =
            this.formatCurrency(
                totalIncome
            );

        this.elements.expenses.textContent =
            this.formatCurrency(
                totalExpenses
            );

        this.elements.balance.textContent =
            this.formatCurrency(
                balance
            );

        this.renderHealth(
            totalIncome,
            totalExpenses,
            balance
        );

    },

    renderHealth(
        totalIncome,
        totalExpenses,
        balance
    ) {

        let score = 0;

        let message =
            "Agrega ingresos y gastos para calcular tu puntuación.";

        if (totalIncome > 0) {

            const expensePercentage =
                totalExpenses /
                totalIncome;

            if (expensePercentage <= 0.50) {

                score = 100;

                message =
                    "Excelente control financiero. Tus gastos están por debajo del 50% de tus ingresos.";

            } else if (
                expensePercentage <= 0.70
            ) {

                score = 80;

                message =
                    "Tu situación financiera es saludable, aunque puedes mejorar tu capacidad de ahorro.";

            } else if (
                expensePercentage <= 0.90
            ) {

                score = 60;

                message =
                    "Tus gastos consumen gran parte de tus ingresos. Conviene revisar gastos variables.";

            } else if (
                expensePercentage <= 1
            ) {

                score = 40;

                message =
                    "Tu margen disponible es muy pequeño. Evita nuevos compromisos por ahora.";

            } else {

                score = 20;

                message =
                    "Tus gastos superan tus ingresos. Es importante reducir gastos o aumentar entradas.";

            }

        }

        if (
            totalIncome > 0 &&
            balance < 0
        ) {

            score = 10;

            message =
                "Tu balance es negativo. Revisa tus gastos prioritarios y compromisos.";

        }

        this.elements.healthScore.textContent =
            score;

        this.elements.healthMessage.textContent =
            message;

        this.elements.healthProgress.style.width =
            `${score}%`;

    },

    formatCurrency(amount) {

        return new Intl.NumberFormat(
            "es-MX",
            {
                style: "currency",
                currency: "MXN"
            }
        ).format(
            Number(amount) || 0
        );

    }

};

document.addEventListener(
    "DOMContentLoaded",
    function () {

        Dashboard.initialize();

    }
);