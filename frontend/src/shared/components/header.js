import { navIds } from "../../../../shared/navigation.js";
import { session } from "../session.js";

export function renderHeader(context) {
    const element = document.getElementById("headerWidget");
    if (!element) return;

    const role = context.role;
    const id = context.customerId;

    const customerView = role === "customer";

    // Definir qué nav items ve cada rol
    const navAccess = {
        admin: {
            home: true,
            customers: true, consignees: false, platforms: false,
            commercial: true, products: true, presets: true,
            followUps: true, users: true,
        },
        customer: {
            home: true,
            customers: false, consignees: true, platforms: true,
            commercial: false, products: false, presets: false,
            followUps: true, users: false,
        },
        gestion_clientes: {
            home: true,
            customers: true, consignees: false, platforms: false,
            commercial: true, products: false, presets: false,
            followUps: true, users: false,
        },
        operador_logistico: {
            home: true,
            customers: false, consignees: false, platforms: false,
            commercial: false, products: true, presets: true,
            followUps: true, users: false,
        },
    };

    const access = navAccess[role] ?? navAccess.admin;

    const show = (key) => access[key] ? "" : "hidden ";

    element.innerHTML = `
        <div class="flex items-center gap-2">
            <img alt="Logo Ternium" class="h-8 ml-5"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Ternium_Logo.svg/1280px-Ternium_Logo.svg.png">
        </div>
        <nav class="hidden md:flex items-center justify-center gap-6">
            <a id="${navIds.home}" class="${show("home")}text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5"
                href="/frontend/src/home/home.html?type=home${customerView ? `&id=${id}` : ""}">Inicio</a>
            <a id="${navIds.customers}" class="${show("customers")}text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5"
                href="/frontend/src/shared/list_view.html?type=${navIds.customers}">Clientes</a>
            <a id="${navIds.consignees}" class="${show("consignees")}text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5"
                href="/frontend/src/shared/list_view.html?type=${navIds.consignees}&id=${id}">Consignatarios</a>
            <a id="${navIds.platforms}" class="${show("platforms")}text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5"
                href="/frontend/src/shared/list_view.html?type=${navIds.platforms}&id=${id}">Tarimas</a>
            <a id="${navIds.commercial}" class="${show("commercial")}text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5"
                href="/frontend/src/shared/list_view.html?type=${navIds.commercial}">Comercial</a>
            <a id="${navIds.products}" class="${show("products")}text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5"
                href="/frontend/src/shared/list_view.html?type=${navIds.products}">Productos</a>
            <a id="${navIds.presets}" class="${show("presets")}text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5"
                href="/frontend/src/shared/list_view.html?type=${navIds.presets}">Paquetes</a>
            <a id="${navIds.followUps}" class="${show("followUps")}text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5"
                href="/frontend/src/shared/list_view.html?type=${navIds.followUps}">Seguimientos</a>
            <a id="${navIds.users}" class="${show("users")}text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5"
                href="/frontend/src/shared/list_view.html?type=${navIds.users}">Usuarios</a>
        </nav>
        <button id="logoutBtn" class="flex items-center gap-1 mr-5 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors">
            <span class="material-symbols-outlined text-xl">logout</span>
            <span class="hidden md:inline">Salir</span>
        </button>
    `;

    document.getElementById("logoutBtn").addEventListener("click", () => {
        session.clearSession();
        window.location.href = "/frontend/src/index.html";
    });
}