"use strict";

/* =====================================
   PUENTE DE ADMINISTRADORES
===================================== */

if (typeof IncomeManager !== "undefined") {

    window.IncomeManager =
        IncomeManager;

}

if (typeof ExpenseManager !== "undefined") {

    window.ExpenseManager =
        ExpenseManager;

}

if (typeof CardManager !== "undefined") {

    window.CardManager =
        CardManager;

}

if (typeof PaymentPlanManager !== "undefined") {

    window.PaymentPlanManager =
        PaymentPlanManager;

}
