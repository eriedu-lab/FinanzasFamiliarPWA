"use strict";

const navigationButtons =
    document.querySelectorAll(
        ".nav-button"
    );

const appViews =
    document.querySelectorAll(
        ".app-view"
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

    appViews.forEach(
        function (view) {

            view.classList.remove(
                "active"
            );

        }
    );

    navigationButtons.forEach(
        function (button) {

            button.classList.remove(
                "active"
            );

        }
    );

    selectedView.classList.add(
        "active"
    );

    const selectedButton =
        document.querySelector(
            `.nav-button[data-view="${viewName}"]`
        );

    if (selectedButton) {

        selectedButton.classList.add(
            "active"
        );

    }

    pageTitle.textContent =
        title || "Finanzas Familiar";

    pageSubtitle.textContent =
        subtitle || "";

    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );

}

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

                if (!navigationButton) {

                    return;

                }

                showView(
                    viewName,
                    navigationButton.dataset.title,
                    navigationButton.dataset.subtitle
                );

            }
        );

    }
);

document.addEventListener(
    "DOMContentLoaded",
    function () {

        showView(
            "inicio",
            "Inicio",
            "Resumen de tus finanzas familiares"
        );

    }
);