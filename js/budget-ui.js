"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Interfaz de Presupuesto Mensual
=====================================
*/

const BudgetUI = {

    elements: {},

    selectedMonth:
        BudgetManager
            .getCurrentMonthKey(),

    initialize() {

        this.installStyles();
        this.createView();
        this.createMenuButton();
        this.findElements();
        this.configureEvents();
        this.render();

    },

    installStyles() {

        if (
            document.getElementById(
                "budget-module-styles"
            )
        ) {

            return;

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "budget-module-styles";

        style.textContent = `
            .budget-form-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
                gap: 16px;
                margin: 20px 0;
            }

            .budget-panel {
                background: var(--surface, #ffffff);
                border: 1px solid var(--border, rgba(60, 60, 67, 0.12));
                border-radius: 22px;
                padding: 20px;
                margin-bottom: 18px;
                box-shadow: var(--shadow, 0 10px 30px rgba(15, 23, 42, 0.08));
            }

            .budget-summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 14px;
                margin: 18px 0;
            }

            .budget-summary-card {
                background: var(--surface-secondary, #f7f7fa);
                border: 1px solid var(--border, rgba(60, 60, 67, 0.10));
                border-radius: 18px;
                padding: 16px;
            }

            .budget-summary-card span {
                display: block;
                font-size: 0.84rem;
                opacity: 0.72;
                margin-bottom: 7px;
            }

            .budget-summary-card strong {
                font-size: 1.25rem;
            }

            .budget-progress {
                width: 100%;
                height: 14px;
                overflow: hidden;
                border-radius: 999px;
                background: rgba(120, 120, 120, 0.15);
            }

            .budget-progress-fill {
                height: 100%;
                width: 0;
                border-radius: inherit;
                transition: width 0.25s ease;
                background: linear-gradient(90deg, #34c759, #20a84a);
            }

            .budget-progress-fill.warning {
                background: linear-gradient(90deg, #ff9f0a, #f27b0a);
            }

            .budget-progress-fill.danger {
                background: linear-gradient(90deg, #ff453a, #d70015);
            }

            .budget-status-message {
                margin: 12px 0 0;
                font-weight: 600;
            }

            .budget-category-row {
                display: grid;
                grid-template-columns: minmax(120px, 1fr) minmax(90px, 130px) minmax(90px, 130px) auto;
                gap: 12px;
                align-items: center;
                padding: 14px 0;
                border-bottom: 1px solid rgba(120, 120, 120, 0.14);
            }

            .budget-category-row:last-child {
                border-bottom: 0;
            }

            .budget-category-row small {
                display: block;
                opacity: 0.68;
                margin-top: 3px;
            }

            .budget-delete-button {
                border: 0;
                background: transparent;
                cursor: pointer;
                font-size: 1.15rem;
            }

            .budget-empty {
                text-align: center;
                padding: 25px 10px;
                opacity: 0.72;
            }

            @media (max-width: 650px) {
                .budget-category-row {
                    grid-template-columns: 1fr 1fr;
                }

                .budget-delete-button {
                    justify-self: end;
                }
            }
        `;

        document.head.appendChild(
            style
        );

    },

    createView() {

        if (
            document.getElementById(
                "view-presupuesto"
            )
        ) {

            return;

        }

        const mainContent =
            document.querySelector(
                ".main-content"
            );

        if (!mainContent) {

            return;

        }

        const view =
            document.createElement(
                "section"
            );

        view.id =
            "view-presupuesto";

        view.className =
            "app-view";

        view.hidden =
            true;

        view.innerHTML = `
            <div class="view-header">
                <div>
                    <p class="view-eyebrow">
                        Control mensual
                    </p>

                    <h2>
                        Presupuesto mensual
                    </h2>

                    <p class="view-description">
                        Define límites y compáralos con tus gastos reales.
                    </p>
                </div>
            </div>

            <button
                id="back-from-budget"
                class="text-button"
                type="button"
            >
                ‹ Regresar a Más
            </button>

            <section class="budget-panel">
                <div class="budget-form-grid">
                    <div class="form-group">
                        <label for="budget-month">
                            Mes
                        </label>

                        <input
                            id="budget-month"
                            type="month"
                        >
                    </div>

                    <div class="form-group">
                        <label for="budget-general">
                            Presupuesto general
                        </label>

                        <input
                            id="budget-general"
                            type="number"
                            min="0"
                            step="0.01"
                            inputmode="decimal"
                            placeholder="0.00"
                        >
                    </div>
                </div>

                <button
                    id="save-general-budget"
                    class="primary-button"
                    type="button"
                >
                    Guardar presupuesto general
                </button>

                <p
                    id="budget-message"
                    class="form-message"
                    hidden
                ></p>
            </section>

            <section class="budget-panel">
                <h3>Resumen del mes</h3>

                <div class="budget-summary-grid">
                    <article class="budget-summary-card">
                        <span>Presupuesto</span>
                        <strong id="budget-summary-limit">$0.00</strong>
                    </article>

                    <article class="budget-summary-card">
                        <span>Gastado</span>
                        <strong id="budget-summary-spent">$0.00</strong>
                    </article>

                    <article class="budget-summary-card">
                        <span>Disponible</span>
                        <strong id="budget-summary-remaining">$0.00</strong>
                    </article>
                </div>

                <div class="budget-progress">
                    <div
                        id="budget-progress-fill"
                        class="budget-progress-fill"
                    ></div>
                </div>

                <p
                    id="budget-status-message"
                    class="budget-status-message"
                ></p>
            </section>

            <section class="budget-panel">
                <h3>Presupuesto por categoría</h3>

                <div class="budget-form-grid">
                    <div class="form-group">
                        <label for="budget-category">
                            Categoría
                        </label>

                        <select id="budget-category">
                            <option>Alimentación</option>
                            <option>Transporte</option>
                            <option>Vivienda</option>
                            <option>Servicios</option>
                            <option>Salud</option>
                            <option>Educación</option>
                            <option>Entretenimiento</option>
                            <option>Ropa</option>
                            <option>Deudas</option>
                            <option>Otros</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="budget-category-amount">
                            Límite de la categoría
                        </label>

                        <input
                            id="budget-category-amount"
                            type="number"
                            min="0"
                            step="0.01"
                            inputmode="decimal"
                            placeholder="0.00"
                        >
                    </div>
                </div>

                <button
                    id="save-category-budget"
                    class="primary-button"
                    type="button"
                >
                    Guardar categoría
                </button>

                <div id="budget-category-list"></div>
            </section>
        `;

        mainContent.appendChild(
            view
        );

    },

    createMenuButton() {

        const moreView =
            document.getElementById(
                "view-mas"
            );

        if (
            !moreView ||
            document.getElementById(
                "open-budget-view"
            )
        ) {

            return;

        }

        const button =
            document.createElement(
                "button"
            );

        button.id =
            "open-budget-view";

        button.type =
            "button";

        button.className =
            "menu-item";

        button.innerHTML = `
            <span class="menu-item-icon orange">
                💰
            </span>

            <span class="menu-item-content">
                <strong>
                    Presupuesto mensual
                </strong>

                <small>
                    Define límites y controla tus gastos
                </small>
            </span>

            <span class="menu-chevron">
                ›
            </span>
        `;

        const groups =
            moreView.querySelectorAll(
                ".menu-group"
            );

        const financeGroup =
            groups.length
                ? groups[0]
                : null;

        if (financeGroup) {

            financeGroup.appendChild(
                button
            );

        } else {

            moreView.appendChild(
                button
            );

        }

    },

    findElements() {

        this.elements = {
            month:
                document.getElementById(
                    "budget-month"
                ),

            general:
                document.getElementById(
                    "budget-general"
                ),

            saveGeneral:
                document.getElementById(
                    "save-general-budget"
                ),

            category:
                document.getElementById(
                    "budget-category"
                ),

            categoryAmount:
                document.getElementById(
                    "budget-category-amount"
                ),

            saveCategory:
                document.getElementById(
                    "save-category-budget"
                ),

            categoryList:
                document.getElementById(
                    "budget-category-list"
                ),

            message:
                document.getElementById(
                    "budget-message"
                ),

            summaryLimit:
                document.getElementById(
                    "budget-summary-limit"
                ),

            summarySpent:
                document.getElementById(
                    "budget-summary-spent"
                ),

            summaryRemaining:
                document.getElementById(
                    "budget-summary-remaining"
                ),

            progress:
                document.getElementById(
                    "budget-progress-fill"
                ),

            statusMessage:
                document.getElementById(
                    "budget-status-message"
                ),

            openButton:
                document.getElementById(
                    "open-budget-view"
                ),

            backButton:
                document.getElementById(
                    "back-from-budget"
                )
        };

        this.elements.month.value =
            this.selectedMonth;

    },

    configureEvents() {

        this.elements.openButton
            ?.addEventListener(
                "click",
                () => {

                    window.showView(
                        "presupuesto",
                        "Presupuesto mensual",
                        "Límites y control de gastos"
                    );

                    this.render();

                }
            );

        this.elements.backButton
            ?.addEventListener(
                "click",
                () => {

                    window.showView(
                        "mas",
                        "Más",
                        "Herramientas financieras"
                    );

                }
            );

        this.elements.month
            ?.addEventListener(
                "change",
                () => {

                    this.selectedMonth =
                        this.elements.month.value ||
                        BudgetManager
                            .getCurrentMonthKey();

                    this.render();

                }
            );

        this.elements.saveGeneral
            ?.addEventListener(
                "click",
                () => {

                    const result =
                        BudgetManager
                            .setGeneralBudget(
                                this.selectedMonth,
                                this.elements
                                    .general
                                    .value
                            );

                    this.showResult(
                        result
                    );

                    this.render();

                }
            );

        this.elements.saveCategory
            ?.addEventListener(
                "click",
                () => {

                    const result =
                        BudgetManager
                            .setCategoryBudget(
                                this.selectedMonth,
                                this.elements
                                    .category
                                    .value,
                                this.elements
                                    .categoryAmount
                                    .value
                            );

                    this.showResult(
                        result
                    );

                    if (
                        result.success
                    ) {

                        this.elements
                            .categoryAmount
                            .value = "";

                    }

                    this.render();

                }
            );

        this.elements.categoryList
            ?.addEventListener(
                "click",
                event => {

                    const button =
                        event.target.closest(
                            "[data-delete-budget-category]"
                        );

                    if (!button) {

                        return;

                    }

                    BudgetManager
                        .deleteCategoryBudget(
                            this.selectedMonth,
                            button.dataset
                                .deleteBudgetCategory
                        );

                    this.render();

                }
            );

    },

    render() {

        if (
            !this.elements.month
        ) {

            return;

        }

        this.elements.month.value =
            this.selectedMonth;

        this.elements.general.value =
            BudgetManager
                .getGeneralBudget(
                    this.selectedMonth
                ) || "";

        this.renderSummary();
        this.renderCategories();

        if (
            typeof Dashboard !==
            "undefined" &&
            typeof Dashboard.render ===
            "function"
        ) {

            Dashboard.render();

        }

    },

    renderSummary() {

        const summary =
            BudgetManager.getSummary(
                this.selectedMonth
            );

        this.elements.summaryLimit.textContent =
            this.formatCurrency(
                summary.budget
            );

        this.elements.summarySpent.textContent =
            this.formatCurrency(
                summary.spent
            );

        this.elements.summaryRemaining.textContent =
            this.formatCurrency(
                summary.remaining
            );

        const visualPercentage =
            Math.min(
                Math.max(
                    summary.percentage,
                    0
                ),
                100
            );

        const status =
            BudgetManager.getStatus(
                summary.percentage
            );

        this.elements.progress.style.width =
            `${visualPercentage}%`;

        this.elements.progress.className =
            `budget-progress-fill ${status}`;

        if (summary.budget <= 0) {

            this.elements.statusMessage.textContent =
                "Agrega un presupuesto general para comenzar.";

        } else if (
            summary.percentage >= 100
        ) {

            this.elements.statusMessage.textContent =
                `Has superado el presupuesto en ${this.formatCurrency(
                    Math.abs(
                        summary.remaining
                    )
                )}.`;

        } else {

            this.elements.statusMessage.textContent =
                `Has utilizado ${summary.percentage.toFixed(
                    1
                )}% del presupuesto.`;

        }

    },

    renderCategories() {

        const budgets =
            BudgetManager
                .getCategoryBudgets(
                    this.selectedMonth
                );

        const entries =
            Object.entries(
                budgets
            );

        if (
            entries.length === 0
        ) {

            this.elements.categoryList.innerHTML =
                `
                    <div class="budget-empty">
                        Aún no tienes límites por categoría.
                    </div>
                `;

            return;

        }

        this.elements.categoryList.innerHTML =
            entries
                .sort(
                    (
                        first,
                        second
                    ) =>
                        first[0].localeCompare(
                            second[0],
                            "es"
                        )
                )
                .map(
                    (
                        [
                            category,
                            limit
                        ]
                    ) => {

                        const spent =
                            BudgetManager
                                .getSpentByCategory(
                                    this.selectedMonth,
                                    category
                                );

                        const percentage =
                            limit > 0
                                ? (
                                    spent /
                                    limit
                                ) * 100
                                : 0;

                        return `
                            <div class="budget-category-row">
                                <div>
                                    <strong>${this.escapeHTML(category)}</strong>
                                    <small>${percentage.toFixed(1)}% utilizado</small>
                                </div>

                                <div>
                                    <small>Límite</small>
                                    <strong>${this.formatCurrency(limit)}</strong>
                                </div>

                                <div>
                                    <small>Gastado</small>
                                    <strong>${this.formatCurrency(spent)}</strong>
                                </div>

                                <button
                                    class="budget-delete-button"
                                    type="button"
                                    data-delete-budget-category="${this.escapeHTML(category)}"
                                    aria-label="Eliminar presupuesto"
                                >
                                    ×
                                </button>
                            </div>
                        `;

                    }
                )
                .join("");

    },

    showResult(result) {

        this.elements.message.textContent =
            result.success
                ? "Presupuesto guardado correctamente."
                : result.message;

        this.elements.message.hidden =
            false;

        window.setTimeout(
            () => {

                this.elements.message.hidden =
                    true;

            },
            2500
        );

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

    escapeHTML(value) {

        const element =
            document.createElement(
                "div"
            );

        element.textContent =
            String(value || "");

        return element.innerHTML;

    }

};

window.BudgetUI =
    BudgetUI;

BudgetUI.initialize();
