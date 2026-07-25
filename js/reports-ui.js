"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Centro Premium - Interfaz
=====================================
*/

const PremiumReportsUI = {

    elements: {},
    records: [],
    filteredRecords: [],
    summary: null,

    initialize() {

        this.elements = {
            view:
                document.getElementById(
                    "view-reportes"
                ),
            periodType:
                document.getElementById(
                    "premium-period-type"
                ),
            month:
                document.getElementById(
                    "premium-month"
                ),
            monthField:
                document.getElementById(
                    "premium-month-field"
                ),
            year:
                document.getElementById(
                    "premium-year"
                ),
            yearField:
                document.getElementById(
                    "premium-year-field"
                ),
            type:
                document.getElementById(
                    "premium-type"
                ),
            category:
                document.getElementById(
                    "premium-category"
                ),
            minimum:
                document.getElementById(
                    "premium-min-amount"
                ),
            maximum:
                document.getElementById(
                    "premium-max-amount"
                ),
            search:
                document.getElementById(
                    "premium-search"
                ),
            results:
                document.getElementById(
                    "premium-results-list"
                ),
            empty:
                document.getElementById(
                    "premium-empty-state"
                ),
            income:
                document.getElementById(
                    "premium-total-income"
                ),
            expense:
                document.getElementById(
                    "premium-total-expense"
                ),
            commitments:
                document.getElementById(
                    "premium-total-commitments"
                ),
            balance:
                document.getElementById(
                    "premium-total-balance"
                ),
            largestExpense:
                document.getElementById(
                    "premium-largest-expense"
                ),
            largestExpenseDetail:
                document.getElementById(
                    "premium-largest-expense-detail"
                ),
            topCategory:
                document.getElementById(
                    "premium-top-category"
                ),
            topCategoryDetail:
                document.getElementById(
                    "premium-top-category-detail"
                ),
            resultCount:
                document.getElementById(
                    "premium-result-count"
                ),
            periodBadge:
                document.getElementById(
                    "premium-active-period"
                )
        };

        if (!this.elements.view) {
            return;
        }

        const currentDate =
            new Date();

        this.elements.month.value =
            [
                currentDate.getFullYear(),
                String(
                    currentDate.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                )
            ].join("-");

        this.bindEvents();
        this.render();

        document.addEventListener(
            "finance-data-changed",
            () => this.render()
        );

    },

    bindEvents() {

        [
            this.elements.periodType,
            this.elements.month,
            this.elements.year,
            this.elements.type,
            this.elements.category,
            this.elements.minimum,
            this.elements.maximum
        ]
        .filter(Boolean)
        .forEach(
            element =>
                element.addEventListener(
                    "change",
                    () => this.render()
                )
        );

        let searchTimer = null;

        this.elements.search
            ?.addEventListener(
                "input",
                () => {

                    clearTimeout(
                        searchTimer
                    );

                    searchTimer =
                        setTimeout(
                            () => this.render(),
                            140
                        );

                }
            );

        document.getElementById(
            "premium-clear-search"
        )?.addEventListener(
            "click",
            () => {

                this.elements.search.value =
                    "";

                this.elements.minimum.value =
                    "";

                this.elements.maximum.value =
                    "";

                this.elements.type.value =
                    "all";

                this.elements.category.value =
                    "all";

                this.render();

            }
        );

        document.getElementById(
            "premium-export-csv"
        )?.addEventListener(
            "click",
            () => this.exportDetailedCsv()
        );

        document.getElementById(
            "premium-export-summary-csv"
        )?.addEventListener(
            "click",
            () => this.exportSummaryCsv()
        );

        document.getElementById(
            "premium-print-report"
        )?.addEventListener(
            "click",
            () => this.printReport()
        );

        document.getElementById(
            "premium-copy-summary"
        )?.addEventListener(
            "click",
            () => this.copySummary()
        );

    },

    render() {

        this.records =
            PremiumReports
                .getAllRecords();

        this.populateYears();
        this.populateCategories();
        this.updatePeriodFields();

        const filters =
            this.getFilters();

        this.filteredRecords =
            PremiumReports.filter(
                this.records,
                filters
            );

        this.summary =
            PremiumReports.summarize(
                this.filteredRecords
            );

        this.renderSummary();
        this.renderInsights();
        this.renderResults();
        this.renderPeriodBadge();

    },

    populateYears() {

        const currentValue =
            this.elements.year.value;

        const years =
            PremiumReports.getAvailableYears(
                this.records
            );

        this.elements.year.innerHTML =
            years
                .map(
                    year =>
                        `<option value="${this.escape(year)}">${this.escape(year)}</option>`
                )
                .join("");

        this.elements.year.value =
            years.includes(
                currentValue
            )
                ? currentValue
                : String(
                    new Date().getFullYear()
                );

    },

    populateCategories() {

        const currentValue =
            this.elements.category.value;

        const categories =
            PremiumReports.getCategories(
                this.records
            );

        this.elements.category.innerHTML =
            [
                '<option value="all">Todas</option>',
                ...categories.map(
                    category =>
                        `<option value="${this.escape(category)}">${this.escape(category)}</option>`
                )
            ].join("");

        this.elements.category.value =
            categories.includes(
                currentValue
            )
                ? currentValue
                : "all";

    },

    updatePeriodFields() {

        const type =
            this.elements.periodType.value;

        this.elements.monthField.hidden =
            type !== "month";

        this.elements.yearField.hidden =
            type !== "year";

    },

    getFilters() {

        return {
            periodType:
                this.elements.periodType.value,
            month:
                this.elements.month.value,
            year:
                this.elements.year.value,
            type:
                this.elements.type.value,
            category:
                this.elements.category.value,
            minimum:
                this.elements.minimum.value,
            maximum:
                this.elements.maximum.value,
            search:
                this.elements.search.value
        };

    },

    renderSummary() {

        this.elements.income.textContent =
            this.formatCurrency(
                this.summary.income
            );

        this.elements.expense.textContent =
            this.formatCurrency(
                this.summary.expense
            );

        this.elements.commitments.textContent =
            this.formatCurrency(
                this.summary.commitments
            );

        this.elements.balance.textContent =
            this.formatCurrency(
                this.summary.balance
            );

        this.elements.balance.classList.toggle(
            "premium-negative-value",
            this.summary.balance < 0
        );

    },

    renderInsights() {

        const largest =
            this.summary.largestExpense;

        if (largest) {
            this.elements.largestExpense.textContent =
                largest.name;

            this.elements.largestExpenseDetail.textContent =
                `${this.formatCurrency(
                    largest.amount
                )} · ${largest.category}`;
        } else {
            this.elements.largestExpense.textContent =
                "Sin datos";

            this.elements.largestExpenseDetail.textContent =
                "No hay gastos dentro del periodo seleccionado.";
        }

        const category =
            this.summary.topCategory;

        if (category) {
            this.elements.topCategory.textContent =
                category[0];

            this.elements.topCategoryDetail.textContent =
                `${this.formatCurrency(
                    category[1]
                )} acumulados.`;
        } else {
            this.elements.topCategory.textContent =
                "Sin datos";

            this.elements.topCategoryDetail.textContent =
                "No hay categorías de gasto para analizar.";
        }

        this.elements.resultCount.textContent =
            String(
                this.summary.count
            );

    },

    renderResults() {

        this.elements.empty.hidden =
            this.filteredRecords.length > 0;

        if (
            this.filteredRecords.length ===
            0
        ) {

            this.elements.results.innerHTML =
                "";

            return;

        }

        this.elements.results.innerHTML =
            this.filteredRecords
                .map(
                    record =>
                        this.createRecordMarkup(
                            record
                        )
                )
                .join("");

    },

    createRecordMarkup(record) {

        const iconMap = {
            income: "↓",
            expense: "↑",
            card: "💳",
            plan: "📅"
        };

        return `
            <article class="premium-result-item">
                <div class="premium-result-icon ${this.escape(record.type)}">
                    ${iconMap[record.type] || "•"}
                </div>

                <div class="premium-result-main">
                    <div class="premium-result-heading">
                        <strong>${this.escape(record.name)}</strong>
                        <span>${this.escape(record.typeLabel)}</span>
                    </div>

                    <p>
                        ${this.escape(record.category)}
                        ${record.detail ? ` · ${this.escape(record.detail)}` : ""}
                    </p>
                </div>

                <div class="premium-result-value">
                    <strong class="${record.type === "income" ? "is-income" : ""}">
                        ${record.type === "income" ? "+" : "-"}${this.formatCurrency(record.amount)}
                    </strong>
                    <span>${this.formatDate(record.date)}</span>
                </div>
            </article>
        `;

    },

    renderPeriodBadge() {

        this.elements.periodBadge.textContent =
            this.getPeriodLabel();

    },

    getPeriodLabel() {

        const type =
            this.elements.periodType.value;

        if (type === "all") {
            return "Todo el historial";
        }

        if (type === "year") {
            return `Año ${this.elements.year.value}`;
        }

        const value =
            this.elements.month.value;

        if (!value) {
            return "Mes seleccionado";
        }

        const [
            year,
            month
        ] = value.split("-");

        const date =
            new Date(
                Number(year),
                Number(month) - 1,
                1
            );

        const label =
            new Intl.DateTimeFormat(
                "es-MX",
                {
                    month: "long",
                    year: "numeric"
                }
            ).format(
                date
            );

        return label
            .charAt(0)
            .toUpperCase() +
            label.slice(1);

    },

    exportDetailedCsv() {

        if (
            this.filteredRecords.length ===
            0
        ) {

            this.showMessage(
                "No hay movimientos para exportar."
            );

            return;

        }

        const csv =
            PremiumReports.toCsv(
                this.filteredRecords
            );

        this.downloadTextFile(
            csv,
            `movimientos-${this.filePeriod()}.csv`,
            "text/csv;charset=utf-8;"
        );

    },

    exportSummaryCsv() {

        const csv =
            PremiumReports.summaryToCsv(
                this.summary,
                this.getPeriodLabel()
            );

        this.downloadTextFile(
            csv,
            `resumen-financiero-${this.filePeriod()}.csv`,
            "text/csv;charset=utf-8;"
        );

    },

    async copySummary() {

        const text =
            [
                `Resumen financiero - ${this.getPeriodLabel()}`,
                `Ingresos: ${this.formatCurrency(this.summary.income)}`,
                `Gastos: ${this.formatCurrency(this.summary.expense)}`,
                `Tarjetas y planes: ${this.formatCurrency(this.summary.commitments)}`,
                `Balance: ${this.formatCurrency(this.summary.balance)}`,
                `Movimientos encontrados: ${this.summary.count}`
            ].join("\n");

        try {
            await navigator.clipboard.writeText(
                text
            );

            this.showMessage(
                "Resumen copiado."
            );
        } catch (error) {
            this.showMessage(
                "No fue posible copiar el resumen."
            );
        }

    },

    printReport() {

        const reportWindow =
            window.open(
                "",
                "_blank",
                "width=900,height=720"
            );

        if (!reportWindow) {
            this.showMessage(
                "Permite las ventanas emergentes para generar el reporte."
            );
            return;
        }

        const rows =
            this.filteredRecords
                .map(
                    record => `
                        <tr>
                            <td>${this.escape(record.date)}</td>
                            <td>${this.escape(record.typeLabel)}</td>
                            <td>${this.escape(record.name)}</td>
                            <td>${this.escape(record.category)}</td>
                            <td>${this.formatCurrency(record.amount)}</td>
                        </tr>
                    `
                )
                .join("");

        reportWindow.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reporte financiero</title>
                <style>
                    * { box-sizing: border-box; }
                    body {
                        margin: 0;
                        padding: 36px;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                        color: #152033;
                        background: #ffffff;
                    }
                    header {
                        padding-bottom: 22px;
                        border-bottom: 2px solid #e8ecf3;
                    }
                    h1 { margin: 0 0 6px; font-size: 28px; }
                    p { margin: 0; color: #667085; }
                    .summary {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 12px;
                        margin: 24px 0;
                    }
                    .card {
                        padding: 15px;
                        border: 1px solid #e5e9f0;
                        border-radius: 14px;
                    }
                    .card span {
                        display: block;
                        margin-bottom: 8px;
                        color: #667085;
                        font-size: 11px;
                        text-transform: uppercase;
                    }
                    .card strong { font-size: 18px; }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 12px;
                    }
                    th, td {
                        padding: 10px 8px;
                        border-bottom: 1px solid #e7eaf0;
                        text-align: left;
                    }
                    th {
                        color: #475467;
                        background: #f7f8fb;
                    }
                    td:last-child, th:last-child { text-align: right; }
                    footer {
                        margin-top: 24px;
                        color: #98a2b3;
                        font-size: 10px;
                        text-align: center;
                    }
                    @media print {
                        body { padding: 12mm; }
                    }
                </style>
            </head>
            <body>
                <header>
                    <h1>Finanzas Familiar</h1>
                    <p>Reporte financiero · ${this.escape(this.getPeriodLabel())}</p>
                </header>

                <section class="summary">
                    <div class="card">
                        <span>Ingresos</span>
                        <strong>${this.formatCurrency(this.summary.income)}</strong>
                    </div>
                    <div class="card">
                        <span>Gastos</span>
                        <strong>${this.formatCurrency(this.summary.expense)}</strong>
                    </div>
                    <div class="card">
                        <span>Tarjetas y planes</span>
                        <strong>${this.formatCurrency(this.summary.commitments)}</strong>
                    </div>
                    <div class="card">
                        <span>Balance</span>
                        <strong>${this.formatCurrency(this.summary.balance)}</strong>
                    </div>
                </section>

                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="5">No hay movimientos en este periodo.</td></tr>'}
                    </tbody>
                </table>

                <footer>
                    Generado desde Finanzas Familiar · ${new Date().toLocaleString("es-MX")}
                </footer>

                <script>
                    window.addEventListener("load", function () {
                        setTimeout(function () {
                            window.print();
                        }, 250);
                    });
                <\/script>
            </body>
            </html>
        `);

        reportWindow.document.close();

    },

    downloadTextFile(
        content,
        filename,
        type
    ) {

        const blob =
            new Blob(
                [
                    "\uFEFF",
                    content
                ],
                {
                    type
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            url;

        link.download =
            filename;

        document.body.appendChild(
            link
        );

        link.click();
        link.remove();

        setTimeout(
            () =>
                URL.revokeObjectURL(
                    url
                ),
            1000
        );

    },

    filePeriod() {

        return this.getPeriodLabel()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-|-$|/g,
                ""
            ) || "reporte";

    },

    formatCurrency(value) {

        return new Intl.NumberFormat(
            "es-MX",
            {
                style: "currency",
                currency: "MXN"
            }
        ).format(
            Number(value) || 0
        );

    },

    formatDate(value) {

        if (!value) {
            return "Sin fecha";
        }

        const date =
            new Date(
                `${value}T12:00:00`
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return value;
        }

        return new Intl.DateTimeFormat(
            "es-MX",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ).format(
            date
        );

    },

    showMessage(message) {

        const existing =
            document.getElementById(
                "premium-toast"
            );

        existing?.remove();

        const toast =
            document.createElement(
                "div"
            );

        toast.id =
            "premium-toast";

        toast.className =
            "premium-toast";

        toast.textContent =
            message;

        document.body.appendChild(
            toast
        );

        requestAnimationFrame(
            () =>
                toast.classList.add(
                    "visible"
                )
        );

        setTimeout(
            () => {
                toast.classList.remove(
                    "visible"
                );

                setTimeout(
                    () => toast.remove(),
                    220
                );
            },
            2200
        );

    },

    escape(value) {

        return String(
            value ?? ""
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

    }

};

window.PremiumReportsUI =
    PremiumReportsUI;

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () =>
            PremiumReportsUI
                .initialize()
    );

} else {

    PremiumReportsUI
        .initialize();

}
