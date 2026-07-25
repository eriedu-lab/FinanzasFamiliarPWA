"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Interfaz de Tarjetas
=====================================
*/

const CardsUI = {

    elements: {},

    editingCardId: null,

    initialize() {

        this.elements = {

            view:
                document.getElementById(
                    "view-tarjetas"
                ),

            openButton:
                document.getElementById(
                    "open-card-form"
                ),

            modal:
                document.getElementById(
                    "card-modal"
                ),

            closeButton:
                document.getElementById(
                    "close-card-form"
                ),

            cancelButton:
                document.getElementById(
                    "cancel-card-form"
                ),

            form:
                document.getElementById(
                    "card-form"
                ),

            formTitle:
                document.getElementById(
                    "card-form-title"
                ),

            nameInput:
                document.getElementById(
                    "card-name"
                ),

            bankInput:
                document.getElementById(
                    "card-bank"
                ),

            limitInput:
                document.getElementById(
                    "card-limit"
                ),

            usedInput:
                document.getElementById(
                    "card-used"
                ),

            cutDayInput:
                document.getElementById(
                    "card-cut-day"
                ),

            dueDayInput:
                document.getElementById(
                    "card-due-day"
                ),

            colorInput:
                document.getElementById(
                    "card-color"
                ),

            message:
                document.getElementById(
                    "card-form-message"
                ),

            totalLimit:
                document.getElementById(
                    "cards-total-limit"
                ),

            totalUsed:
                document.getElementById(
                    "cards-total-used"
                ),

            totalAvailable:
                document.getElementById(
                    "cards-total-available"
                ),

            list:
                document.getElementById(
                    "cards-list"
                ),

            emptyState:
                document.getElementById(
                    "cards-empty-state"
                )

        };

        if (!this.elements.view) {

            return;

        }

        this.configureEvents();

        this.render();

    },

    configureEvents() {

        this.elements.openButton
            ?.addEventListener(
                "click",
                () => {

                    this.openForm();

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

    },

    openForm(card = null) {

        this.clearMessage();

        this.editingCardId =
            card ? card.id : null;

        if (card) {

            this.elements.formTitle.textContent =
                "Editar tarjeta";

            this.elements.nameInput.value =
                card.name;

            this.elements.bankInput.value =
                card.bank;

            this.elements.limitInput.value =
                card.limit;

            this.elements.usedInput.value =
                card.used;

            this.elements.cutDayInput.value =
                card.cutDay;

            this.elements.dueDayInput.value =
                card.dueDay;

            this.elements.colorInput.value =
                card.color || "#2563eb";

        } else {

            this.elements.formTitle.textContent =
                "Agregar tarjeta";

            this.elements.form.reset();

            this.elements.usedInput.value =
                "0";

            this.elements.colorInput.value =
                "#2563eb";

        }

        this.elements.modal.hidden =
            false;

        document.body.style.overflow =
            "hidden";

        this.elements.nameInput.focus();

    },

    closeForm() {

        this.editingCardId =
            null;

        this.elements.modal.hidden =
            true;

        document.body.style.overflow =
            "";

        this.elements.form.reset();

        this.elements.formTitle.textContent =
            "Agregar tarjeta";

        this.elements.usedInput.value =
            "0";

        this.elements.colorInput.value =
            "#2563eb";

        this.clearMessage();

    },

    handleSubmit(event) {

        event.preventDefault();

        const cardData = {

            name:
                this.elements.nameInput.value,

            bank:
                this.elements.bankInput.value,

            limit:
                this.elements.limitInput.value,

            used:
                this.elements.usedInput.value,

            cutDay:
                this.elements.cutDayInput.value,

            dueDay:
                this.elements.dueDayInput.value,

            color:
                this.elements.colorInput.value

        };

        let result;

        if (this.editingCardId) {

            result =
                CardManager.updateCard(
                    this.editingCardId,
                    cardData
                );

        } else {

            result =
                CardManager.createCard(
                    cardData
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

        if (
            typeof Dashboard !==
            "undefined"
        ) {

            Dashboard.render();

        }

    },

    render() {

        const totalLimit =
            CardManager.getTotalLimit();

        const totalUsed =
            CardManager.getTotalUsed();

        const totalAvailable =
            CardManager.getTotalAvailable();

        this.elements.totalLimit.textContent =
            this.formatCurrency(
                totalLimit
            );

        this.elements.totalUsed.textContent =
            this.formatCurrency(
                totalUsed
            );

        this.elements.totalAvailable.textContent =
            this.formatCurrency(
                totalAvailable
            );

        const cards =
            CardManager.getAll();

        this.elements.emptyState.hidden =
            cards.length > 0;

        this.renderCards(
            cards
        );

    },

    renderCards(cards) {

        this.elements.list.innerHTML =
            "";

        cards.forEach(
            card => {

                const available =
                    Number(card.limit) -
                    Number(card.used);

                const usagePercentage =
                    Number(card.limit) > 0
                        ? (
                            Number(card.used) /
                            Number(card.limit)
                        ) * 100
                        : 0;

                const cardElement =
                    document.createElement(
                        "article"
                    );

                cardElement.className =
                    "record-card credit-card-record";

                cardElement.innerHTML = `

                    <div
                        class="credit-card-accent"
                        style="
                            background-color:
                            ${card.color};
                        "
                    ></div>

                    <div class="record-card-header">

                        <div>

                            <p class="record-category">
                                ${this.escapeHTML(card.bank)}
                            </p>

                            <h3>
                                ${this.escapeHTML(card.name)}
                            </h3>

                        </div>

                        <div class="record-card-actions">

                            <button
                                class="edit-record-button"
                                type="button"
                                data-edit-card-id="${card.id}"
                                aria-label="Editar tarjeta"
                            >
                                Editar
                            </button>

                            <button
                                class="delete-record-button"
                                type="button"
                                data-delete-card-id="${card.id}"
                                aria-label="Eliminar tarjeta"
                            >
                                ×
                            </button>

                        </div>

                    </div>

                    <div class="card-financial-grid">

                        <div>

                            <span>
                                Límite
                            </span>

                            <strong>
                                ${this.formatCurrency(card.limit)}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Utilizado
                            </span>

                            <strong>
                                ${this.formatCurrency(card.used)}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Disponible
                            </span>

                            <strong>
                                ${this.formatCurrency(available)}
                            </strong>

                        </div>

                    </div>

                    <div class="progress-track">

                        <div
                            class="progress-fill"
                            style="
                                width:
                                ${Math.min(
                                    usagePercentage,
                                    100
                                )}%;
                                background-color:
                                ${card.color};
                            "
                        ></div>

                    </div>

                    <div class="record-card-footer">

                        <span>
                            Corte: día ${card.cutDay}
                        </span>

                        <span>
                            Pago: día ${card.dueDay}
                        </span>

                    </div>

                `;

                const editButton =
                    cardElement.querySelector(
                        "[data-edit-card-id]"
                    );

                editButton
                    ?.addEventListener(
                        "click",
                        () => {

                            this.openForm(
                                card
                            );

                        }
                    );

                const deleteButton =
                    cardElement.querySelector(
                        "[data-delete-card-id]"
                    );

                deleteButton
                    ?.addEventListener(
                        "click",
                        () => {

                            this.deleteCard(
                                card.id
                            );

                        }
                    );

                this.elements.list.appendChild(
                    cardElement
                );

            }
        );

    },

    deleteCard(cardId) {

        const confirmed =
            window.confirm(
                "¿Deseas eliminar esta tarjeta?"
            );

        if (!confirmed) {

            return;

        }

        CardManager.deleteCard(
            cardId
        );

        this.render();

        if (
            typeof Dashboard !==
            "undefined"
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

document.addEventListener(
    "DOMContentLoaded",
    function () {

        CardsUI.initialize();

    }
);