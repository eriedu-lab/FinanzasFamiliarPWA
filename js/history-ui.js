"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Interfaz del historial financiero
=====================================
*/

const FinancialHistoryUI = {

    selectedMonth:
        "",

    initialized:
        false,

    elements: {},

    initialize() {

        if (this.initialized) {

            return;

        }

        this.elements = {
            view:
                document.getElementById(
                    "view-historial"
                ),
            previous:
                document.getElementById(
                    "history-previous-month"
                ),
            next:
                document.getElementById(
                    "history-next-month"
                ),
            monthLabel:
                document.getElementById(
                    "history-month-label"
                ),
            income:
                document.getElementById(
                    "history-income"
                ),
            expenses:
                document.getElementById(
                    "history-expenses"
                ),
            plans:
                document.getElementById(
                    "history-plans"
                ),
            balance:
                document.getElementById(
                    "history-balance"
                ),
            comparison:
                document.getElementById(
                    "history-comparison"
                ),
            categories:
                document.getElementById(
                    "history-category-list"
                ),
            categoryEmpty:
                document.getElementById(
                    "history-category-empty"
                ),
            movements:
                document.getElementById(
                    "history-movements"
                ),
            movementsEmpty:
                document.getElementById(
                    "history-movements-empty"
                )
        };

        if (!this.elements.view) {

            return;

        }

        this.selectedMonth =
            FinancialHistoryManager
                .normalizeMonthKey(
                    this.selectedMonth
                );

        this.injectStyles();
        this.configureEvents();

        this.initialized =
            true;

        this.render();

    },

    configureEvents() {

        this.elements.previous
            ?.addEventListener(
                "click",
                () => {

                    this.selectedMonth =
                        FinancialHistoryManager
                            .shiftMonth(
                                this.selectedMonth,
                                -1
                            );

                    this.render();

                }
            );

        this.elements.next
            ?.addEventListener(
                "click",
                () => {

                    this.selectedMonth =
                        FinancialHistoryManager
                            .shiftMonth(
                                this.selectedMonth,
                                1
                            );

                    this.render();

                }
            );

    },

    render() {

        if (!this.initialized) {

            this.initialize();

            return;

        }

        this.selectedMonth =
            FinancialHistoryManager
                .normalizeMonthKey(
                    this.selectedMonth
                );

        const summary =
            FinancialHistoryManager
                .getSummary(
                    this.selectedMonth
                );

        const comparison =
            FinancialHistoryManager
                .getComparison(
                    this.selectedMonth
                );

        this.elements.monthLabel
            .textContent =
                this.capitalize(
                    summary.label
                );

        this.elements.income
            .textContent =
                this.formatCurrency(
                    summary.incomeTotal
                );

        this.elements.expenses
            .textContent =
                this.formatCurrency(
                    summary.expenseTotal
                );

        this.elements.plans
            .textContent =
                this.formatCurrency(
                    summary.planTotal
                );

        this.elements.balance
            .textContent =
                this.formatCurrency(
                    summary.balance
                );

        this.elements.balance
            .classList.toggle(
                "history-negative",
                summary.balance < 0
            );

        this.renderComparison(
            comparison
        );

        this.renderCategories(
            summary.categories
        );

        this.renderMovements(
            summary.movements
        );

    },

    renderComparison(comparison) {

        const items = [
            {
                label:
                    "Ingresos",
                difference:
                    comparison.income,
                positiveIsGood:
                    true
            },
            {
                label:
                    "Gastos",
                difference:
                    comparison.expenses,
                positiveIsGood:
                    false
            },
            {
                label:
                    "Planes",
                difference:
                    comparison.plans,
                positiveIsGood:
                    false
            },
            {
                label:
                    "Balance",
                difference:
                    comparison.balance,
                positiveIsGood:
                    true
            }
        ];

        this.elements.comparison
            .innerHTML =
                items.map(
                    item => {

                        const isPositive =
                            item.difference
                                .amount >= 0;

                        const isGood =
                            item.positiveIsGood
                                ? isPositive
                                : !isPositive;

                        const percentageText =
                            item.difference
                                .percentage ===
                                null
                                ? "Sin base anterior"
                                : `${Math.abs(
                                    item.difference
                                        .percentage
                                ).toFixed(1)}%`;

                        return `
                            <div class="history-comparison-item">

                                <span>
                                    ${item.label}
                                </span>

                                <strong class="${isGood ? "history-good" : "history-bad"}">
                                    ${isPositive ? "+" : "−"}${this.formatCurrency(
                                        Math.abs(
                                            item.difference
                                                .amount
                                        )
                                    )}
                                </strong>

                                <small>
                                    ${percentageText}
                                </small>

                            </div>
                        `;

                    }
                )
                .join("");

    },

    renderCategories(categories) {

        this.elements.categories
            .innerHTML =
                "";

        this.elements.categoryEmpty
            .hidden =
                categories.length > 0;

        categories.forEach(
            item => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "history-category-item";

                row.innerHTML = `
                    <div class="history-category-heading">
                        <strong>
                            ${this.escapeHTML(
                                item.category
                            )}
                        </strong>
                        <span>
                            ${this.formatCurrency(
                                item.amount
                            )}
                        </span>
                    </div>
                    <div class="progress-track">
                        <div
                            class="progress-fill"
                            style="width: ${item.percentage}%;"
                        ></div>
                    </div>
                    <small>
                        ${item.percentage.toFixed(1)}% de los gastos
                    </small>
                `;

                this.elements.categories
                    .appendChild(row);

            }
        );

    },

    renderMovements(movements) {

        this.elements.movements
            .innerHTML =
                "";

        this.elements.movementsEmpty
            .hidden =
                movements.length > 0;

        movements.forEach(
            movement => {

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "record-card history-movement-card";

                const amountClass =
                    movement.sign > 0
                        ? "history-income-amount"
                        : (
                            movement.sign < 0
                                ? "history-expense-amount"
                                : "history-neutral-amount"
                        );

                const amountPrefix =
                    movement.sign > 0
                        ? "+"
                        : (
                            movement.sign < 0
                                ? "−"
                                : ""
                        );

                card.innerHTML = `
                    <div class="record-main">
                        <p class="record-category">
                            ${this.escapeHTML(
                                movement.kind
                            )} · ${this.escapeHTML(
                                movement.category
                            )}
                        </p>
                        <h3 class="record-title">
                            ${this.escapeHTML(
                                movement.name
                            )}
                        </h3>
                        <p class="record-meta">
                            ${this.formatDate(
                                movement.date
                            )}
                        </p>
                    </div>
                    <strong class="record-amount ${amountClass}">
                        ${amountPrefix}${this.formatCurrency(
                            movement.amount
                        )}
                    </strong>
                `;

                this.elements.movements
                    .appendChild(card);

            }
        );

    },

    formatCurrency(amount) {

        return new Intl.NumberFormat(
            "es-MX",
            {
                style:
                    "currency",
                currency:
                    "MXN"
            }
        ).format(
            Number(amount) || 0
        );

    },

    formatDate(value) {

        const date =
            new Date(
                `${String(value).slice(0, 10)}T12:00:00`
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Sin fecha";

        }

        return new Intl.DateTimeFormat(
            "es-MX",
            {
                day:
                    "numeric",
                month:
                    "short",
                year:
                    "numeric"
            }
        ).format(date);

    },

    capitalize(value) {

        const text =
            String(value || "");

        return text
            ? text.charAt(0)
                .toUpperCase() +
                text.slice(1)
            : text;

    },

    escapeHTML(value) {

        const element =
            document.createElement(
                "div"
            );

        element.textContent =
            String(value || "");

        return element.innerHTML;

    },

    injectStyles() {

        if (
            document.getElementById(
                "history-module-styles"
            )
        ) {

            return;

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "history-module-styles";

        style.textContent = `

            .history-month-selector {
                display: grid;
                grid-template-columns: auto 1fr auto;
                align-items: center;
                gap: 16px;
                text-align: center;
                margin-bottom: 18px;
            }

            .history-month-selector .secondary-button {
                min-width: 48px;
                font-size: 1.6rem;
            }

            .history-comparison-grid {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 12px;
            }

            .history-comparison-item {
                padding: 14px;
                border-radius: 14px;
                background: #f8fafc;
            }

            .history-comparison-item span,
            .history-comparison-item small {
                display: block;
                color: #64748b;
            }

            .history-comparison-item strong {
                display: block;
                margin: 7px 0 4px;
            }

            .history-good,
            .history-income-amount {
                color: #15803d;
            }

            .history-bad,
            .history-expense-amount,
            .history-negative {
                color: #b91c1c;
            }

            .history-neutral-amount {
                color: #475569;
            }

            .history-category-list {
                display: grid;
                gap: 16px;
            }

            .history-category-item {
                display: grid;
                gap: 7px;
            }

            .history-category-heading {
                display: flex;
                justify-content: space-between;
                gap: 14px;
            }

            .history-category-item small {
                color: #64748b;
            }

            .history-movement-card {
                display: grid;
                grid-template-columns: 1fr auto;
                align-items: center;
                gap: 16px;
            }

            .history-note {
                margin-bottom: 20px;
            }

            @media (max-width: 760px) {

                .history-comparison-grid {
                    grid-template-columns:
                        repeat(2, minmax(0, 1fr));
                }

            }

            @media (max-width: 480px) {

                .history-comparison-grid {
                    grid-template-columns: 1fr;
                }

                .history-movement-card {
                    grid-template-columns: 1fr;
                }

            }

        `;

        document.head
            .appendChild(style);

    }

};

window.FinancialHistoryUI =
    FinancialHistoryUI;

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            FinancialHistoryUI
                .initialize();

        }
    );

} else {

    FinancialHistoryUI
        .initialize();

}
