"use strict";

/*
=====================================
    FINANZAS FAMILIAR 2.1
    Dashboard profesional
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

            balanceStatus:
                document.getElementById(
                    "dashboard-balance-status"
                ),

            currentMonth:
                document.getElementById(
                    "dashboard-current-month"
                ),

            income:
                document.getElementById(
                    "dashboard-income"
                ),

            expenses:
                document.getElementById(
                    "dashboard-expenses"
                ),

            commitments:
                document.getElementById(
                    "dashboard-commitments"
                ),

            cards:
                document.getElementById(
                    "dashboard-cards"
                ),

            healthScore:
                document.getElementById(
                    "health-score"
                ),

            healthLabel:
                document.getElementById(
                    "health-label"
                ),

            healthMessage:
                document.getElementById(
                    "health-message"
                ),

            healthProgress:
                document.getElementById(
                    "health-progress"
                ),

            healthRingProgress:
                document.getElementById(
                    "health-ring-progress"
                ),

            budgetValue:
                document.getElementById(
                    "dashboard-budget-value"
                ),

            budgetPercentage:
                document.getElementById(
                    "dashboard-budget-percentage"
                ),

            budgetMessage:
                document.getElementById(
                    "dashboard-budget-message"
                ),

            budgetProgress:
                document.getElementById(
                    "dashboard-budget-progress"
                ),

            goalsValue:
                document.getElementById(
                    "dashboard-goals-value"
                ),

            goalsMessage:
                document.getElementById(
                    "dashboard-goals-message"
                ),

            goalsProgress:
                document.getElementById(
                    "dashboard-goals-progress"
                )

        };

        if (
            !this.elements.balance ||
            !this.elements.income ||
            !this.elements.expenses ||
            !this.elements.cards
        ) {

            return;

        }

        this.configureActions();
        this.loadReminderModules();
        this.render();

        document.addEventListener(
            "finance-data-changed",
            () => this.render()
        );

        document.addEventListener(
            "finance-budget-changed",
            () => this.render()
        );

        document.addEventListener(
            "finance-goals-changed",
            () => this.render()
        );

    },

    configureActions() {

        document.getElementById(
            "dashboard-open-budget"
        )?.addEventListener(
            "click",
            () => {

                if (
                    window.BudgetUI &&
                    typeof window.BudgetUI
                        .showBudgetView ===
                        "function"
                ) {

                    window.BudgetUI
                        .showBudgetView();

                    return;

                }

                document.getElementById(
                    "open-budget-view"
                )?.click();

            }
        );

        document.getElementById(
            "dashboard-open-goals"
        )?.addEventListener(
            "click",
            () => {

                if (
                    typeof window.showView ===
                    "function"
                ) {

                    window.showView(
                        "metas",
                        "Metas de ahorro",
                        "Objetivos y aportaciones familiares"
                    );

                }

            }
        );

    },

    loadReminderModules() {

        const loadScript =
            (
                source,
                id
            ) =>
                new Promise(
                    (
                        resolve,
                        reject
                    ) => {

                        const existing =
                            document.getElementById(
                                id
                            );

                        if (existing) {

                            if (
                                existing.dataset
                                    .loaded ===
                                    "true"
                            ) {

                                resolve();

                            } else {

                                existing.addEventListener(
                                    "load",
                                    resolve,
                                    {
                                        once: true
                                    }
                                );

                            }

                            return;

                        }

                        const script =
                            document.createElement(
                                "script"
                            );

                        script.id =
                            id;

                        script.src =
                            source;

                        script.onload =
                            () => {

                                script.dataset.loaded =
                                    "true";

                                resolve();

                            };

                        script.onerror =
                            reject;

                        document.body
                            .appendChild(
                                script
                            );

                    }
                );

        loadScript(
            "js/reminders.js",
            "finance-reminders-module"
        )
        .then(
            () =>
                loadScript(
                    "js/reminders-ui.js",
                    "finance-reminders-ui-module"
                )
        )
        .then(
            () => {

                if (
                    window.RemindersUI &&
                    typeof window.RemindersUI
                        .render ===
                        "function"
                ) {

                    window.RemindersUI
                        .render();

                }

            }
        )
        .catch(
            () =>
                console.error(
                    "No se pudieron cargar los recordatorios de pago."
                )
        );

    },

    render() {

        const totalIncome =
            typeof IncomeManager !==
            "undefined"
                ? IncomeManager.getTotal()
                : 0;

        const totalExpenses =
            typeof ExpenseManager !==
            "undefined"
                ? ExpenseManager.getTotal()
                : 0;

        const totalCards =
            typeof CardManager !==
            "undefined"
                ? CardManager.getTotalUsed()
                : 0;

        const totalPaymentPlans =
            typeof PaymentPlanManager !==
            "undefined"
                ? PaymentPlanManager
                    .getTotalMonthlyPayments()
                : 0;

        const totalCommitments =
            totalCards +
            totalPaymentPlans;

        const balance =
            totalIncome -
            totalExpenses -
            totalCommitments;

        this.elements.income.textContent =
            this.formatCurrency(
                totalIncome
            );

        this.elements.expenses.textContent =
            this.formatCurrency(
                totalExpenses
            );

        if (this.elements.commitments) {

            this.elements.commitments
                .textContent =
                    this.formatCurrency(
                        totalPaymentPlans
                    );

        }

        this.elements.cards.textContent =
            this.formatCurrency(
                totalCards
            );

        this.elements.balance.textContent =
            this.formatCurrency(
                balance
            );

        this.renderBalanceStatus(
            balance
        );

        this.renderBudget();
        this.renderGoals();

        this.renderHealth(
            totalIncome,
            totalExpenses,
            totalCards,
            totalPaymentPlans,
            totalCommitments,
            balance
        );

        if (
            window.RemindersUI &&
            typeof window.RemindersUI
                .render ===
                "function"
        ) {

            window.RemindersUI
                .render();

        }

    },

    renderBalanceStatus(balance) {

        if (this.elements.currentMonth) {

            this.elements.currentMonth
                .textContent =
                    new Intl.DateTimeFormat(
                        "es-MX",
                        {
                            month: "long",
                            year: "numeric"
                        }
                    ).format(
                        new Date()
                    );

        }

        if (!this.elements.balanceStatus) {

            return;

        }

        this.elements.balanceStatus
            .classList.remove(
                "positive",
                "negative",
                "neutral"
            );

        if (balance > 0) {

            this.elements.balanceStatus
                .textContent =
                    "● Balance positivo";

            this.elements.balanceStatus
                .classList.add(
                    "positive"
                );

        } else if (balance < 0) {

            this.elements.balanceStatus
                .textContent =
                    "● Requiere atención";

            this.elements.balanceStatus
                .classList.add(
                    "negative"
                );

        } else {

            this.elements.balanceStatus
                .textContent =
                    "● Balance equilibrado";

            this.elements.balanceStatus
                .classList.add(
                    "neutral"
                );

        }

    },

    renderBudget() {

        if (
            typeof BudgetManager ===
            "undefined" ||
            !this.elements.budgetValue ||
            !this.elements.budgetMessage
        ) {

            return;

        }

        const summary =
            BudgetManager.getSummary(
                BudgetManager
                    .getCurrentMonthKey()
            );

        if (summary.budget <= 0) {

            this.elements.budgetValue
                .textContent =
                    "Sin configurar";

            this.elements.budgetMessage
                .textContent =
                    "Define un límite para controlar tus gastos del mes.";

            if (
                this.elements
                    .budgetPercentage
            ) {

                this.elements
                    .budgetPercentage
                    .textContent =
                        "0%";

            }

            if (
                this.elements
                    .budgetProgress
            ) {

                this.elements
                    .budgetProgress
                    .style.width =
                        "0%";

            }

            return;

        }

        const percentage =
            Math.max(
                Number(
                    summary.percentage || 0
                ),
                0
            );

        this.elements.budgetValue
            .textContent =
                `${this.formatCurrency(
                    summary.spent
                )} / ${this.formatCurrency(
                    summary.budget
                )}`;

        this.elements.budgetMessage
            .textContent =
                summary.remaining >= 0
                    ? `${this.formatCurrency(
                        summary.remaining
                    )} disponibles este mes.`
                    : `Excedido por ${this.formatCurrency(
                        Math.abs(
                            summary.remaining
                        )
                    )}.`;

        if (
            this.elements
                .budgetPercentage
        ) {

            this.elements
                .budgetPercentage
                .textContent =
                    `${percentage.toFixed(
                        0
                    )}%`;

        }

        if (
            this.elements
                .budgetProgress
        ) {

            this.elements
                .budgetProgress
                .style.width =
                    `${Math.min(
                        percentage,
                        100
                    )}%`;

            this.elements
                .budgetProgress
                .classList.toggle(
                    "warning",
                    percentage >= 75 &&
                    percentage < 100
                );

            this.elements
                .budgetProgress
                .classList.toggle(
                    "danger",
                    percentage >= 100
                );

        }

    },

    renderGoals() {

        if (
            typeof GoalManager ===
            "undefined" ||
            !this.elements.goalsValue ||
            !this.elements.goalsMessage ||
            !this.elements.goalsProgress
        ) {

            return;

        }

        const summary =
            GoalManager.getSummary();

        if (summary.count <= 0) {

            this.elements.goalsValue
                .textContent =
                    "Sin metas activas";

            this.elements.goalsMessage
                .textContent =
                    "Crea una meta y comienza a registrar aportaciones.";

            this.elements.goalsProgress
                .style.width =
                    "0%";

            return;

        }

        this.elements.goalsValue
            .textContent =
                `${summary.percentage.toFixed(
                    1
                )}% completado`;

        this.elements.goalsMessage
            .textContent =
                `${this.formatCurrency(
                    summary.saved
                )} ahorrados de ${this.formatCurrency(
                    summary.target
                )}.`;

        this.elements.goalsProgress
            .style.width =
                `${Math.min(
                    summary.percentage,
                    100
                )}%`;

    },

    renderHealth(
        totalIncome,
        totalExpenses,
        totalCards,
        totalPaymentPlans,
        totalCommitments,
        balance
    ) {

        let score =
            0;

        let label =
            "Sin evaluación";

        let message =
            "Agrega ingresos y gastos para calcular tu puntuación.";

        const totalOutflow =
            totalExpenses +
            totalCommitments;

        if (totalIncome > 0) {

            const expensePercentage =
                totalOutflow /
                totalIncome;

            if (
                expensePercentage <=
                0.50
            ) {

                score =
                    100;

                label =
                    "Excelente";

                message =
                    "Tus salidas están por debajo del 50% de tus ingresos.";

            } else if (
                expensePercentage <=
                0.70
            ) {

                score =
                    80;

                label =
                    "Saludable";

                message =
                    "Mantienes un buen control y todavía tienes margen de ahorro.";

            } else if (
                expensePercentage <=
                0.90
            ) {

                score =
                    60;

                label =
                    "Atención";

                message =
                    "Tus gastos consumen gran parte de tus ingresos.";

            } else if (
                expensePercentage <=
                1
            ) {

                score =
                    40;

                label =
                    "Margen reducido";

                message =
                    "Tu margen disponible es pequeño. Evita nuevos compromisos.";

            } else {

                score =
                    20;

                label =
                    "En riesgo";

                message =
                    "Tus salidas superan tus ingresos. Conviene reducir gastos.";

            }

        }

        if (
            totalIncome > 0 &&
            balance < 0
        ) {

            score =
                10;

            label =
                "Balance negativo";

            message =
                "Revisa gastos, tarjetas y planes de pago activos.";

        }

        if (
            totalIncome <= 0 &&
            (
                totalExpenses > 0 ||
                totalCards > 0 ||
                totalPaymentPlans > 0
            )
        ) {

            score =
                0;

            label =
                "Faltan ingresos";

            message =
                "Tienes salidas registradas, pero todavía no agregas ingresos.";

        }

        if (this.elements.healthScore) {

            this.elements.healthScore
                .textContent =
                    score;

        }

        if (this.elements.healthLabel) {

            this.elements.healthLabel
                .textContent =
                    label;

        }

        if (this.elements.healthMessage) {

            this.elements.healthMessage
                .textContent =
                    message;

        }

        if (this.elements.healthProgress) {

            this.elements.healthProgress
                .style.width =
                    `${score}%`;

        }

        if (
            this.elements
                .healthRingProgress
        ) {

            const circumference =
                2 *
                Math.PI *
                18;

            const offset =
                circumference *
                (
                    1 -
                    score /
                    100
                );

            this.elements
                .healthRingProgress
                .style.strokeDasharray =
                    `${circumference}`;

            this.elements
                .healthRingProgress
                .style.strokeDashoffset =
                    `${offset}`;

        }

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

window.Dashboard =
    Dashboard;

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            Dashboard.initialize();

        }
    );

} else {

    Dashboard.initialize();

}
