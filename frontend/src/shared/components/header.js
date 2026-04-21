import { navIds } from "../../../../shared/navigation.js";

export function renderHeader(context) {
    const element = document.getElementById("headerWidget");
    if(!element) return;
    
    const customerView = context.role == "customer";
    const id = context.entityId;

    element.innerHTML = `
        <div class="flex items-center gap-2">
            <img alt="Logo Ternium" class="h-8 ml-5"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Ternium_Logo.svg/1280px-Ternium_Logo.svg.png">
        </div>
        <nav class="hidden md:flex items-center justify-center gap-6">
            <a id="${navIds.home}" class="text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src/home/home.html?type=home${customerView ? `&id=${id}` : ""}">Inicio</a>
            <a id="${navIds.customers}" class="${customerView ? "hidden " : ""} text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5 font-semibold" href="/frontend/src/shared/list_view.html?type=${navIds.customers}">Clientes</a>
            <a id="${navIds.consignees}" class="${!customerView ? "hidden " : ""} text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5 font-semibold" href="/frontend/src/shared/list_view.html?type=${navIds.consignees}&id=${id}">Consignatarios</a>
            <a id="${navIds.platforms}" class="${!customerView ? "hidden " : ""} text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5 font-semibold" href="/frontend/src/shared/list_view.html?type=${navIds.platforms}&id=${id}">Tarimas</a>
            <a id="${navIds.commercial}" class="${customerView ? "hidden " : ""} text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src/shared/list_view.html?type=${navIds.commercial}">Comercial</a>
            <a id="${navIds.products}" class="${customerView ? "hidden " : ""} text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src/shared/list_view.html?type=${navIds.products}">Productos</a>
            <a id="${navIds.presets}" class="${customerView ? "hidden " : ""} text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src/shared/list_view.html?type=${navIds.presets}">Paquetes</a>
            <a id="${navIds.followUps}" class="${customerView ? "hidden " : ""} text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src/shared/list_view.html?type=${navIds.followUps}">Seguimientos</a>
            <a id="${navIds.users}" class="${customerView ? "hidden " : ""} text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src/shared/list_view.html?type=${navIds.users}">Usuarios</a>
        </nav>
        <button class="size-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100">
            <span class="material-symbols-outlined text-xl">notifications</span>
        </button>
    `
}

