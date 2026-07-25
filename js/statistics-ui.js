"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Interfaz de estadísticas
    Nivel 5
=====================================
*/

const StatisticsUI = {

    initialized:
        false,

    level:
        5,

    elements: {},

    initialize() {

        if (this.initialized) {

            return;

        }

        this.elements = {

            view:
                document.getElementById(
                    "view-estadisticas"
                ),

            refresh:
                document.getElementById(
                    "statistics-refresh"
                ),

            income:
                document.getElementById(
                    "statistics-income"
                ),

            expenses:
                document.getElementById(
                    "statistics-expenses"
                ),

            savingsRate:
                document.getElementById(
                    "statistics-savings-rate"
                ),

            averageBalance:
                document.getElementById(
                    "statistics-average-balance"
                ),

            categoryChart:
                document.getElementById(
                    "statistics-category-chart"
                ),

            monthlyChart:
                document.getElementById(
                    "statistics-monthly-chart"
                ),

            cardUsage:
                document.getElementById(
                    "statistics-card-usage"
                ),

            insights:
                document.getElementById(
                    "statistics-insights"
                ),

            trendChart:
                document.getElementById(
                    "statistics-trend-chart"
                ),

            topExpenses:
                document.getElementById(
                    "statistics-top-expenses"
                )

        };

        if (!this.elements.view) {

            return;

        }

        this.injectStyles();

        this.elements.refresh
            ?.addEventListener(
                "click",
                () => this.render()
            );

        this.initialized =
            true;

        this.render();

    },

    render() {

        if (!this.initialized) {

            this.initialize();

            return;

        }

        if (
            typeof StatisticsManager ===
            "undefined"
        ) {

            return;

        }

        const data =
            StatisticsManager
                .dashboard();

        this.elements.income.textContent =
            this.formatCurrency(
                data.current.incomeTotal
            );

        this.elements.expenses.textContent =
            this.formatCurrency(
                data.current.expenseTotal
            );

        this.elements.savingsRate.textContent =
            `${this.formatNumber(
                data.savingsRate
            )}%`;

        this.elements.averageBalance.textContent =
            this.formatCurrency(
                data.averageBalance
            );

        this.renderCategoryChart(
            data.categories
        );

        this.renderMonthlyChart(
            data.months
        );

        this.renderCardUsage(
            data.cards
        );

        this.renderInsights(
            data.insights
        );

        this.renderTrend(
            data.months
        );

        this.renderTopExpenses(
            data.topExpenses
        );

    },

    renderCategoryChart(items) {

        if (this.level < 2) {

            this.elements.categoryChart.innerHTML =
                this.comingSoon(
                    "Los gráficos se activarán en el PASO 68.2."
                );

            return;

        }

        if (!items.length) {

            this.elements.categoryChart.innerHTML =
                this.emptyMessage(
                    "Registra gastos para generar este gráfico."
                );

            return;

        }

        const maximum =
            Math.max(
                ...items.map(
                    item => item.amount
                ),
                1
            );

        this.elements.categoryChart.innerHTML =
            items.slice(0, 8)
                .map(
                    item => `
                        <div class="statistics-bar-row">
                            <div class="statistics-bar-label">
                                <span>${this.escapeHTML(item.name)}</span>
                                <strong>${this.formatCurrency(item.amount)}</strong>
                            </div>
                            <div class="statistics-bar-track">
                                <div
                                    class="statistics-bar-fill"
                                    style="width: ${Math.max(
                                        (item.amount / maximum) * 100,
                                        3
                                    )}%"
                                ></div>
                            </div>
                        </div>
                    `
                )
                .join("");

    },

    renderMonthlyChart(months) {

        if (this.level < 2) {

            this.elements.monthlyChart.innerHTML =
                this.comingSoon(
                    "La comparación mensual se activará en el PASO 68.2."
                );

            return;

        }

        const recent =
            months.slice(-6);

        const maximum =
            Math.max(
                ...recent.flatMap(
                    item => [
                        item.incomeTotal,
                        item.expenseTotal
                    ]
                ),
                1
            );

        this.elements.monthlyChart.innerHTML = `
            <div class="statistics-legend">
                <span><i class="legend-income"></i>Ingresos</span>
                <span><i class="legend-expense"></i>Gastos</span>
            </div>

            <div class="statistics-columns">
                ${recent.map(
                    item => `
                        <div class="statistics-column-group">
                            <div class="statistics-column-bars">
                                <div
                                    class="statistics-column income-column"
                                    style="height: ${Math.max(
                                        (item.incomeTotal / maximum) * 150,
                                        item.incomeTotal > 0 ? 4 : 0
                                    )}px"
                                    title="${this.formatCurrency(item.incomeTotal)}"
                                ></div>
                                <div
                                    class="statistics-column expense-column"
                                    style="height: ${Math.max(
                                        (item.expenseTotal / maximum) * 150,
                                        item.expenseTotal > 0 ? 4 : 0
                                    )}px"
                                    title="${this.formatCurrency(item.expenseTotal)}"
                                ></div>
                            </div>
                            <small>${this.escapeHTML(item.label)}</small>
                        </div>
                    `
                ).join("")}
            </div>
        `;

    },

    renderCardUsage(cards) {

        if (this.level < 2) {

            this.elements.cardUsage.innerHTML =
                this.comingSoon(
                    "El análisis de tarjetas se activará en el PASO 68.2."
                );

            return;

        }

        if (!cards.length) {

            this.elements.cardUsage.innerHTML =
                this.emptyMessage(
                    "Agrega tarjetas para analizar su utilización."
                );

            return;

        }

        this.elements.cardUsage.innerHTML =
            cards.map(
                card => `
                    <div class="statistics-card-usage-item">
                        <div class="statistics-bar-label">
                            <span>
                                ${this.escapeHTML(card.bank)} ·
                                ${this.escapeHTML(card.name)}
                            </span>
                            <strong>
                                ${this.formatNumber(card.percentage)}%
                            </strong>
                        </div>
                        <div class="statistics-bar-track">
                            <div
                                class="statistics-bar-fill card-usage-fill ${card.percentage >= 90 ? "danger" : card.percentage >= 70 ? "warning" : ""}"
                                style="width: ${Math.min(card.percentage, 100)}%"
                            ></div>
                        </div>
                        <small>
                            ${this.formatCurrency(card.used)} utilizados de
                            ${this.formatCurrency(card.limit)}
                        </small>
                    </div>
                `
            ).join("");

    },

    renderInsights(insights) {

        if (this.level < 3) {

            this.elements.insights.innerHTML =
                this.comingSoon(
                    "Los indicadores se activarán en el PASO 68.3."
                );

            return;

        }

        const items = [
            {
                icon: "🏷️",
                title: "Categoría principal",
                value:
                    insights.topCategory
                        ? `${insights.topCategory.name} · ${this.formatCurrency(insights.topCategory.amount)}`
                        : "Sin información"
            },
            {
                icon: "💳",
                title: "Tarjeta más utilizada",
                value:
                    insights.mostUsedCard
                        ? `${insights.mostUsedCard.name} · ${this.formatNumber(insights.mostUsedCard.percentage)}%`
                        : "Sin tarjetas"
            },
            {
                icon: "📉",
                title: "Mes con mayor gasto",
                value:
                    insights.highestExpenseMonth
                        ? `${insights.highestExpenseMonth.label} · ${this.formatCurrency(insights.highestExpenseMonth.expenseTotal)}`
                        : "Sin información"
            },
            {
                icon: "📈",
                title: "Mes con mayor ingreso",
                value:
                    insights.highestIncomeMonth
                        ? `${insights.highestIncomeMonth.label} · ${this.formatCurrency(insights.highestIncomeMonth.incomeTotal)}`
                        : "Sin información"
            },
            {
                icon: insights.trend === "mejorando" ? "🟢" : insights.trend === "bajando" ? "🔴" : "🟡",
                title: "Tendencia financiera",
                value:
                    `Tu balance se encuentra ${insights.trend}`
            }
        ];

        this.elements.insights.innerHTML =
            items.map(
                item => `
                    <div class="statistics-insight">
                        <span class="statistics-insight-icon">${item.icon}</span>
                        <div>
                            <small>${this.escapeHTML(item.title)}</small>
                            <strong>${this.escapeHTML(item.value)}</strong>
                        </div>
                    </div>
                `
            ).join("");

    },

    renderTrend(months) {

        if (this.level < 4) {

            this.elements.trendChart.innerHTML =
                this.comingSoon(
                    "La evolución anual se activará en el PASO 68.4."
                );

            return;

        }

        const maximum =
            Math.max(
                ...months.map(
                    item =>
                        Math.abs(item.balance)
                ),
                1
            );

        this.elements.trendChart.innerHTML = `
            <div class="statistics-trend">
                ${months.map(
                    item => {
                        const height =
                            Math.max(
                                (
                                    Math.abs(
                                        item.balance
                                    ) /
                                    maximum
                                ) * 120,
                                item.balance !== 0
                                    ? 4
                                    : 0
                            );

                        return `
                            <div class="statistics-trend-item">
                                <div class="statistics-trend-space">
                                    <div
                                        class="statistics-trend-bar ${item.balance >= 0 ? "positive" : "negative"}"
                                        style="height: ${height}px"
                                        title="${this.formatCurrency(item.balance)}"
                                    ></div>
                                </div>
                                <small>${this.escapeHTML(item.label)}</small>
                            </div>
                        `;
                    }
                ).join("")}
            </div>
        `;

    },

    renderTopExpenses(items) {

        if (this.level < 3) {

            this.elements.topExpenses.innerHTML =
                this.comingSoon(
                    "El ranking se activará en el PASO 68.3."
                );

            return;

        }

        if (!items.length) {

            this.elements.topExpenses.innerHTML =
                this.emptyMessage(
                    "No hay gastos registrados."
                );

            return;

        }

        this.elements.topExpenses.innerHTML =
            items.map(
                (item, index) => `
                    <article class="statistics-top-item">
                        <span class="statistics-position">
                            ${index + 1}
                        </span>
                        <div>
                            <strong>${this.escapeHTML(item.name)}</strong>
                            <small>
                                ${this.escapeHTML(item.category)} ·
                                ${this.formatDate(item.date)}
                            </small>
                        </div>
                        <strong class="statistics-top-amount">
                            ${this.formatCurrency(item.amount)}
                        </strong>
                    </article>
                `
            ).join("");

    },

    comingSoon(message) {

        return `
            <div class="statistics-placeholder">
                <span>📊</span>
                <p>${this.escapeHTML(message)}</p>
            </div>
        `;

    },

    emptyMessage(message) {

        return `
            <div class="statistics-placeholder">
                <span>🗂️</span>
                <p>${this.escapeHTML(message)}</p>
            </div>
        `;

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

    },

    formatNumber(value) {

        return new Intl.NumberFormat(
            "es-MX",
            {
                maximumFractionDigits: 1
            }
        ).format(
            Number(value) || 0
        );

    },

    formatDate(value) {

        if (!value) {

            return "Sin fecha";

        }

        return new Intl.DateTimeFormat(
            "es-MX",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        ).format(
            new Date(
                `${value}T12:00:00`
            )
        );

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
                "statistics-styles"
            )
        ) {

            return;

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "statistics-styles";

        style.textContent = `
            .statistics-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 18px;
                margin: 18px 0;
            }

            .statistics-panel {
                overflow: hidden;
            }

            .statistics-chart {
                min-height: 220px;
            }

            .statistics-placeholder {
                min-height: 190px;
                display: grid;
                place-items: center;
                align-content: center;
                gap: 10px;
                text-align: center;
                color: #64748b;
                border: 1px dashed #cbd5e1;
                border-radius: 16px;
                padding: 20px;
            }

            .statistics-placeholder span {
                font-size: 34px;
            }

            .statistics-bar-row,
            .statistics-card-usage-item {
                margin-bottom: 16px;
            }

            .statistics-bar-label {
                display: flex;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 7px;
                font-size: 14px;
            }

            .statistics-bar-track {
                width: 100%;
                height: 10px;
                overflow: hidden;
                border-radius: 999px;
                background: #e2e8f0;
            }

            .statistics-bar-fill {
                height: 100%;
                border-radius: inherit;
                background: linear-gradient(90deg, #2563eb, #7c3aed);
                transition: width .55s ease;
            }

            .card-usage-fill {
                background: linear-gradient(90deg, #0ea5e9, #2563eb);
            }

            .card-usage-fill.warning {
                background: linear-gradient(90deg, #f59e0b, #ea580c);
            }

            .card-usage-fill.danger {
                background: linear-gradient(90deg, #ef4444, #b91c1c);
            }

            .statistics-legend {
                display: flex;
                gap: 18px;
                margin-bottom: 14px;
                font-size: 13px;
                color: #64748b;
            }

            .statistics-legend i {
                display: inline-block;
                width: 10px;
                height: 10px;
                margin-right: 6px;
                border-radius: 3px;
            }

            .legend-income {
                background: #16a34a;
            }

            .legend-expense {
                background: #dc2626;
            }

            .statistics-columns {
                min-height: 175px;
                display: flex;
                align-items: end;
                justify-content: space-between;
                gap: 10px;
            }

            .statistics-column-group {
                flex: 1;
                display: grid;
                gap: 7px;
                text-align: center;
            }

            .statistics-column-bars {
                min-height: 150px;
                display: flex;
                align-items: end;
                justify-content: center;
                gap: 4px;
            }

            .statistics-column {
                width: min(18px, 40%);
                border-radius: 6px 6px 2px 2px;
                transition: height .55s ease;
            }

            .income-column {
                background: #16a34a;
            }

            .expense-column {
                background: #dc2626;
            }

            .statistics-insights {
                display: grid;
                gap: 12px;
            }

            .statistics-insight {
                display: grid;
                grid-template-columns: auto 1fr;
                align-items: center;
                gap: 12px;
                padding: 13px;
                border: 1px solid #e2e8f0;
                border-radius: 14px;
                background: #fff;
            }

            .statistics-insight-icon {
                font-size: 24px;
            }

            .statistics-insight small,
            .statistics-insight strong {
                display: block;
            }

            .statistics-insight small {
                margin-bottom: 3px;
                color: #64748b;
            }

            .statistics-trend {
                min-height: 170px;
                display: flex;
                align-items: end;
                gap: 8px;
                overflow-x: auto;
                padding: 10px 2px;
            }

            .statistics-trend-item {
                min-width: 54px;
                flex: 1;
                display: grid;
                gap: 7px;
                text-align: center;
            }

            .statistics-trend-space {
                height: 125px;
                display: flex;
                align-items: end;
                justify-content: center;
            }

            .statistics-trend-bar {
                width: 24px;
                border-radius: 7px 7px 2px 2px;
                transition: height .6s ease;
            }

            .statistics-trend-bar.positive {
                background: linear-gradient(#22c55e, #15803d);
            }

            .statistics-trend-bar.negative {
                background: linear-gradient(#f87171, #b91c1c);
            }

            .statistics-top-list {
                display: grid;
                gap: 10px;
            }

            .statistics-top-item {
                display: grid;
                grid-template-columns: auto 1fr auto;
                align-items: center;
                gap: 12px;
                padding: 13px;
                border: 1px solid #e2e8f0;
                border-radius: 14px;
                background: #fff;
            }

            .statistics-position {
                width: 30px;
                height: 30px;
                display: grid;
                place-items: center;
                border-radius: 10px;
                background: #eef2ff;
                color: #3730a3;
                font-weight: 800;
            }

            .statistics-top-item small {
                display: block;
                margin-top: 3px;
                color: #64748b;
            }

            .statistics-top-amount {
                color: #b91c1c;
            }

            .statistics-panel { animation: statisticsEnter .35s ease both; } .statistics-panel:nth-child(2) { animation-delay: .05s; } .statistics-panel:nth-child(3) { animation-delay: .1s; } .statistics-panel:nth-child(4) { animation-delay: .15s; } @keyframes statisticsEnter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .statistics-panel, .statistics-summary-grid .summary-card { box-shadow: 0 12px 28px rgba(15, 23, 42, .07); }

            @media (max-width: 820px) {
                .statistics-grid {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 560px) {
                .statistics-top-item {
                    grid-template-columns: auto 1fr;
                }

                .statistics-top-amount {
                    grid-column: 2;
                }

                .statistics-columns {
                    gap: 5px;
                }

                .statistics-column-group small {
                    font-size: 10px;
                }
            }
        `;

        document.head.appendChild(
            style
        );

    }

};

window.StatisticsUI =
    StatisticsUI;

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            StatisticsUI.initialize();

        }
    );

} else {

    StatisticsUI.initialize();

}
