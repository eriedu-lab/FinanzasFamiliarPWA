"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Interfaz de Recordatorios
=====================================
*/

const RemindersUI = {
    elements: {},
    initialized: false,

    initialize() {
        if (this.initialized) return;
        this.injectStyles();
        this.createDashboardSection();
        this.createView();
        this.connectEvents();
        this.render();
        this.initialized = true;
    },

    injectStyles() {
        if (document.getElementById("reminders-styles")) return;
        const style = document.createElement("style");
        style.id = "reminders-styles";
        style.textContent = `
            .reminders-summary-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:14px 0}
            .reminder-stat{padding:12px;border:1px solid rgba(148,163,184,.25);border-radius:14px;text-align:center}
            .reminder-stat strong{display:block;font-size:1.35rem;margin-top:4px}
            .reminders-list{display:grid;gap:10px;margin-top:14px}
            .reminder-item{padding:13px;border:1px solid rgba(148,163,184,.25);border-left:4px solid #16a34a;border-radius:14px;background:var(--card-background,#fff)}
            .reminder-item.is-overdue{border-left-color:#dc2626}.reminder-item.is-today{border-left-color:#ea580c}.reminder-item.is-soon{border-left-color:#eab308}
            .reminder-row{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.reminder-row h3{margin:0;font-size:1rem}.reminder-amount{white-space:nowrap}
            .reminder-meta{margin:6px 0 0;opacity:.75;font-size:.9rem}.reminder-status{margin-top:8px;font-weight:700;font-size:.88rem}
            .reminders-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
            @media(max-width:520px){.reminders-summary-grid{grid-template-columns:1fr}.reminder-row{flex-direction:column}.reminder-amount{white-space:normal}}
        `;
        document.head.appendChild(style);
    },

    createDashboardSection() {
        let section =
            document.getElementById(
                "dashboard-reminders-summary"
            );

        if (!section) {
            const startView =
                document.getElementById(
                    "view-inicio"
                );

            if (!startView) return;

            section =
                document.createElement(
                    "section"
                );

            section.id =
                "dashboard-reminders-summary";

            section.className =
                "section-card dashboard-reminder-card";

            section.innerHTML = `
                <div class="dashboard-reminder-icon">
                    <span id="dashboard-reminders-icon">✅</span>
                </div>
                <div class="dashboard-reminder-content">
                    <strong id="dashboard-reminders-title">Sin pagos próximos</strong>
                    <p id="dashboard-reminders-message">Tus pagos aparecerán aquí.</p>
                </div>
                <span id="dashboard-reminders-badge" class="dashboard-reminder-badge">Al día</span>
            `;

            startView.appendChild(
                section
            );
        }

        this.elements.dashboardTitle =
            section.querySelector(
                "#dashboard-reminders-title"
            );

        this.elements.dashboardMessage =
            section.querySelector(
                "#dashboard-reminders-message"
            );

        this.elements.dashboardIcon =
            section.querySelector(
                "#dashboard-reminders-icon"
            );

        this.elements.dashboardBadge =
            section.querySelector(
                "#dashboard-reminders-badge"
            );

        document.getElementById(
            "dashboard-open-reminders"
        )?.addEventListener(
            "click",
            () => this.showView(),
            {
                once: true
            }
        );
    },

    createView() {
        if (document.getElementById("view-recordatorios")) {
            this.assignViewElements();
            return;
        }
        const main = document.querySelector(".main-content");
        if (!main) return;
        const view = document.createElement("section");
        view.id = "view-recordatorios";
        view.className = "app-view";
        view.hidden = true;
        view.innerHTML = `
            <div class="view-header"><div><p class="view-eyebrow">Asistente financiero</p><h2>Recordatorios de pago</h2><p class="view-description">Consulta pagos vencidos, pagos de hoy y compromisos próximos.</p></div></div>
            <button id="back-from-reminders" class="text-button" type="button">‹ Regresar a Inicio</button>
            <section class="reminders-summary-grid">
                <article class="reminder-stat"><span>Vencidos</span><strong id="reminders-overdue">0</strong></article>
                <article class="reminder-stat"><span>Vencen hoy</span><strong id="reminders-today">0</strong></article>
                <article class="reminder-stat"><span>Próximos 3 días</span><strong id="reminders-soon">0</strong></article>
            </section>
            <div class="reminders-actions"><button id="reminders-open-calendar" class="secondary-button" type="button">Abrir calendario</button></div>
            <div id="reminders-empty" class="empty-state compact"><div class="empty-state-icon">✅</div><div><h3>No hay pagos pendientes cercanos</h3><p>Los compromisos de los próximos 31 días aparecerán aquí.</p></div></div>
            <div id="reminders-list" class="reminders-list"></div>
        `;
        main.appendChild(view);
        this.assignViewElements();
    },

    assignViewElements() {
        this.elements.view = document.getElementById("view-recordatorios");
        this.elements.list = document.getElementById("reminders-list");
        this.elements.empty = document.getElementById("reminders-empty");
        this.elements.overdue = document.getElementById("reminders-overdue");
        this.elements.today = document.getElementById("reminders-today");
        this.elements.soon = document.getElementById("reminders-soon");
    },

    connectEvents() {
        document.getElementById("back-from-reminders")?.addEventListener("click", () => {
            if (typeof window.showView === "function") window.showView("inicio", "Inicio", "Resumen financiero familiar");
        });
        document.getElementById("reminders-open-calendar")?.addEventListener("click", () => {
            if (window.FinancialCalendarUI && typeof window.FinancialCalendarUI.showCalendarView === "function") {
                window.FinancialCalendarUI.showCalendarView();
            } else {
                window.alert("El calendario financiero todavía no está disponible.");
            }
        });
        document.addEventListener("finance-reminders-changed", () => this.render());
    },

    showView() {
        if (typeof window.showView === "function") {
            window.showView("recordatorios", "Recordatorios", "Pagos próximos y vencidos");
            this.render();
        }
    },

    render() {
        if (!window.ReminderManager) return;
        this.createDashboardSection();
        const summary = window.ReminderManager.getSummary();
        const items = window.ReminderManager.getAll();
        if (this.elements.overdue) this.elements.overdue.textContent = String(summary.overdue);
        if (this.elements.today) this.elements.today.textContent = String(summary.today);
        if (this.elements.soon) this.elements.soon.textContent = String(summary.nextThreeDays);
        this.renderDashboard(summary, items);
        if (!this.elements.list || !this.elements.empty) return;
        this.elements.list.innerHTML = "";
        this.elements.empty.hidden = items.length > 0;
        items.forEach(item => this.elements.list.appendChild(this.createItem(item)));
    },

    renderDashboard(summary, items) {
        if (!this.elements.dashboardTitle) return;

        const first =
            items[0];

        const badge =
            this.elements.dashboardBadge;

        if (!first) {
            this.elements.dashboardTitle.textContent =
                "Sin pagos próximos";

            this.elements.dashboardMessage.textContent =
                "No tienes compromisos pendientes en los próximos 31 días.";

            this.elements.dashboardIcon.textContent =
                "✅";

            if (badge) {
                badge.textContent =
                    "Al día";

                badge.className =
                    "dashboard-reminder-badge is-safe";
            }

            return;
        }

        if (summary.overdue > 0) {
            this.elements.dashboardTitle.textContent =
                `${summary.overdue} pago${summary.overdue === 1 ? "" : "s"} vencido${summary.overdue === 1 ? "" : "s"}`;

            this.elements.dashboardIcon.textContent =
                "⚠️";

            if (badge) {
                badge.textContent =
                    "Vencido";

                badge.className =
                    "dashboard-reminder-badge is-danger";
            }

        } else if (summary.today > 0) {
            this.elements.dashboardTitle.textContent =
                `${summary.today} pago${summary.today === 1 ? "" : "s"} vence${summary.today === 1 ? "" : "n"} hoy`;

            this.elements.dashboardIcon.textContent =
                "⏰";

            if (badge) {
                badge.textContent =
                    "Hoy";

                badge.className =
                    "dashboard-reminder-badge is-warning";
            }

        } else if (summary.nextThreeDays > 0) {
            this.elements.dashboardTitle.textContent =
                `${summary.nextThreeDays} compromiso${summary.nextThreeDays === 1 ? "" : "s"} próximo${summary.nextThreeDays === 1 ? "" : "s"}`;

            this.elements.dashboardIcon.textContent =
                "📅";

            if (badge) {
                badge.textContent =
                    "Próximo";

                badge.className =
                    "dashboard-reminder-badge is-warning";
            }

        } else {
            this.elements.dashboardTitle.textContent =
                first.title;

            this.elements.dashboardIcon.textContent =
                "📆";

            if (badge) {
                badge.textContent =
                    "Programado";

                badge.className =
                    "dashboard-reminder-badge is-info";
            }
        }

        const status =
            window.ReminderManager
                .getStatus(
                    first
                );

        this.elements.dashboardMessage.textContent =
            `${status.label} · ${window.ReminderManager.formatCurrency(first.amount)} · ${window.ReminderManager.formatDate(first.date)}`;
    },

    createItem(item) {
        const status = window.ReminderManager.getStatus(item);
        const article = document.createElement("article");
        article.className = `reminder-item is-${status.key}`;
        article.innerHTML = `
            <div class="reminder-row"><div><h3>${this.escapeHTML(item.title)}</h3><p class="reminder-meta">${this.escapeHTML(item.description)}</p></div><strong class="reminder-amount">${window.ReminderManager.formatCurrency(item.amount)}</strong></div>
            <p class="reminder-meta">${window.ReminderManager.formatDate(item.date)}</p>
            <div class="reminder-status">${status.icon} ${status.label}</div>
        `;
        return article;
    },

    escapeHTML(value) {
        const div = document.createElement("div");
        div.textContent = String(value || "");
        return div.innerHTML;
    }
};

window.RemindersUI = RemindersUI;
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => RemindersUI.initialize());
} else {
    RemindersUI.initialize();
}
