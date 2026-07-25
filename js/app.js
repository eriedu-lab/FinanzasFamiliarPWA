"use strict";

const navigationButtons =
    document.querySelectorAll(
        ".nav-button"
    );

const pageTitle =
    document.getElementById(
        "page-title"
    );

const pageSubtitle =
    document.getElementById(
        "page-subtitle"
    );

const navigationLinks =
    document.querySelectorAll(
        "[data-navigation]"
    );

function showView(
    viewName,
    title,
    subtitle
) {

    const selectedView =
        document.getElementById(
            `view-${viewName}`
        );

    if (!selectedView) {

        console.error(
            `No se encontró la vista: ${viewName}`
        );

        return;

    }

    const currentAppViews =
        document.querySelectorAll(
            ".app-view"
        );

    currentAppViews.forEach(
        function (view) {

            const isSelected =
                view === selectedView;

            view.classList.toggle(
                "active",
                isSelected
            );

            view.hidden =
                !isSelected;

        }
    );

    navigationButtons.forEach(
        function (button) {

            button.classList.remove(
                "active"
            );

        }
    );

    const selectedButton =
        document.querySelector(
            `.nav-button[data-view="${viewName}"]`
        );

    if (selectedButton) {

        selectedButton.classList.add(
            "active"
        );

    } else if (
        viewName === "planes" ||
        viewName === "calendario" ||
        viewName === "metas" ||
        viewName === "historial" ||
        viewName === "estadisticas"
    ) {

        document
            .querySelector(
                '.nav-button[data-view="mas"]'
            )
            ?.classList.add(
                "active"
            );

    }

    if (pageTitle) {

        pageTitle.textContent =
            title || "Finanzas Familiar";

    }

    if (pageSubtitle) {

        pageSubtitle.textContent =
            subtitle || "";

    }

    if (
        viewName === "planes" &&
        window.PaymentPlansUI &&
        typeof window.PaymentPlansUI.render ===
            "function"
    ) {

        window.PaymentPlansUI.render();

    }

    if (
        viewName === "calendario" &&
        window.FinancialCalendarUI &&
        typeof window.FinancialCalendarUI.renderCalendar ===
            "function"
    ) {

        window.FinancialCalendarUI
            .renderCalendar();

    }

    if (
        viewName === "estadisticas" &&
        window.StatisticsUI &&
        typeof window.StatisticsUI.render ===
            "function"
    ) {

        window.StatisticsUI.render();

    }

    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );

}

window.showView =
    showView;

navigationButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const viewName =
                    button.dataset.view;

                const title =
                    button.dataset.title;

                const subtitle =
                    button.dataset.subtitle;

                showView(
                    viewName,
                    title,
                    subtitle
                );

            }
        );

    }
);

navigationLinks.forEach(
    function (link) {

        link.addEventListener(
            "click",
            function () {

                const viewName =
                    link.dataset.navigation;

                const navigationButton =
                    document.querySelector(
                        `.nav-button[data-view="${viewName}"]`
                    );

                const title =
                    navigationButton
                        ? navigationButton.dataset.title
                        : link.dataset.title;

                const subtitle =
                    navigationButton
                        ? navigationButton.dataset.subtitle
                        : link.dataset.subtitle;

                showView(
                    viewName,
                    title || "Finanzas Familiar",
                    subtitle || ""
                );

            }
        );

    }
);


function loadApplicationScript(source) {

    return new Promise(
        function (resolve, reject) {

            const existingScript =
                document.querySelector(
                    `script[src="${source}"]`
                );

            if (existingScript) {

                if (
                    existingScript.dataset.loaded ===
                    "true"
                ) {

                    resolve();

                } else {

                    existingScript.addEventListener(
                        "load",
                        resolve,
                        {
                            once: true
                        }
                    );

                    existingScript.addEventListener(
                        "error",
                        reject,
                        {
                            once: true
                        }
                    );

                }

                return;

            }

            const script =
                document.createElement(
                    "script"
                );

            script.src =
                source;

            script.onload =
                function () {

                    script.dataset.loaded =
                        "true";

                    resolve();

                };

            script.onerror =
                function () {

                    reject(
                        new Error(
                            `No se pudo cargar ${source}`
                        )
                    );

                };

            document.body.appendChild(
                script
            );

        }
    );

}

async function loadBudgetModule() {

    try {

        await loadApplicationScript(
            "js/budget.js"
        );

        await loadApplicationScript(
            "js/budget-ui.js"
        );

    } catch (error) {

        console.error(
            "No se pudo iniciar el módulo de presupuesto.",
            error
        );

    }

}


async function loadCardTransactionsModule() {

    try {

        await loadApplicationScript(
            "js/card-transactions.js"
        );

        await loadApplicationScript(
            "js/card-transactions-ui.js"
        );

    } catch (error) {

        console.error(
            "No se pudo iniciar el registro de movimientos de tarjetas.",
            error
        );

    }

}



async function loadProfessionalUIModule() {

    try {

        await loadApplicationScript(
            "js/professional-ui.js"
        );

    } catch (error) {

        console.error(
            "No se pudo iniciar la interfaz profesional.",
            error
        );

    }

}

async function loadStatisticsModule() {

    try {

        await loadApplicationScript(
            "js/statistics.js"
        );

        await loadApplicationScript(
            "js/statistics-ui.js"
        );

    } catch (error) {

        console.error(
            "No se pudo iniciar el centro de estadísticas.",
            error
        );

    }

}

async function loadHistoryModule() {

    try {

        await loadApplicationScript(
            "js/history.js"
        );

        await loadApplicationScript(
            "js/history-ui.js"
        );

    } catch (error) {

        console.error(
            "No se pudo iniciar el historial financiero.",
            error
        );

    }

}

async function loadBackupModule() {

    try {

        await loadApplicationScript(
            "js/backup.js"
        );

        await loadApplicationScript(
            "js/backup-ui.js"
        );

    } catch (error) {

        console.error(
            "No se pudo iniciar el módulo de respaldo.",
            error
        );

    }

}

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await Promise.all(
            [
                loadBudgetModule(),
                loadBackupModule(),
                loadHistoryModule(),
                loadCardTransactionsModule(),
                loadStatisticsModule(),
                loadProfessionalUIModule()
            ]
        );

        showView(
            "inicio",
            "Inicio",
            "Resumen de tus finanzas familiares"
        );

    }
);
