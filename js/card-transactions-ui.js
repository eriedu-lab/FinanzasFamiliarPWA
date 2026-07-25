"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Interfaz de movimientos de tarjeta
=====================================
*/

const CardTransactionsUI = {

    selectedCardId:
        null,

    elements: {},

    initialize() {

        if (
            typeof CardsUI ===
            "undefined" ||
            typeof CardManager ===
            "undefined" ||
            typeof CardTransactionManager ===
            "undefined"
        ) {

            return;

        }

        this.injectStyles();
        this.injectModal();
        this.captureElements();
        this.configureEvents();
        this.wrapCardsRender();

        CardsUI.render();

    },

    injectModal() {

        if (
            document.getElementById(
                "card-transaction-modal"
            )
        ) {

            return;

        }

        const modal =
            document.createElement(
                "div"
            );

        modal.id =
            "card-transaction-modal";

        modal.className =
            "modal-overlay";

        modal.hidden =
            true;

        modal.innerHTML = `
            <div
                class="modal-card transaction-modal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="card-transaction-title"
            >

                <header class="modal-header">

                    <div>

                        <p class="card-overline">
                            Tarjeta seleccionada
                        </p>

                        <h2 id="card-transaction-title">
                            Movimientos
                        </h2>

                        <p
                            id="card-transaction-card-name"
                            class="secondary-text"
                        ></p>

                    </div>

                    <button
                        id="close-card-transaction-modal"
                        class="modal-close-button"
                        type="button"
                        aria-label="Cerrar"
                    >
                        ×
                    </button>

                </header>

                <form id="card-transaction-form">

                    <div class="form-grid">

                        <div class="form-group">

                            <label for="card-transaction-type">
                                Tipo
                            </label>

                            <select
                                id="card-transaction-type"
                                required
                            >
                                <option value="purchase">
                                    Compra
                                </option>
                                <option value="payment">
                                    Pago
                                </option>
                                <option value="refund">
                                    Devolución
                                </option>
                                <option value="adjustment-add">
                                    Ajuste de cargo
                                </option>
                                <option value="adjustment-subtract">
                                    Ajuste a favor
                                </option>
                            </select>

                        </div>

                        <div class="form-group">

                            <label for="card-transaction-date">
                                Fecha
                            </label>

                            <input
                                id="card-transaction-date"
                                type="date"
                                required
                            >

                        </div>

                        <div class="form-group transaction-description-group">

                            <label for="card-transaction-description">
                                Descripción
                            </label>

                            <input
                                id="card-transaction-description"
                                type="text"
                                placeholder="Ejemplo: Supermercado"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label for="card-transaction-amount">
                                Importe
                            </label>

                            <input
                                id="card-transaction-amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                inputmode="decimal"
                                placeholder="0.00"
                                required
                            >

                        </div>

                    </div>

                    <p
                        id="card-transaction-message"
                        class="form-message"
                        hidden
                    ></p>

                    <div class="form-actions">

                        <button
                            id="cancel-card-transaction"
                            class="secondary-button"
                            type="button"
                        >
                            Cerrar
                        </button>

                        <button
                            class="primary-button"
                            type="submit"
                        >
                            Guardar movimiento
                        </button>

                    </div>

                </form>

                <div class="transaction-history-section">

                    <div class="section-card-header">

                        <div>

                            <p class="card-overline">
                                Actividad
                            </p>

                            <h3>
                                Historial de la tarjeta
                            </h3>

                        </div>

                    </div>

                    <div
                        id="card-transaction-list"
                        class="transaction-list"
                    ></div>

                    <p
                        id="card-transaction-empty"
                        class="secondary-text"
                    >
                        Todavía no hay movimientos registrados.
                    </p>

                </div>

            </div>
        `;

        document.body
            .appendChild(modal);

    },

    captureElements() {

        this.elements = {

            cardsList:
                document.getElementById(
                    "cards-list"
                ),

            modal:
                document.getElementById(
                    "card-transaction-modal"
                ),

            close:
                document.getElementById(
                    "close-card-transaction-modal"
                ),

            cancel:
                document.getElementById(
                    "cancel-card-transaction"
                ),

            form:
                document.getElementById(
                    "card-transaction-form"
                ),

            cardName:
                document.getElementById(
                    "card-transaction-card-name"
                ),

            type:
                document.getElementById(
                    "card-transaction-type"
                ),

            date:
                document.getElementById(
                    "card-transaction-date"
                ),

            description:
                document.getElementById(
                    "card-transaction-description"
                ),

            amount:
                document.getElementById(
                    "card-transaction-amount"
                ),

            message:
                document.getElementById(
                    "card-transaction-message"
                ),

            list:
                document.getElementById(
                    "card-transaction-list"
                ),

            empty:
                document.getElementById(
                    "card-transaction-empty"
                )

        };

    },

    configureEvents() {

        this.elements.cardsList
            ?.addEventListener(
                "click",
                event => {

                    const button =
                        event.target.closest(
                            "[data-card-transactions]"
                        );

                    if (!button) {

                        return;

                    }

                    this.open(
                        button.dataset
                            .cardTransactions
                    );

                }
            );

        this.elements.close
            ?.addEventListener(
                "click",
                () => {

                    this.close();

                }
            );

        this.elements.cancel
            ?.addEventListener(
                "click",
                () => {

                    this.close();

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

                        this.close();

                    }

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

        this.elements.list
            ?.addEventListener(
                "click",
                event => {

                    const button =
                        event.target.closest(
                            "[data-delete-card-transaction]"
                        );

                    if (!button) {

                        return;

                    }

                    this.deleteTransaction(
                        button.dataset
                            .deleteCardTransaction
                    );

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

                    this.close();

                }

            }
        );

    },

    wrapCardsRender() {

        if (
            CardsUI
                .__transactionsRenderWrapped
        ) {

            return;

        }

        const originalRenderCards =
            CardsUI.renderCards
                .bind(CardsUI);

        CardsUI.renderCards =
            cards => {

                originalRenderCards(
                    cards
                );

                this.addTransactionButtons();

            };

        CardsUI
            .__transactionsRenderWrapped =
                true;

    },

    addTransactionButtons() {

        document
            .querySelectorAll(
                "#cards-list .credit-card-record"
            )
            .forEach(
                cardElement => {

                    if (
                        cardElement.querySelector(
                            "[data-card-transactions]"
                        )
                    ) {

                        return;

                    }

                    const editButton =
                        cardElement.querySelector(
                            "[data-edit-card-id]"
                        );

                    const cardId =
                        editButton
                            ?.dataset
                            .editCardId;

                    const actions =
                        cardElement.querySelector(
                            ".record-card-actions"
                        );

                    if (
                        !cardId ||
                        !actions
                    ) {

                        return;

                    }

                    const button =
                        document.createElement(
                            "button"
                        );

                    button.type =
                        "button";

                    button.className =
                        "card-transactions-button";

                    button.dataset
                        .cardTransactions =
                            cardId;

                    button.textContent =
                        "Movimientos";

                    actions.insertBefore(
                        button,
                        actions.firstChild
                    );

                }
            );

    },

    open(cardId) {

        const card =
            CardManager.getById(
                String(cardId)
            );

        if (!card) {

            return;

        }

        this.selectedCardId =
            card.id;

        this.elements.cardName
            .textContent =
                `${card.bank} · ${card.name}`;

        this.elements.form
            .reset();

        this.setDefaultDate();
        this.hideMessage();
        this.renderTransactions();

        this.elements.modal.hidden =
            false;

        document.body.style.overflow =
            "hidden";

        window.setTimeout(
            () => {

                this.elements
                    .description
                    .focus();

            },
            100
        );

    },

    close() {

        this.selectedCardId =
            null;

        this.elements.modal.hidden =
            true;

        document.body.style.overflow =
            "";

        this.elements.form.reset();
        this.hideMessage();

    },

    handleSubmit(event) {

        event.preventDefault();

        const result =
            CardTransactionManager
                .createTransaction(
                    {
                        cardId:
                            this.selectedCardId,
                        type:
                            this.elements
                                .type
                                .value,
                        description:
                            this.elements
                                .description
                                .value,
                        amount:
                            this.elements
                                .amount
                                .value,
                        date:
                            this.elements
                                .date
                                .value
                    }
                );

        if (!result.success) {

            this.showMessage(
                result.message
            );

            return;

        }

        this.elements.form.reset();
        this.setDefaultDate();
        this.hideMessage();
        this.renderTransactions();

        CardsUI.render();

        if (
            typeof Dashboard !==
            "undefined"
        ) {

            Dashboard.render();

        }

        if (
            typeof FinancialHistoryUI !==
            "undefined"
        ) {

            FinancialHistoryUI
                .initialize();

            FinancialHistoryUI
                .render();

        }

    },

    deleteTransaction(
        transactionId
    ) {

        const confirmed =
            window.confirm(
                "¿Deseas eliminar este movimiento? El saldo de la tarjeta se ajustará automáticamente."
            );

        if (!confirmed) {

            return;

        }

        const result =
            CardTransactionManager
                .deleteTransaction(
                    transactionId
                );

        if (!result.success) {

            this.showMessage(
                result.message
            );

            return;

        }

        this.renderTransactions();
        CardsUI.render();

        if (
            typeof Dashboard !==
            "undefined"
        ) {

            Dashboard.render();

        }

        if (
            typeof FinancialHistoryUI !==
            "undefined"
        ) {

            FinancialHistoryUI
                .initialize();

            FinancialHistoryUI
                .render();

        }

    },

    renderTransactions() {

        const transactions =
            CardTransactionManager
                .getByCard(
                    this.selectedCardId
                );

        this.elements.list.innerHTML =
            "";

        this.elements.empty.hidden =
            transactions.length > 0;

        transactions.forEach(
            transaction => {

                const item =
                    document.createElement(
                        "article"
                    );

                item.className =
                    "transaction-item";

                const positive =
                    transaction.type ===
                        "payment" ||
                    transaction.type ===
                        "refund" ||
                    transaction.type ===
                        "adjustment-subtract";

                item.innerHTML = `
                    <div>
                        <p class="record-category">
                            ${this.escapeHTML(
                                CardTransactionManager
                                    .getTypeLabel(
                                        transaction.type
                                    )
                            )}
                        </p>
                        <h4>
                            ${this.escapeHTML(
                                transaction.description
                            )}
                        </h4>
                        <p class="record-meta">
                            ${this.formatDate(
                                transaction.date
                            )}
                        </p>
                    </div>

                    <div class="transaction-item-side">

                        <strong class="${positive ? "transaction-positive" : "transaction-negative"}">
                            ${positive ? "−" : "+"}${this.formatCurrency(
                                transaction.amount
                            )}
                        </strong>

                        <button
                            class="delete-record-button"
                            type="button"
                            data-delete-card-transaction="${transaction.id}"
                            aria-label="Eliminar movimiento"
                        >
                            ×
                        </button>

                    </div>
                `;

                this.elements.list
                    .appendChild(item);

            }
        );

    },

    setDefaultDate() {

        this.elements.date.value =
            new Date()
                .toISOString()
                .slice(0, 10);

    },

    showMessage(message) {

        this.elements.message
            .textContent =
                message;

        this.elements.message.hidden =
            false;

    },

    hideMessage() {

        this.elements.message
            .textContent =
                "";

        this.elements.message.hidden =
            true;

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
                `${value}T12:00:00`
            );

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
                "card-transactions-styles"
            )
        ) {

            return;

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "card-transactions-styles";

        style.textContent = `

            .card-transactions-button {
                border: 0;
                border-radius: 10px;
                padding: 8px 11px;
                background: #eef2ff;
                color: #3730a3;
                font-weight: 700;
                cursor: pointer;
            }

            .transaction-modal-card {
                width: min(760px, calc(100% - 28px));
                max-height: 90vh;
                overflow-y: auto;
            }

            .transaction-description-group {
                grid-column: span 1;
            }

            .transaction-history-section {
                margin-top: 26px;
                padding-top: 22px;
                border-top: 1px solid #e2e8f0;
            }

            .transaction-list {
                display: grid;
                gap: 12px;
            }

            .transaction-item {
                display: grid;
                grid-template-columns: 1fr auto;
                align-items: center;
                gap: 14px;
                padding: 14px;
                border: 1px solid #e2e8f0;
                border-radius: 14px;
                background: #fff;
            }

            .transaction-item h4 {
                margin: 4px 0;
            }

            .transaction-item-side {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .transaction-positive {
                color: #15803d;
            }

            .transaction-negative {
                color: #b91c1c;
            }

            @media (max-width: 560px) {

                .transaction-item {
                    grid-template-columns: 1fr;
                }

                .transaction-item-side {
                    justify-content: space-between;
                }

            }

        `;

        document.head
            .appendChild(style);

    }

};

window.CardTransactionsUI =
    CardTransactionsUI;

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            CardTransactionsUI
                .initialize();

        }
    );

} else {

    CardTransactionsUI
        .initialize();

}
