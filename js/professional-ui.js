"use strict";

/*
=====================================
    FINANZAS FAMILIAR 2.0
    Interfaz profesional unificada
=====================================
*/

const ProfessionalUI = {

    initialized:
        false,

    initialize() {

        if (this.initialized) {

            return;

        }

        this.initialized =
            true;

        this.applySavedAppearance();
        this.normalizeMoreMenu();
        this.enhanceConfiguration();
        this.observeDynamicContent();
        this.addPageClass();

    },

    addPageClass() {

        document.documentElement
            .classList
            .add(
                "finance-ui-v2"
            );

    },

    normalizeMoreMenu() {

        const moreView =
            document.getElementById(
                "view-mas"
            );

        if (!moreView) {

            return;

        }

        const budgetButton =
            document.getElementById(
                "open-budget-view"
            );

        const groups =
            moreView.querySelectorAll(
                ".menu-group"
            );

        const financeGroup =
            groups[0];

        if (
            budgetButton &&
            financeGroup &&
            budgetButton.parentElement !==
                financeGroup
        ) {

            financeGroup.appendChild(
                budgetButton
            );

        }

        if (
            budgetButton &&
            budgetButton.dataset
                .professionalized !==
                "true"
        ) {

            budgetButton.className =
                "menu-item";

            budgetButton.innerHTML = `
                <span class="menu-item-icon orange">
                    💰
                </span>

                <span class="menu-item-content">
                    <strong>
                        Presupuesto mensual
                    </strong>

                    <small>
                        Define límites y controla tus gastos
                    </small>
                </span>

                <span class="menu-chevron">
                    ›
                </span>
            `;

            budgetButton.dataset
                .professionalized =
                    "true";

        }

        const version =
            moreView.querySelector(
                ".app-version"
            );

        if (
            version &&
            version.textContent.trim() !==
                "Finanzas Familiar · Versión 2.2"
        ) {

            version.textContent =
                "Finanzas Familiar · Versión 2.2";

        }

    },

    enhanceConfiguration() {

        const moreView =
            document.getElementById(
                "view-mas"
            );

        if (!moreView) {

            return;

        }

        const buttons =
            moreView.querySelectorAll(
                ".menu-item"
            );

        const configuration =
            Array.from(buttons)
                .find(
                    button =>
                        button.textContent
                            .includes(
                                "Configuración"
                            )
                );

        if (!configuration) {

            return;

        }

        configuration.id =
            "open-appearance-settings";

        if (
            configuration.dataset
                .appearanceBound ===
                "true"
        ) {

            return;

        }

        configuration.dataset
            .appearanceBound =
                "true";

        configuration.addEventListener(
            "click",
            () =>
                this.openAppearanceModal()
        );

    },

    openAppearanceModal() {

        let modal =
            document.getElementById(
                "appearance-settings-modal"
            );

        if (!modal) {

            modal =
                document.createElement(
                    "div"
                );

            modal.id =
                "appearance-settings-modal";

            modal.className =
                "finance-modal-overlay";

            modal.innerHTML = `
                <section
                    class="finance-modal-card"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="appearance-title"
                >
                    <div class="finance-modal-header">
                        <div>
                            <p class="card-overline">
                                Apariencia
                            </p>

                            <h2 id="appearance-title">
                                Personalizar aplicación
                            </h2>
                        </div>

                        <button
                            class="finance-modal-close"
                            type="button"
                            aria-label="Cerrar"
                        >
                            ×
                        </button>
                    </div>

                    <div class="appearance-section">
                        <strong>Tema</strong>

                        <div class="appearance-options">
                            <button
                                type="button"
                                data-theme-value="light"
                            >
                                ☀️ Claro
                            </button>

                            <button
                                type="button"
                                data-theme-value="dark"
                            >
                                🌙 Oscuro
                            </button>

                            <button
                                type="button"
                                data-theme-value="system"
                            >
                                📱 Sistema
                            </button>
                        </div>
                    </div>

                    <div class="appearance-section">
                        <strong>Color principal</strong>

                        <div class="accent-options">
                            <button
                                type="button"
                                data-accent-value="blue"
                                aria-label="Azul"
                            ></button>

                            <button
                                type="button"
                                data-accent-value="green"
                                aria-label="Verde"
                            ></button>

                            <button
                                type="button"
                                data-accent-value="purple"
                                aria-label="Morado"
                            ></button>

                            <button
                                type="button"
                                data-accent-value="orange"
                                aria-label="Naranja"
                            ></button>
                        </div>
                    </div>
                </section>
            `;

            document.body.appendChild(
                modal
            );

            modal.querySelector(
                ".finance-modal-close"
            ).addEventListener(
                "click",
                () => modal.hidden = true
            );

            modal.addEventListener(
                "click",
                event => {

                    if (event.target === modal) {

                        modal.hidden =
                            true;

                    }

                }
            );

            modal.querySelectorAll(
                "[data-theme-value]"
            ).forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            this.setTheme(
                                button.dataset
                                    .themeValue
                            );

                            this.updateSelectedOptions();

                        }
                    );

                }
            );

            modal.querySelectorAll(
                "[data-accent-value]"
            ).forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            this.setAccent(
                                button.dataset
                                    .accentValue
                            );

                            this.updateSelectedOptions();

                        }
                    );

                }
            );

        }

        modal.hidden =
            false;

        this.updateSelectedOptions();

    },

    setTheme(value) {

        localStorage.setItem(
            "financeAppearance",
            value
        );

        this.applyTheme(
            value
        );

    },

    setAccent(value) {

        localStorage.setItem(
            "financeAccent",
            value
        );

        document.documentElement
            .dataset
            .financeAccent =
                value;

    },

    applySavedAppearance() {

        const appearance =
            localStorage.getItem(
                "financeAppearance"
            ) ||
            "system";

        const accent =
            localStorage.getItem(
                "financeAccent"
            ) ||
            "blue";

        this.applyTheme(
            appearance
        );

        document.documentElement
            .dataset
            .financeAccent =
                accent;

    },

    applyTheme(value) {
        const allowed = ["light", "dark", "system"];
        const selected = allowed.includes(value) ? value : "system";
        document.documentElement.dataset.financeTheme = selected;
        document.documentElement.style.colorScheme = selected === "system" ? "light dark" : selected;
        const meta = document.querySelector('meta[name="theme-color"]');
        const dark = selected === "dark" || (selected === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        if (meta) meta.setAttribute("content", dark ? "#0b0b0d" : "#f2f2f7");
    },

    updateSelectedOptions() {

        const modal =
            document.getElementById(
                "appearance-settings-modal"
            );

        if (!modal) {

            return;

        }

        const theme =
            localStorage.getItem(
                "financeAppearance"
            ) ||
            "system";

        const accent =
            localStorage.getItem(
                "financeAccent"
            ) ||
            "blue";

        modal.querySelectorAll(
            "[data-theme-value]"
        ).forEach(
            button => {

                button.classList.toggle(
                    "selected",
                    button.dataset
                        .themeValue ===
                        theme
                );

            }
        );

        modal.querySelectorAll(
            "[data-accent-value]"
        ).forEach(
            button => {

                button.classList.toggle(
                    "selected",
                    button.dataset
                        .accentValue ===
                        accent
                );

            }
        );

    },

    observeDynamicContent() {

        const moreView =
            document.getElementById(
                "view-mas"
            );

        if (!moreView) {

            return;

        }

        let scheduled =
            false;

        const observer =
            new MutationObserver(
                () => {

                    if (scheduled) {

                        return;

                    }

                    scheduled =
                        true;

                    window.requestAnimationFrame(
                        () => {

                            scheduled =
                                false;

                            this.normalizeMoreMenu();
                            this.enhanceConfiguration();

                        }
                    );

                }
            );

        observer.observe(
            moreView,
            {
                childList: true
            }
        );

    }

};

window.ProfessionalUI =
    ProfessionalUI;

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () =>
            ProfessionalUI.initialize()
    );

} else {

    ProfessionalUI.initialize();

}
