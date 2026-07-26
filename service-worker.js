"use strict";

const CACHE_NAME = "finanzas-familiar-v5.0.0";
const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./css/styles.css",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/apple-touch-icon.png",
    "./js/app.js",
    "./js/backup-ui.js",
    "./js/backup.js",
    "./js/budget-ui.js",
    "./js/budget.js",
    "./js/calendar-ui.js",
    "./js/calendar.js",
    "./js/card-transactions-ui.js",
    "./js/card-transactions.js",
    "./js/cards-ui.js",
    "./js/cards.js",
    "./js/dashboard.js",
    "./js/expense-ui.js",
    "./js/expense.js",
    "./js/goals-ui.js",
    "./js/goals.js",
    "./js/history-ui.js",
    "./js/history.js",
    "./js/income-ui.js",
    "./js/income.js",
    "./js/manager-bridge.js",
    "./js/navigation-fix.js",
    "./js/navigation-self-check.js",
    "./js/plans-ui.js",
    "./js/plans.js",
    "./js/professional-ui.js",
    "./js/pwa.js",
    "./js/reminders-ui.js",
    "./js/reminders.js",
    "./js/reports-ui.js",
    "./js/reports.js",
    "./js/statistics-ui.js",
    "./js/statistics.js",
    "./js/storage.js"
];

self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("message", event => {
    if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
                    return response;
                })
                .catch(() => caches.match("./index.html"))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
            if (response.ok) {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
            }
            return response;
        }))
    );
});
