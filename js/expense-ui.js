"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Interfaz de Gastos
=====================================
*/

const ExpenseUI = {

    editingExpenseId: null,

    elements: {},

    initialize() {

        this.elements = {

            view:
                document.getElementById(
                    "view-gastos"
                ),

            total:
                document.getElementById(
                    "expense-total"
                ),

            list:
                document.getElementById(
                    "expense-list"
                ),

            emptyState:
                document.getElementById(
                    "expense-empty-state"
                ),

            modal:
                document.getElementById(
                    "expense-modal"
                ),

            openButton:
                document.getElementById(
                    "open-expense-form"
                ),

            closeButton:
                document.getElementById(
                    "close-expense-form"
                ),

            cancelButton:
                document.getElementById(
                    "cancel-expense-form"
                ),

            form:
                document.getElementById(
                    "expense-form"
                ),

            formTitle:
                document.getElementById(
                    "expense-form-title"
                ),

            name:
                document.getElementById(
                    "expense-name"
                ),

            amount:
                document.getElementById(
                    "expense-amount"
                ),

            date:
                document.getElementById(
                    "expense-date"
                ),

            category:
                document.getElementById(
                    "expense-category"
                ),

            type:
                document.getElementById(
                    "expense-type"
                ),

            message:
                document.getElementById(
                    "expense-form-message"
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

        this.editingExpenseId = null;

        this.elements.form.reset();

        this.elements.formTitle.textContent =
            "Agregar gasto";

        this.setSubmitButtonText(
            "Guardar gasto"
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

    openEditForm(expenseId) {

        const expense =
            ExpenseManager
                .getAll()
                .find(
                    item =>
                        item.id === expenseId
                );

        if (!expense) {

            return;

        }

        this.editingExpenseId =
            expense.id;

        this.elements.name.value =
            expense.name;

        this.elements.amount.value =
            expense.amount;

        this.elements.date.value =
            expense.date;

        this.elements.category.value =
            expense.category || "Otros";

        this.elements.type.value =
            expense.type || "Variable";

        this.elements.formTitle.textContent =
            "Editar gasto";

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

        this.editingExpenseId = null;

        this.hideMessage();

        this.elements.formTitle.textContent =
            "Agregar gasto";

        this.setSubmitButtonText(
            "Guardar gasto"
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
                this.elements.category.value,

            type:
                this.elements.type.value

        };

        let result;

        if (this.editingExpenseId) {

            result =
                ExpenseManager.updateExpense(
                    this.editingExpenseId,
                    values
                );

        } else {

            result =
                ExpenseManager.createExpense(
                    values.name,
                    values.amount,
                    values.date,
                    values.category,
                    values.type
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
                "[data-expense-action]"
            );

        if (!button) {

            return;

        }

        const action =
            button.dataset.expenseAction;

        const expenseId =
            button.dataset.expenseId;

        if (!expenseId) {

            return;

        }

        if (action === "edit") {

            this.openEditForm(
                expenseId
            );

            return;

        }

        if (action === "delete") {

            this.deleteExpense(
                expenseId
            );

        }

    },

    deleteExpense(expenseId) {

        const expense =
            ExpenseManager
                .getAll()
                .find(
                    item =>
                        item.id === expenseId
                );

        if (!expense) {

            return;

        }

        const confirmed =
            window.confirm(
                `¿Eliminar el gasto "${expense.name}"?`
            );

        if (!confirmed) {

            return;

        }

        ExpenseManager.deleteExpense(
            expenseId
        );

        this.render();

    },

    render() {

        const expenses =
            ExpenseManager.getAll();

        this.renderTotal();
        this.renderList(expenses);

        this.elements.emptyState.hidden =
            expenses.length > 0;

    },

    renderTotal() {

        const total =
            ExpenseManager.getTotal();

        this.elements.total.textContent =
            this.formatCurrency(total);

    },

    renderList(expenses) {

        this.elements.list.innerHTML = "";

        expenses.forEach(
            expense => {

                const card =
                    this.createExpenseCard(
                        expense
                    );

                this.elements.list.appendChild(
                    card
                );

            }
        );

    },

    createExpenseCard(expense) {

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
            expense.name;

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
            expense.category || "Otros";

        const type =
            document.createElement(
                "span"
            );

        type.textContent =
            expense.type || "Variable";

        const date =
            document.createElement(
                "span"
            );

        date.textContent =
            this.formatDate(
                expense.date
            );

        meta.append(
            category,
            type,
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
                expense.amount
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
                expense.id
            );

        const deleteButton =
            this.createActionButton(
                "Eliminar",
                "delete",
                expense.id
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
        expenseId
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

        button.dataset.expenseAction =
            action;

        button.dataset.expenseId =
            expenseId;

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

        ExpenseUI.initialize();

    }
);