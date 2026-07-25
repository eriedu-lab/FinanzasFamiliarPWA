"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Motor de Recordatorios de Pago
=====================================
*/

const ReminderManager = {

    getToday() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    },

    normalizeDate(value) {
        if (!value) return null;
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return new Date(value.getFullYear(), value.getMonth(), value.getDate());
        }
        const text = String(value).trim();
        const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) {
            const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
            return Number.isNaN(date.getTime()) ? null : date;
        }
        const date = new Date(text);
        return Number.isNaN(date.getTime())
            ? null
            : new Date(date.getFullYear(), date.getMonth(), date.getDate());
    },

    createMonthlyDate(year, month, requestedDay) {
        const lastDay = new Date(year, month + 1, 0).getDate();
        const day = Math.min(Math.max(Number(requestedDay) || 1, 1), lastDay);
        return new Date(year, month, day);
    },

    addMonths(baseDate, amount) {
        const base = this.normalizeDate(baseDate);
        if (!base) return null;
        const target = new Date(base.getFullYear(), base.getMonth() + amount, 1);
        return this.createMonthlyDate(target.getFullYear(), target.getMonth(), base.getDate());
    },

    differenceInDays(date, reference = this.getToday()) {
        const normalized = this.normalizeDate(date);
        const base = this.normalizeDate(reference);
        if (!normalized || !base) return null;
        return Math.round((normalized.getTime() - base.getTime()) / 86400000);
    },

    getCardReminders() {
        if (!window.CardManager || typeof window.CardManager.getAll !== "function") return [];
        const today = this.getToday();
        const cards = window.CardManager.getAll();
        return cards.flatMap(card => {
            const reminders = [];
            for (let offset = -1; offset <= 1; offset += 1) {
                const month = new Date(today.getFullYear(), today.getMonth() + offset, 1);
                const dueDate = this.createMonthlyDate(month.getFullYear(), month.getMonth(), card.dueDay);
                const days = this.differenceInDays(dueDate, today);
                if (days >= -7 && days <= 31 && Number(card.used) > 0) {
                    reminders.push({
                        id: `card-${card.id}-${dueDate.getFullYear()}-${dueDate.getMonth()}`,
                        source: "card",
                        sourceId: card.id,
                        title: `Pago de ${card.name || "tarjeta"}`,
                        description: `${card.bank || "Banco"} · Fecha límite`,
                        amount: Number(card.used) || 0,
                        date: dueDate,
                        days,
                        paid: false
                    });
                }
            }
            return reminders;
        });
    },

    getPlanReminders() {
        if (!window.PaymentPlanManager || typeof window.PaymentPlanManager.getAll !== "function") return [];
        const today = this.getToday();
        return window.PaymentPlanManager.getAll().flatMap(plan => {
            const total = Math.max(Number(plan.totalInstallments) || 0, 0);
            const paid = Math.min(Math.max(Number(plan.paidInstallments) || 0, 0), total);
            const monthly = total > 0 ? (Number(plan.totalAmount) || 0) / total : 0;
            const reminders = [];
            for (let index = paid; index < total; index += 1) {
                const paymentDate = this.addMonths(plan.firstPaymentDate, index);
                if (!paymentDate) continue;
                const days = this.differenceInDays(paymentDate, today);
                if (days >= -7 && days <= 31) {
                    reminders.push({
                        id: `plan-${plan.id}-${index + 1}`,
                        source: "paymentPlan",
                        sourceId: plan.id,
                        title: plan.description || "Plan de pago",
                        description: `${plan.cardName || "Tarjeta"} · Mensualidad ${index + 1} de ${total}`,
                        amount: monthly,
                        date: paymentDate,
                        days,
                        paid: false,
                        installmentNumber: index + 1
                    });
                }
            }
            return reminders;
        });
    },

    getAll() {
        return [...this.getCardReminders(), ...this.getPlanReminders()]
            .sort((a, b) => a.date - b.date || a.title.localeCompare(b.title));
    },

    getUrgent() {
        return this.getAll().filter(item => item.days <= 3);
    },

    getUpcoming(limit = 6) {
        return this.getAll().filter(item => item.days >= 0).slice(0, limit);
    },

    getSummary() {
        const all = this.getAll();
        return {
            overdue: all.filter(item => item.days < 0).length,
            today: all.filter(item => item.days === 0).length,
            nextThreeDays: all.filter(item => item.days > 0 && item.days <= 3).length,
            upcoming: all.filter(item => item.days >= 0).length,
            total: all.length
        };
    },

    formatDate(date) {
        const value = this.normalizeDate(date);
        if (!value) return "Fecha no disponible";
        return new Intl.DateTimeFormat("es-MX", {
            day: "numeric",
            month: "short",
            year: "numeric"
        }).format(value);
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN"
        }).format(Number(amount) || 0);
    },

    getStatus(item) {
        if (item.days < 0) return { key: "overdue", label: `Vencido hace ${Math.abs(item.days)} día${Math.abs(item.days) === 1 ? "" : "s"}`, icon: "🔴" };
        if (item.days === 0) return { key: "today", label: "Vence hoy", icon: "🟠" };
        if (item.days <= 3) return { key: "soon", label: `Vence en ${item.days} día${item.days === 1 ? "" : "s"}`, icon: "🟡" };
        return { key: "upcoming", label: `Vence en ${item.days} días`, icon: "🟢" };
    },

    notifyChange() {
        document.dispatchEvent(new CustomEvent("finance-reminders-changed"));
    },

    patchManager(manager, methodNames) {
        if (!manager || manager.__reminderPatched) return;
        methodNames.forEach(methodName => {
            const original = manager[methodName];
            if (typeof original !== "function") return;
            manager[methodName] = function (...args) {
                const result = original.apply(this, args);
                window.ReminderManager.notifyChange();
                return result;
            };
        });
        manager.__reminderPatched = true;
    },

    initialize() {
        this.patchManager(window.CardManager, ["createCard", "updateCard", "deleteCard"]);
        this.patchManager(window.PaymentPlanManager, ["createPlan", "updatePlan", "deletePlan", "registerPayment", "undoPayment"]);
        this.notifyChange();
    }
};

window.ReminderManager = ReminderManager;
ReminderManager.initialize();
