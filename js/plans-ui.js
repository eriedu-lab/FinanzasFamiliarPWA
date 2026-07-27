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

                            <select
                                id="plan-card-name"
                                name="card-name"
                                required
                            >
                                <option value="">Selecciona una tarjeta</option>
                            </select>

                            <small class="field-help">
                                El plan se ligará a la tarjeta seleccionada y actualizará su crédito utilizado y disponible.
                            </small>

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

                            <div class="form-group calculated-payment-note">
                                <label>Primer pago calculado automáticamente</label>
                                <p>Se calculará con la fecha de compra, el día de corte y el día de pago de la tarjeta.</p>
                                <input id="plan-first-payment-date" type="hidden">
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

        const activePlansCard =
            this.elements.activeTotal
                ?.closest(".summary-card");

        if (activePlansCard) {

            activePlansCard.classList.add(
                "interactive-summary-card"
            );

            activePlansCard.setAttribute(
                "role",
                "button"
            );

            activePlansCard.setAttribute(
                "tabindex",
                "0"
            );

            const revealPlans = () => {

                const groups =
                    this.elements.list
                        ?.querySelectorAll(
                            ".plan-card-group"
                        );

                groups?.forEach(
                    group => {
                        group.open = true;
                    }
                );

                this.elements.list
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

            };

            activePlansCard.addEventListener(
                "click",
                revealPlans
            );

            activePlansCard.addEventListener(
                "keydown",
                event => {
                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {
                        event.preventDefault();
                        revealPlans();
                    }
                }
            );

        }

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

    findCardIdByName(cardName) {
        if (typeof CardManager === "undefined") return "";
        const match = CardManager.getAll().find(card => card.name === cardName);
        return match?.id || "";
    },

    populateCardOptions(plan = null) {

        const select = this.elements.cardNameInput;
        if (!select) return;

        const cards = (typeof CardManager !== "undefined")
            ? CardManager.getAll()
            : [];

        const selectedValue = plan?.cardId || "";
        const legacyName = plan?.cardName || "";

        select.innerHTML = '<option value="">Selecciona una tarjeta</option>';

        cards.forEach(card => {
            const option = document.createElement("option");
            option.value = card.id;
            option.textContent = `${card.name}${card.bank ? " · " + card.bank : ""}`;
            if (card.id === selectedValue || (!selectedValue && card.name === legacyName)) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        if (!cards.length) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Primero agrega una tarjeta";
            option.disabled = true;
            select.appendChild(option);
        }

    },

    openForm(plan = null) {

        this.clearMessage();
        this.populateCardOptions(plan);

        this.editingPlanId =
            plan ? plan.id : null;

        if (plan) {

            this.elements.formTitle.textContent =
                "Editar plan de pago";

            this.elements.descriptionInput.value =
                plan.description;

            this.elements.cardNameInput.value =
                plan.cardId || this.findCardIdByName(plan.cardName) || "";

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

            cardId:
                this.elements.cardNameInput.value,

            cardName:
                (typeof CardManager !== "undefined"
                    ? CardManager.getById(this.elements.cardNameInput.value)?.name
                    : "") || "",

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
        this.elements.list.innerHTML = "";
        const groups = new Map();
        plans.forEach(plan => {
            const key = plan.cardId || plan.cardName || "sin-tarjeta";
            if (!groups.has(key)) groups.set(key, { name: plan.cardName || "Sin tarjeta", plans: [] });
            groups.get(key).plans.push(plan);
        });
        groups.forEach(group => {
            const section = document.createElement("details");
            section.className = "plan-card-group";
            section.open = true;
            const remaining = group.plans.reduce((sum,p)=>sum+PaymentPlanManager.getRemainingBalance(p),0);
            section.innerHTML = `<summary><span><strong>${this.escapeHTML(group.name)}</strong><small>${group.plans.length} plan${group.plans.length===1?"":"es"}</small></span><b>${this.formatCurrency(remaining)}</b></summary><div class="plan-group-content"></div>`;
            const content = section.querySelector(".plan-group-content");
            group.plans.forEach(plan => {
                const monthlyPayment=PaymentPlanManager.getMonthlyPayment(plan);
                const remainingInstallments=PaymentPlanManager.getRemainingInstallments(plan);
                const remainingBalance=PaymentPlanManager.getRemainingBalance(plan);
                const completed=remainingInstallments===0;
                const progressPercentage=plan.totalInstallments>0?(plan.paidInstallments/plan.totalInstallments)*100:0;
                const el=document.createElement("article"); el.className="record-card compact-plan-card";
                el.innerHTML=`<div class="record-card-header"><div><h3>${this.escapeHTML(plan.description)}</h3><p class="record-category">Primer pago: ${this.formatDate(plan.firstPaymentDate || PaymentPlanManager.calculateFirstPaymentDate(plan.purchaseDate,plan.cardId))}</p></div><div class="record-card-actions"><button class="edit-record-button" type="button" data-edit-plan-id="${plan.id}">✎ Editar</button><button class="delete-record-button" type="button" data-delete-plan-id="${plan.id}" aria-label="Eliminar plan">🗑</button></div></div><div class="card-financial-grid"><div><span>Mensualidad</span><strong>${this.formatCurrency(monthlyPayment)}</strong></div><div><span>Pagadas</span><strong>${plan.paidInstallments} de ${plan.totalInstallments}</strong></div><div><span>Pendiente</span><strong>${this.formatCurrency(remainingBalance)}</strong></div></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(progressPercentage,100)}%"></div></div><div class="record-card-footer"><span>${completed?"Plan terminado":remainingInstallments+" mensualidades pendientes"}</span><div class="record-card-actions"><button class="secondary-button" type="button" data-undo-plan-id="${plan.id}" ${plan.paidInstallments<=0?"disabled":""}>Deshacer</button><button class="primary-button" type="button" data-pay-plan-id="${plan.id}" ${completed?"disabled":""}>Registrar pago</button></div></div>`;
                el.querySelector("[data-edit-plan-id]")?.addEventListener("click",()=>this.openForm(plan));
                el.querySelector("[data-delete-plan-id]")?.addEventListener("click",()=>this.deletePlan(plan.id));
                el.querySelector("[data-pay-plan-id]")?.addEventListener("click",()=>this.registerPayment(plan.id));
                el.querySelector("[data-undo-plan-id]")?.addEventListener("click",()=>this.undoPayment(plan.id));
                content.appendChild(el);
            });
            this.elements.list.appendChild(section);
        });
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

        if (typeof Dashboard !== "undefined" && typeof Dashboard.render === "function") {
            Dashboard.render();
        }
        if (typeof CardsUI !== "undefined" && typeof CardsUI.render === "function") {
            CardsUI.render();
        }
        if (window.FinancialCalendarUI && typeof window.FinancialCalendarUI.renderCalendar === "function") {
            window.FinancialCalendarUI.renderCalendar();
        }
        document.dispatchEvent(new CustomEvent("finance-data-changed"));

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

    formatDate(dateValue) {

        if (!dateValue) {

            return "Pendiente de calcular";

        }

        const parts =
            String(dateValue)
                .split("-")
                .map(Number);

        if (
            parts.length !== 3 ||
            parts.some(
                value => !Number.isFinite(value)
            )
        ) {

            return String(dateValue);

        }

        const date =
            new Date(
                parts[0],
                parts[1] - 1,
                parts[2]
            );

        return new Intl.DateTimeFormat(
            "es-MX",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ).format(date);

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