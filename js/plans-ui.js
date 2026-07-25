"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Interfaz de planes de pago
=====================================
*/

const PaymentPlansUI = {

    elements: {},

    editingPlanId: null,

    initialized: false,

    initialize() {

        if (this.initialized) {

            return;

        }

        this.createView();

        this.findElements();

        if (!this.elements.view) {

            console.error(
                "No se pudo crear la pantalla de planes de pago."
            );

            return;

        }

        this.configureEvents();

        this.hidePlansView();

        this.render();

        this.initialized =
            true;

    },

    createView() {

        if (
            document.getElementById(
                "view-planes"
            )
        ) {

            return;

        }

        const mainContent =
            document.querySelector(
                ".main-content"
            );

        if (!mainContent) {

            console.error(
                "No se encontró el contenido principal de la aplicación."
            );

            return;

        }

        const plansView =
            document.createElement(
                "section"
            );

        plansView.id =
            "view-planes";

        plansView.className =
            "app-view";

        plansView.hidden =
            true;

        plansView.innerHTML = `

            <div class="view-header">

                <div>

                    <p class="view-eyebrow">
                        Compras y créditos
                    </p>

                    <h2>
                        Planes de pago
                    </h2>

                    <p class="view-description">
                        Controla tus compras a meses,
                        mensualidades pagadas y saldos pendientes.
                    </p>

                </div>

                <button
                    id="open-plan-form"
                    class="primary-button"
                    type="button"
                >
                    + Agregar plan
                </button>

            </div>

            <button
                id="back-from-plans"
                class="text-button"
                type="button"
            >
                ‹ Regresar a Más
            </button>

            <section class="summary-grid">

                <article class="summary-card">

                    <span class="summary-label">
                        Pago mensual
                    </span>

                    <strong
                        id="plans-monthly-total"
                        class="summary-value"
                    >
                        $0.00
                    </strong>

                </article>

                <article class="summary-card">

                    <span class="summary-label">
                        Saldo pendiente
                    </span>

                    <strong
                        id="plans-remaining-total"
                        class="summary-value"
                    >
                        $0.00
                    </strong>

                </article>

                <article class="summary-card">

                    <span class="summary-label">
                        Planes activos
                    </span>

                    <strong
                        id="plans-active-total"
                        class="summary-value"
                    >
                        0
                    </strong>

                </article>

            </section>

            <div
                id="plans-empty-state"
                class="empty-state"
            >

                <div class="empty-state-icon">
                    🛍️
                </div>

                <h3>
                    Aún no tienes planes de pago
                </h3>

                <p>
                    Agrega una compra a meses para controlar
                    sus pagos y el saldo pendiente.
                </p>

            </div>

            <div
                id="plans-list"
                class="records-list"
            ></div>

            <div
                id="plan-modal"
                class="modal-overlay"
                hidden
            >

                <div
                    class="modal-card"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="plan-form-title"
                >

                    <div class="modal-header">

                        <div>

                            <p class="view-eyebrow">
                                Compra a mensualidades
                            </p>

                            <h3 id="plan-form-title">
                                Agregar plan de pago
                            </h3>

                        </div>

                        <button
                            id="close-plan-form"
                            class="icon-button"
                            type="button"
                            aria-label="Cerrar formulario"
                        >
                            ×
                        </button>

                    </div>

                    <form id="plan-form">

                        <div class="form-group">

                            <label for="plan-description">
                                Descripción de la compra
                            </label>

                            <input
                                id="plan-description"
                                name="description"
                                type="text"
                                placeholder="Ejemplo: Refrigerador"
                                autocomplete="off"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label for="plan-card-name">
                                Tarjeta utilizada
                            </label>

                            <input
                                id="plan-card-name"
                                name="card-name"
                                type="text"
                                placeholder="Ejemplo: BBVA Azul"
                                autocomplete="off"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label for="plan-total-amount">
                                Monto total de la compra
                            </label>

                            <input
                                id="plan-total-amount"
                                name="total-amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                inputmode="decimal"
                                placeholder="0.00"
                                required
                            >

                        </div>

                        <div class="form-grid">

                            <div class="form-group">

                                <label for="plan-total-installments">
                                    Mensualidades totales
                                </label>

                                <input
                                    id="plan-total-installments"
                                    name="total-installments"
                                    type="number"
                                    min="1"
                                    step="1"
                                    placeholder="Ejemplo: 12"
                                    required
                                >

                            </div>

                            <div class="form-group">

                                <label for="plan-paid-installments">
                                    Mensualidades pagadas
                                </label>

                                <input
                                    id="plan-paid-installments"
                                    name="paid-installments"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value="0"
                                    required
                                >

                            </div>

                        </div>

                        <div class="form-grid">

                            <div class="form-group">

                                <label for="plan-purchase-date">
                                    Fecha de compra
                                </label>

                                <input
                                    id="plan-purchase-date"
                                    name="purchase-date"
                                    type="date"
                                >

                            </div>

                            <div class="form-group">

                                <label for="plan-first-payment-date">
                                    Fecha del primer pago
                                </label>

                                <input
                                    id="plan-first-payment-date"
                                    name="first-payment-date"
                                    type="date"
                                >

                            </div>

                        </div>

                        <p
                            id="plan-form-message"
                            class="form-message"
                            hidden
                        ></p>

                        <div class="form-actions">

                            <button
                                id="cancel-plan-form"
                                class="secondary-button"
                                type="button"
                            >
                                Cancelar
                            </button>

                            <button
                                class="primary-button"
                                type="submit"
                            >
                                Guardar plan
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        `;

        mainContent.appendChild(
            plansView
        );

    },

    findElements() {

        this.elements = {

            view:
                document.getElementById(
                    "view-planes"
                ),

            openButton:
                document.getElementById(
                    "open-plan-form"
                ),

            backButton:
                document.getElementById(
                    "back-from-plans"
                ),

            modal:
                document.getElementById(
                    "plan-modal"
                ),

            closeButton:
                document.getElementById(
                    "close-plan-form"
                ),

            cancelButton:
                document.getElementById(
                    "cancel-plan-form"
                ),

            form:
                document.getElementById(
                    "plan-form"
                ),

            formTitle:
                document.getElementById(
                    "plan-form-title"
                ),

            descriptionInput:
                document.getElementById(
                    "plan-description"
                ),

            cardNameInput:
                document.getElementById(
                    "plan-card-name"
                ),

            totalAmountInput:
                document.getElementById(
                    "plan-total-amount"
                ),

            totalInstallmentsInput:
                document.getElementById(
                    "plan-total-installments"
                ),

            paidInstallmentsInput:
                document.getElementById(
                    "plan-paid-installments"
                ),

            purchaseDateInput:
                document.getElementById(
                    "plan-purchase-date"
                ),

            firstPaymentDateInput:
                document.getElementById(
                    "plan-first-payment-date"
                ),

            message:
                document.getElementById(
                    "plan-form-message"
                ),

            monthlyTotal:
                document.getElementById(
                    "plans-monthly-total"
                ),

            remainingTotal:
                document.getElementById(
                    "plans-remaining-total"
                ),

            activeTotal:
                document.getElementById(
                    "plans-active-total"
                ),

            list:
                document.getElementById(
                    "plans-list"
                ),

            emptyState:
                document.getElementById(
                    "plans-empty-state"
                )

        };

    },

    configureEvents() {

        this.elements.openButton
            ?.addEventListener(
                "click",
                () => {

                    this.openForm();

                }
            );

        this.elements.backButton
            ?.addEventListener(
                "click",
                () => {

                    this.openView(
                        "mas",
                        "Más",
                        "Herramientas financieras"
                    );

                }
            );

        this.elements.closeButton
            ?.addEventListener(
                "click",
                () => {

                    this.closeForm();

                }
            );

        this.elements.cancelButton
            ?.addEventListener(
                "click",
                () => {

                    this.closeForm();

                }
            );

        this.elements.form
            ?.addEventListener(
                "submit",
                event => {

                    this.handleSubmit(
                        event
                    );

                }
            );

        this.elements.modal
            ?.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        this.elements.modal
                    ) {

                        this.closeForm();

                    }

                }
            );

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape" &&
                    this.elements.modal &&
                    !this.elements.modal.hidden
                ) {

                    this.closeForm();

                }

            }
        );

        const commitmentsButton =
            this.findCommitmentsButton();

        commitmentsButton
            ?.addEventListener(
                "click",
                () => {

                    this.openView(
                        "planes",
                        "Planes de pago",
                        "Compras, créditos y mensualidades"
                    );

                }
            );
},

    findCommitmentsButton() {

        const menuButtons =
            document.querySelectorAll(
                "#view-mas .menu-item"
            );

        return Array.from(
            menuButtons
        ).find(
            button => {

                const title =
                    button.querySelector(
                        "strong"
                    );

                return (
                    title &&
                    title.textContent
                        .trim() ===
                        "Compromisos"
                );

            }
        ) || null;

    },

    showPlansView() {

        if (!this.elements.view) {

            return;

        }

        this.elements.view.hidden =
            false;

        this.elements.view.classList.add(
            "active"
        );

    },

    hidePlansView() {

        if (!this.elements.view) {

            return;

        }

        this.elements.view.hidden =
            true;

        this.elements.view.classList.remove(
            "active"
        );

    },

    openView(
        viewName,
        title,
        subtitle
    ) {

        if (
            typeof window.showView !==
            "function"
        ) {

            console.error(
                "El controlador principal de navegación no está disponible."
            );

            return;

        }

        window.showView(
            viewName,
            title,
            subtitle
        );

        if (
            viewName === "planes"
        ) {

            this.render();

        }

    },

    openForm(plan = null) {

        this.clearMessage();

        this.editingPlanId =
            plan ? plan.id : null;

        if (plan) {

            this.elements.formTitle.textContent =
                "Editar plan de pago";

            this.elements.descriptionInput.value =
                plan.description;

            this.elements.cardNameInput.value =
                plan.cardName;

            this.elements.totalAmountInput.value =
                plan.totalAmount;

            this.elements.totalInstallmentsInput.value =
                plan.totalInstallments;

            this.elements.paidInstallmentsInput.value =
                plan.paidInstallments;

            this.elements.purchaseDateInput.value =
                plan.purchaseDate;

            this.elements.firstPaymentDateInput.value =
                plan.firstPaymentDate;

        } else {

            this.elements.formTitle.textContent =
                "Agregar plan de pago";

            this.elements.form.reset();

            this.elements.paidInstallmentsInput.value =
                "0";

        }

        this.elements.modal.hidden =
            false;

        document.body.style.overflow =
            "hidden";

        this.elements.descriptionInput.focus();

    },

    closeForm() {

        this.editingPlanId =
            null;

        this.elements.modal.hidden =
            true;

        document.body.style.overflow =
            "";

        this.elements.form.reset();

        this.elements.formTitle.textContent =
            "Agregar plan de pago";

        this.elements.paidInstallmentsInput.value =
            "0";

        this.clearMessage();

    },

    handleSubmit(event) {

        event.preventDefault();

        const planData = {

            description:
                this.elements.descriptionInput.value,

            cardName:
                this.elements.cardNameInput.value,

            totalAmount:
                this.elements.totalAmountInput.value,

            totalInstallments:
                this.elements.totalInstallmentsInput.value,

            paidInstallments:
                this.elements.paidInstallmentsInput.value,

            purchaseDate:
                this.elements.purchaseDateInput.value,

            firstPaymentDate:
                this.elements.firstPaymentDateInput.value

        };

        let result;

        if (this.editingPlanId) {

            result =
                PaymentPlanManager.updatePlan(
                    this.editingPlanId,
                    planData
                );

        } else {

            result =
                PaymentPlanManager.createPlan(
                    planData
                );

        }

        if (!result.success) {

            this.showMessage(
                result.message
            );

            return;

        }

        this.closeForm();

        this.render();

        this.refreshDashboard();

    },

    render() {

        if (
            !this.elements.list ||
            !this.elements.emptyState
        ) {

            return;

        }

        const plans =
            PaymentPlanManager.getAll();

        const activePlans =
            PaymentPlanManager.getActivePlans();

        this.elements.monthlyTotal.textContent =
            this.formatCurrency(
                PaymentPlanManager
                    .getTotalMonthlyPayments()
            );

        this.elements.remainingTotal.textContent =
            this.formatCurrency(
                PaymentPlanManager
                    .getTotalRemainingBalance()
            );

        this.elements.activeTotal.textContent =
            String(
                activePlans.length
            );

        this.elements.emptyState.hidden =
            plans.length > 0;

        this.renderPlans(
            plans
        );

    },

    renderPlans(plans) {

        this.elements.list.innerHTML =
            "";

        plans.forEach(
            plan => {

                const monthlyPayment =
                    PaymentPlanManager
                        .getMonthlyPayment(
                            plan
                        );

                const remainingInstallments =
                    PaymentPlanManager
                        .getRemainingInstallments(
                            plan
                        );

                const remainingBalance =
                    PaymentPlanManager
                        .getRemainingBalance(
                            plan
                        );

                const completed =
                    remainingInstallments === 0;

                const progressPercentage =
                    plan.totalInstallments > 0
                        ? (
                            plan.paidInstallments /
                            plan.totalInstallments
                        ) * 100
                        : 0;

                const planElement =
                    document.createElement(
                        "article"
                    );

                planElement.className =
                    "record-card";

                planElement.innerHTML = `

                    <div class="record-card-header">

                        <div>

                            <p class="record-category">
                                ${this.escapeHTML(plan.cardName)}
                            </p>

                            <h3>
                                ${this.escapeHTML(plan.description)}
                            </h3>

                        </div>

                        <div class="record-card-actions">

                            <button
                                class="edit-record-button"
                                type="button"
                                data-edit-plan-id="${plan.id}"
                            >
                                Editar
                            </button>

                            <button
                                class="delete-record-button"
                                type="button"
                                data-delete-plan-id="${plan.id}"
                                aria-label="Eliminar plan"
                            >
                                ×
                            </button>

                        </div>

                    </div>

                    <div class="card-financial-grid">

                        <div>

                            <span>
                                Pago mensual
                            </span>

                            <strong>
                                ${this.formatCurrency(monthlyPayment)}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Pagadas
                            </span>

                            <strong>
                                ${plan.paidInstallments}
                                de
                                ${plan.totalInstallments}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Saldo pendiente
                            </span>

                            <strong>
                                ${this.formatCurrency(remainingBalance)}
                            </strong>

                        </div>

                    </div>

                    <div class="progress-track">

                        <div
                            class="progress-fill"
                            style="
                                width:
                                ${Math.min(
                                    progressPercentage,
                                    100
                                )}%;
                            "
                        ></div>

                    </div>

                    <div class="record-card-footer">

                        <span>
                            ${
                                completed
                                    ? "Plan terminado"
                                    : remainingInstallments +
                                      " mensualidades pendientes"
                            }
                        </span>

                        <div class="record-card-actions">

                            <button
                                class="secondary-button"
                                type="button"
                                data-undo-plan-id="${plan.id}"
                                ${
                                    plan.paidInstallments <= 0
                                        ? "disabled"
                                        : ""
                                }
                            >
                                Deshacer pago
                            </button>

                            <button
                                class="primary-button"
                                type="button"
                                data-pay-plan-id="${plan.id}"
                                ${
                                    completed
                                        ? "disabled"
                                        : ""
                                }
                            >
                                Registrar pago
                            </button>

                        </div>

                    </div>

                `;

                planElement
                    .querySelector(
                        "[data-edit-plan-id]"
                    )
                    ?.addEventListener(
                        "click",
                        () => {

                            this.openForm(
                                plan
                            );

                        }
                    );

                planElement
                    .querySelector(
                        "[data-delete-plan-id]"
                    )
                    ?.addEventListener(
                        "click",
                        () => {

                            this.deletePlan(
                                plan.id
                            );

                        }
                    );

                planElement
                    .querySelector(
                        "[data-pay-plan-id]"
                    )
                    ?.addEventListener(
                        "click",
                        () => {

                            this.registerPayment(
                                plan.id
                            );

                        }
                    );

                planElement
                    .querySelector(
                        "[data-undo-plan-id]"
                    )
                    ?.addEventListener(
                        "click",
                        () => {

                            this.undoPayment(
                                plan.id
                            );

                        }
                    );

                this.elements.list.appendChild(
                    planElement
                );

            }
        );

    },

    registerPayment(planId) {

        const result =
            PaymentPlanManager.registerPayment(
                planId
            );

        if (!result.success) {

            window.alert(
                result.message
            );

            return;

        }

        this.render();

        this.refreshDashboard();

    },

    undoPayment(planId) {

        const result =
            PaymentPlanManager.undoPayment(
                planId
            );

        if (!result.success) {

            window.alert(
                result.message
            );

            return;

        }

        this.render();

        this.refreshDashboard();

    },

    deletePlan(planId) {

        const confirmed =
            window.confirm(
                "¿Deseas eliminar este plan de pago?"
            );

        if (!confirmed) {

            return;

        }

        const result =
            PaymentPlanManager.deletePlan(
                planId
            );

        if (!result.success) {

            window.alert(
                result.message
            );

            return;

        }

        this.render();

        this.refreshDashboard();

    },

    refreshDashboard() {

        if (
            typeof Dashboard !==
            "undefined" &&
            typeof Dashboard.render ===
            "function"
        ) {

            Dashboard.render();

        }

    },

    showMessage(message) {

        this.elements.message.textContent =
            message;

        this.elements.message.hidden =
            false;

    },

    clearMessage() {

        this.elements.message.textContent =
            "";

        this.elements.message.hidden =
            true;

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

window.PaymentPlansUI =
    PaymentPlansUI;

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            PaymentPlansUI.initialize();

        }
    );

} else {

    PaymentPlansUI.initialize();

}