"use strict";

/*
=====================================
    COMPROBACIÓN DE NAVEGACIÓN
    Versión 2.1 Build 2
=====================================
*/

(function () {

    function verifyVisibleViews() {

        const visibleViews =
            Array.from(
                document.querySelectorAll(
                    ".app-view"
                )
            ).filter(
                function (view) {

                    return (
                        !view.hidden &&
                        view.classList.contains(
                            "active"
                        )
                    );

                }
            );

        if (visibleViews.length > 1) {

            visibleViews
                .slice(
                    0,
                    -1
                )
                .forEach(
                    function (view) {

                        view.classList.remove(
                            "active"
                        );

                        view.hidden =
                            true;

                    }
                );

        }

    }

    document.addEventListener(
        "click",
        function (event) {

            if (
                event.target.closest(
                    ".nav-button, [data-navigation]"
                )
            ) {

                requestAnimationFrame(
                    verifyVisibleViews
                );

            }

        }
    );

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            verifyVisibleViews
        );

    } else {

        verifyVisibleViews();

    }

})();
