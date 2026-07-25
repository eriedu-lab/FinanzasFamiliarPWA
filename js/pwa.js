"use strict";

(() => {
    const VERSION = "4.0.0";

    function createToast(message, actionLabel, action) {
        document.querySelector(".pwa-toast")?.remove();
        const toast = document.createElement("div");
        toast.className = "pwa-toast";
        toast.setAttribute("role", "status");
        toast.innerHTML = `<span>${message}</span>`;
        if (actionLabel && typeof action === "function") {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = actionLabel;
            button.addEventListener("click", action);
            toast.appendChild(button);
        }
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add("visible"));
        if (!actionLabel) setTimeout(() => toast.remove(), 3500);
    }

    function updateConnectionStatus() {
        document.body.classList.toggle("is-offline", !navigator.onLine);
        createToast(navigator.onLine ? "Conexión restablecida" : "Sin conexión: puedes seguir usando tus datos guardados");
    }

    window.addEventListener("offline", updateConnectionStatus);
    window.addEventListener("online", updateConnectionStatus);

    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", async () => {
        try {
            const registration = await navigator.serviceWorker.register("./service-worker.js", { scope: "./" });

            if (registration.waiting) {
                createToast("Hay una actualización disponible", "Actualizar", () => {
                    registration.waiting.postMessage({ type: "SKIP_WAITING" });
                });
            }

            registration.addEventListener("updatefound", () => {
                const worker = registration.installing;
                if (!worker) return;
                worker.addEventListener("statechange", () => {
                    if (worker.state === "installed" && navigator.serviceWorker.controller) {
                        createToast("Nueva versión lista", "Actualizar", () => {
                            worker.postMessage({ type: "SKIP_WAITING" });
                        });
                    }
                });
            });

            let refreshing = false;
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                if (refreshing) return;
                refreshing = true;
                window.location.reload();
            });

            console.info(`Finanzas Familiar ${VERSION} · PWA activa`);
        } catch (error) {
            console.warn("No fue posible activar el modo PWA", error);
        }
    });
})();
