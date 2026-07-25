"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Interfaz de metas de ahorro
=====================================
*/

const GoalsUI = {

    elements: {},

    editingGoalId: null,

    contributionGoalId: null,

    initialize() {

        this.elements = {

            view:
                document.getElementById(
                    "view-metas"
                ),

            openButton:
                document.getElementById(
                    "open-goal-form"
                ),

            modal:
                document.getElementById(
                    "goal-modal"
                ),

            closeButton:
                document.getElementById(
                    "close-goal-form"
                ),

            cancelButton:
                document.getElementById(
                    "cancel-goal-form"
                ),

            form:
                document.getElementById(
                    "goal-form"
                ),

            formTitle:
                document.getElementById(
                    "goal-form-title"
                ),

            nameInput:
                document.getElementById(
                    "goal-name"
                ),

            targetInput:
                document.getElementById(
                    "goal-target"
                ),

            initialInput:
                document.getElementById(
                    "goal-initial"
                ),

            deadlineInput:
                document.getElementById(
                    "goal-deadline"
                ),

            message:
                document.getElementById(
                    "goal-form-message"
                ),

            totalTarget:
                document.getElementById(
                    "goals-total-target"
                ),

            totalSaved:
                document.getElementById(
                    "goals-total-saved"
                ),

            totalRemaining:
                document.getElementById(
                    "goals-total-remaining"
                ),

            emptyState:
                document.getElementById(
                    "goals-empty-state"
                ),

            list:
                document.getElementById(
                    "goals-list"
                ),

            contributionModal:
                document.getElementById(
                    "contribution-modal"
                ),

            contributionForm:
                document.getElementById(
                    "contribution-form"
                ),

            contributionAmount:
                document.getElementById(
                    "contribution-amount"
                ),

            contributionNote:
                document.getElementById(
                    "contribution-note"
                ),

            contributionMessage:
                document.getElementById(
                    "contribution-form-message"
                ),

            closeContribution:
                document.getElementById(
                    "close-contribution-form"
                ),

            cancelContribution:
                document.getElementById(
                    "cancel-contribution-form"
                )

        };

        if (!this.elements.view) {

            return;

        }

        this.injectStyles();

        this.configureEvents();

        this.render();

    },

    configureEvents() {

        document
            .querySelectorAll(
                '[data-navigation="metas"]'
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

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

                }
            );

        this.elements.openButton
            ?.addEventListener(
                "click",
                () =>
                    this.openGoalForm()
            );

        this.elements.closeButton
            ?.addEventListener(
                "click",
                () =>
                    this.closeGoalForm()
            );

        this.elements.cancelButton
            ?.addEventListener(
                "click",
                () =>
                    this.closeGoalForm()
            );

        this.elements.form
            ?.addEventListener(
                "submit",
                event =>
                    this.handleGoalSubmit(
                        event
                    )
            );

        this.elements.closeContribution
            ?.addEventListener(
                "click",
                () =>
                    this.closeContributionForm()
            );

        this.elements.cancelContribution
            ?.addEventListener(
                "click",
                () =>
                    this.closeContributionForm()
            );

        this.elements.contributionForm
            ?.addEventListener(
                "submit",
                event =>
                    this.handleContributionSubmit(
                        event
                    )
            );

    },

    openGoalForm(goal = null) {

        this.clearMessage();

        this.editingGoalId =
            goal ? goal.id : null;

        if (goal) {

            this.elements.formTitle
                .textContent =
                    "Editar meta";

            this.elements.nameInput.value =
                goal.name;

            this.elements.targetInput.value =
                goal.target;

            this.elements.initialInput.value =
                goal.saved;

            this.elements.initialInput.disabled =
                true;

            this.elements.deadlineInput.value =
                goal.deadline;

        } else {

            this.elements.formTitle
                .textContent =
                    "Agregar meta";

            this.elements.form.reset();

            this.elements.initialInput.value =
                "0";

            this.elements.initialInput.disabled =
                false;

            this.elements.deadlineInput.value =
                this.getDefaultDeadline();

        }

        this.elements.modal.hidden =
            false;

        document.body.style.overflow =
            "hidden";

        this.elements.nameInput.focus();

    },

    closeGoalForm() {

        this.editingGoalId =
            null;

        this.elements.modal.hidden =
            true;

        document.body.style.overflow =
            "";

        this.elements.form.reset();

        this.elements.initialInput.disabled =
            false;

        this.clearMessage();

    },

    handleGoalSubmit(event) {

        event.preventDefault();

        const data = {

            name:
                this.elements.nameInput.value,

            target:
                this.elements.targetInput.value,

            saved:
                this.elements.initialInput.value,

            deadline:
                this.elements.deadlineInput.value

        };

        const result =
            this.editingGoalId
                ? GoalManager.updateGoal(
                    this.editingGoalId,
                    data
                )
                : GoalManager.createGoal(
                    data
                );

        if (!result.success) {

            this.showMessage(
                result.message
            );

            return;

        }

        this.closeGoalForm();

        this.refreshAll();

    },

    openContributionForm(goalId) {

        this.contributionGoalId =
            goalId;

        this.elements
            .contributionForm
            .reset();

        this.clearContributionMessage();

        this.elements
            .contributionModal
            .hidden =
                false;

        document.body.style.overflow =
            "hidden";

        this.elements
            .contributionAmount
            .focus();

    },

    closeContributionForm() {

        this.contributionGoalId =
            null;

        this.elements
            .contributionModal
            .hidden =
                true;

        document.body.style.overflow =
            "";

        this.elements
            .contributionForm
            .reset();

        this.clearContributionMessage();

    },

    handleContributionSubmit(event) {

        event.preventDefault();

        const result =
            GoalManager.addContribution(
                this.contributionGoalId,
                this.elements
                    .contributionAmount
                    .value,
                this.elements
                    .contributionNote
                    .value
            );

        if (!result.success) {

            this.showContributionMessage(
                result.message
            );

            return;

        }

        this.closeContributionForm();

        this.refreshAll();

    },

    render() {

        const goals =
            GoalManager.getAll();

        const summary =
            GoalManager.getSummary();

        this.elements.totalTarget
            .textContent =
                this.formatCurrency(
                    summary.target
                );

        this.elements.totalSaved
            .textContent =
                this.formatCurrency(
                    summary.saved
                );

        this.elements.totalRemaining
            .textContent =
                this.formatCurrency(
                    summary.remaining
                );

        this.elements.emptyState.hidden =
            goals.length > 0;

        this.elements.list.innerHTML =
            "";

        goals.forEach(
            goal =>
                this.renderGoal(goal)
        );

    },

    renderGoal(goal) {

        const progress =
            GoalManager.getProgress(
                goal
            );

        const article =
            document.createElement(
                "article"
            );

        article.className =
            "record-card goal-card";

        const deadlineStatus =
            this.getDeadlineStatus(
                goal.deadline,
                progress.completed
            );

        const contributions =
            Array.isArray(
                goal.contributions
            )
                ? goal.contributions
                : [];

        article.innerHTML = `

            <div class="record-card-header">

                <div>

                    <p class="record-category">
                        ${deadlineStatus.label}
                    </p>

                    <h3>
                        ${this.escapeHTML(goal.name)}
                    </h3>

                </div>

                <div class="record-card-actions">

                    <button
                        class="edit-record-button"
                        type="button"
                        data-edit-goal
                    >
                        Editar
                    </button>

                    <button
                        class="delete-record-button"
                        type="button"
                        data-delete-goal
                        aria-label="Eliminar meta"
                    >
                        ×
                    </button>

                </div>

            </div>

            <div class="goal-amount-row">

                <div>

                    <span>
                        Ahorrado
                    </span>

                    <strong>
                        ${this.formatCurrency(progress.saved)}
                    </strong>

                </div>

                <div>

                    <span>
                        Objetivo
                    </span>

                    <strong>
                        ${this.formatCurrency(progress.target)}
                    </strong>

                </div>

                <div>

                    <span>
                        Faltante
                    </span>

                    <strong>
                        ${this.formatCurrency(progress.remaining)}
                    </strong>

                </div>

            </div>

            <div class="goal-progress-heading">

                <span>
                    ${progress.percentage.toFixed(1)}% completado
                </span>

                <span>
                    ${deadlineStatus.text}
                </span>

            </div>

            <div class="progress-track">

                <div
                    class="progress-fill"
                    style="width: ${progress.percentage}%;"
                ></div>

            </div>

            <button
                class="primary-button goal-contribution-button"
                type="button"
                data-add-contribution
            >
                + Registrar aportación
            </button>

            <details class="goal-history">

                <summary>
                    Historial de aportaciones (${contributions.length})
                </summary>

                <div class="goal-history-list">

                    ${
                        contributions.length
                            ? contributions
                                .map(
                                    item => `
                                        <div class="goal-history-item">

                                            <div>

                                                <strong>
                                                    ${this.formatCurrency(item.amount)}
                                                </strong>

                                                <span>
                                                    ${this.escapeHTML(item.note)}
                                                </span>

                                                <small>
                                                    ${this.formatDate(item.date)}
                                                </small>

                                            </div>

                                            <button
                                                type="button"
                                                class="delete-record-button"
                                                data-delete-contribution="${item.id}"
                                                aria-label="Eliminar aportación"
                                            >
                                                ×
                                            </button>

                                        </div>
                                    `
                                )
                                .join("")
                            : `
                                <p class="secondary-text">
                                    Todavía no hay aportaciones.
                                </p>
                            `
                    }

                </div>

            </details>

        `;

        article
            .querySelector(
                "[data-edit-goal]"
            )
            ?.addEventListener(
                "click",
                () =>
                    this.openGoalForm(goal)
            );

        article
            .querySelector(
                "[data-delete-goal]"
            )
            ?.addEventListener(
                "click",
                () =>
                    this.deleteGoal(
                        goal.id
                    )
            );

        article
            .querySelector(
                "[data-add-contribution]"
            )
            ?.addEventListener(
                "click",
                () =>
                    this.openContributionForm(
                        goal.id
                    )
            );

        article
            .querySelectorAll(
                "[data-delete-contribution]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () =>
                            this.deleteContribution(
                                goal.id,
                                button.dataset
                                    .deleteContribution
                            )
                    );

                }
            );

        this.elements.list
            .appendChild(article);

    },

    deleteGoal(goalId) {

        const confirmed =
            window.confirm(
                "¿Deseas eliminar esta meta y todo su historial?"
            );

        if (!confirmed) {

            return;

        }

        GoalManager.deleteGoal(
            goalId
        );

        this.refreshAll();

    },

    deleteContribution(
        goalId,
        contributionId
    ) {

        const confirmed =
            window.confirm(
                "¿Deseas eliminar esta aportación?"
            );

        if (!confirmed) {

            return;

        }

        GoalManager.deleteContribution(
            goalId,
            contributionId
        );

        this.refreshAll();

    },

    refreshAll() {

        this.render();

        if (
            window.Dashboard &&
            typeof window.Dashboard
                .render ===
                "function"
        ) {

            window.Dashboard.render();

        }

    },

    getDeadlineStatus(
        deadline,
        completed
    ) {

        const targetDate =
            new Date(
                `${deadline}T23:59:59`
            );

        const today =
            new Date();

        const days =
            Math.ceil(
                (
                    targetDate -
                    today
                ) /
                86400000
            );

        if (completed) {

            return {

                label:
                    "Meta completada",

                text:
                    "Objetivo alcanzado"

            };

        }

        if (days < 0) {

            return {

                label:
                    "Fecha vencida",

                text:
                    `Venció hace ${Math.abs(days)} días`

            };

        }

        if (days === 0) {

            return {

                label:
                    "Vence hoy",

                text:
                    "Último día"

            };

        }

        return {

            label:
                "Meta activa",

            text:
                `${days} días restantes`

        };

    },

    getDefaultDeadline() {

        const date =
            new Date();

        date.setMonth(
            date.getMonth() + 6
        );

        return date
            .toISOString()
            .slice(0, 10);

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
            new Date(value);

        return new Intl.DateTimeFormat(
            "es-MX",
            {
                dateStyle:
                    "medium"
            }
        ).format(date);

    },

    showMessage(message) {

        this.elements.message
            .textContent =
                message;

        this.elements.message.hidden =
            false;

    },

    clearMessage() {

        this.elements.message
            .textContent =
                "";

        this.elements.message.hidden =
            true;

    },

    showContributionMessage(message) {

        this.elements
            .contributionMessage
            .textContent =
                message;

        this.elements
            .contributionMessage
            .hidden =
                false;

    },

    clearContributionMessage() {

        this.elements
            .contributionMessage
            .textContent =
                "";

        this.elements
            .contributionMessage
            .hidden =
                true;

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
                "goals-module-styles"
            )
        ) {

            return;

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "goals-module-styles";

        style.textContent = `

            .goal-card {
                display: grid;
                gap: 16px;
            }

            .goal-amount-row {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 10px;
            }

            .goal-amount-row div {
                padding: 12px;
                border-radius: 12px;
                background: #f8fafc;
            }

            .goal-amount-row span,
            .goal-progress-heading span,
            .goal-history-item span,
            .goal-history-item small {
                display: block;
                color: #64748b;
            }

            .goal-amount-row strong {
                display: block;
                margin-top: 4px;
            }

            .goal-progress-heading {
                display: flex;
                justify-content: space-between;
                gap: 12px;
                font-size: 0.86rem;
            }

            .goal-contribution-button {
                width: 100%;
            }

            .goal-history {
                border-top: 1px solid #e2e8f0;
                padding-top: 14px;
            }

            .goal-history summary {
                cursor: pointer;
                font-weight: 800;
            }

            .goal-history-list {
                display: grid;
                gap: 10px;
                margin-top: 12px;
            }

            .goal-history-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 14px;
                padding: 12px;
                border-radius: 12px;
                background: #f8fafc;
            }

            .goal-history-item small {
                margin-top: 3px;
            }

            #view-metas .progress-fill {
                background: #16a34a;
            }

            @media (max-width: 650px) {

                .goal-amount-row {
                    grid-template-columns: 1fr;
                }

                .goal-progress-heading {
                    display: grid;
                }

            }

        `;

        document.head
            .appendChild(style);

    }

};

window.GoalsUI =
    GoalsUI;

document.addEventListener(
    "DOMContentLoaded",
    function () {

        GoalsUI.initialize();

    }
);
