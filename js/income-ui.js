"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Interfaz de Ingresos
=====================================
*/

const IncomeUI = {

    editingIncomeId: null,

    elements: {},

    initialize() {

        this.elements = {

            view:
                document.getElementById(
                    "view-ingresos"
                ),

            total:
                document.getElementById(
                    "income-total"
                ),

            list:
                document.getElementById(
                    "income-list"
                ),

            emptyState:
                document.getElementById(
                    "income-empty-state"
                ),

            modal:
                document.getElementById(
                    "income-modal"
                ),

            openButton:
                document.getElementById(
                    "open-income-form"
                ),

            closeButton:
                document.getElementById(
                    "close-income-form"
                ),

            cancelButton:
                document.getElementById(
                    "cancel-income-form"
                ),

            form:
                document.getElementById(
                    "income-form"
                ),

            formTitle:
                document.getElementById(
                    "income-form-title"
                ),

            name:
                document.getElementById(
                    "income-name"
                ),

            amount:
                document.getElementById(
                    "income-amount"
                ),

            date:
                document.getElementById(
                    "income-date"
                ),

            category:
                document.getElementById(
                    "income-category"
                ),

            message:
                document.getElementById(
                    "income-form-message"
                )

        };

        if (
            !this.elements.view ||
            !this.elements.form
        ) {

            return;

        }

        this.configureEvents();
        this.setDefaultDate();
        this.render();

    },

    configureEvents() {

        this.elements.openButton
            ?.addEventListener(
                "click",
                () => {

                    this.openCreateForm();

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

                    this.handleSubmit(event);

                }
            );

        this.elements.list
            ?.addEventListener(
                "click",
                event => {

                    this.handleListClick(event);

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
                    event.key === "Escape" &&
                    !this.elements.modal.hidden
                ) {

                    this.closeForm();

                }

            }
        );

    },

    openCreateForm() {

        this.editingIncomeId = null;

        this.elements.form.reset();

        this.elements.formTitle.textContent =
            "Agregar ingreso";

        this.setSubmitButtonText(
            "Guardar ingreso"
        );

        this.hideMessage();
        this.setDefaultDate();

        this.elements.modal.hidden = false;

        document.body.style.overflow =
            "hidden";

        window.setTimeout(
            () => {

                this.elements.name.focus();

            },
            100
        );

    },

    openEditForm(incomeId) {

        const income =
            IncomeManager
                .getAll()
                .find(
                    item =>
                        item.id === incomeId
                );

        if (!income) {

            return;

        }

        this.editingIncomeId =
            income.id;

        this.elements.name.value =
            income.name;

        this.elements.amount.value =
            income.amount;

        this.elements.date.value =
            income.date;

        this.elements.category.value =
            income.category || "Otros";

        this.elements.formTitle.textContent =
            "Editar ingreso";

        this.setSubmitButtonText(
            "Guardar cambios"
        );

        this.hideMessage();

        this.elements.modal.hidden = false;

        document.body.style.overflow =
            "hidden";

        window.setTimeout(
            () => {

                this.elements.name.focus();

            },
            100
        );

    },

    closeForm() {

        this.elements.modal.hidden = true;

        document.body.style.overflow = "";

        this.elements.form.reset();

        this.editingIncomeId = null;

        this.hideMessage();

        this.elements.formTitle.textContent =
            "Agregar ingreso";

        this.setSubmitButtonText(
            "Guardar ingreso"
        );

        this.setDefaultDate();

    },

    handleSubmit(event) {

        event.preventDefault();

        const values = {

            name:
                this.elements.name.value,

            amount:
                this.elements.amount.value,

            date:
                this.elements.date.value,

            category:
                this.elements.category.value

        };

        let result;

        if (this.editingIncomeId) {

            result =
                IncomeManager.updateIncome(
                    this.editingIncomeId,
                    values
                );

        } else {

            result =
                IncomeManager.createIncome(
                    values.name,
                    values.amount,
                    values.date,
                    values.category
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

    },

    handleListClick(event) {

        const button =
            event.target.closest(
                "[data-income-action]"
            );

        if (!button) {

            return;

        }

        const action =
            button.dataset.incomeAction;

        const incomeId =
            button.dataset.incomeId;

        if (!incomeId) {

            return;

        }

        if (action === "edit") {

            this.openEditForm(
                incomeId
            );

            return;

        }

        if (action === "delete") {

            this.deleteIncome(
                incomeId
            );

        }

    },

    deleteIncome(incomeId) {

        const income =
            IncomeManager
                .getAll()
                .find(
                    item =>
                        item.id === incomeId
                );

        if (!income) {

            return;

        }

        const confirmed =
            window.confirm(
                `¿Eliminar el ingreso "${income.name}"?`
            );

        if (!confirmed) {

            return;

        }

        IncomeManager.deleteIncome(
            incomeId
        );

        this.render();

    },

    render() {

        const incomes =
            IncomeManager.getAll();

        this.renderTotal();
        this.renderList(incomes);

        this.elements.emptyState.hidden =
            incomes.length > 0;

    },

    renderTotal() {

        const total =
            IncomeManager.getTotal();

        this.elements.total.textContent =
            this.formatCurrency(total);

    },

    renderList(incomes) {

        this.elements.list.innerHTML = "";

        incomes.forEach(
            income => {

                const card =
                    this.createIncomeCard(
                        income
                    );

                this.elements.list.appendChild(
                    card
                );

            }
        );

    },

    createIncomeCard(income) {

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "record-card";

        const main =
            document.createElement(
                "div"
            );

        main.className =
            "record-main";

        const title =
            document.createElement(
                "h3"
            );

        title.className =
            "record-title";

        title.textContent =
            income.name;

        const meta =
            document.createElement(
                "p"
            );

        meta.className =
            "record-meta";

        const category =
            document.createElement(
                "span"
            );

        category.textContent =
            income.category || "Otros";

        const date =
            document.createElement(
                "span"
            );

        date.textContent =
            this.formatDate(
                income.date
            );

        meta.append(
            category,
            date
        );

        main.append(
            title,
            meta
        );

        const amount =
            document.createElement(
                "strong"
            );

        amount.className =
            "record-amount";

        amount.textContent =
            this.formatCurrency(
                income.amount
            );

        const actions =
            document.createElement(
                "div"
            );

        actions.className =
            "record-actions";

        const editButton =
            this.createActionButton(
                "Editar",
                "edit",
                income.id
            );

        const deleteButton =
            this.createActionButton(
                "Eliminar",
                "delete",
                income.id
            );

        deleteButton.classList.add(
            "delete"
        );

        actions.append(
            editButton,
            deleteButton
        );

        card.append(
            main,
            amount,
            actions
        );

        return card;

    },

    createActionButton(
        text,
        action,
        incomeId
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.type =
            "button";

        button.className =
            "record-button";

        button.textContent =
            text;

        button.dataset.incomeAction =
            action;

        button.dataset.incomeId =
            incomeId;

        return button;

    },

    setDefaultDate() {

        if (
            this.elements.date &&
            !this.elements.date.value
        ) {

            this.elements.date.value =
                new Date()
                    .toISOString()
                    .slice(0, 10);

        }

    },

    setSubmitButtonText(text) {

        const submitButton =
            this.elements.form.querySelector(
                'button[type="submit"]'
            );

        if (submitButton) {

            submitButton.textContent =
                text;

        }

    },

    showMessage(message) {

        this.elements.message.textContent =
            message;

        this.elements.message.hidden =
            false;

    },

    hideMessage() {

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

    formatDate(dateValue) {

        if (!dateValue) {

            return "Sin fecha";

        }

        const dateParts =
            dateValue.split("-");

        if (dateParts.length !== 3) {

            return dateValue;

        }

        const date =
            new Date(
                Number(dateParts[0]),
                Number(dateParts[1]) - 1,
                Number(dateParts[2])
            );

        return new Intl.DateTimeFormat(
            "es-MX",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        ).format(date);

    }

};

document.addEventListener(
    "DOMContentLoaded",
    function () {

        IncomeUI.initialize();

    }
);