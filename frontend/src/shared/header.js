document.getElementById("headerWidget").innerHTML = `
    <div class="flex items-center gap-2">
        <img alt="Logo Ternium" class="h-8 ml-5"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Ternium_Logo.svg/1280px-Ternium_Logo.svg.png">
    </div>
    <nav class="hidden md:flex items-center justify-center gap-6">
        <a id="home" class="text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src/home/home.html?type=home">Inicio</a>
        <a id="customers" class="text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5 font-semibold" href="/frontend/src/shared/list_view.html?type=customers">Clientes</a>
        <a id="commercial" class="text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src/shared/list_view.html?type=commercial">Comercial</a>
        <a id="products" class="text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src/shared/list_view.html?type=products">Productos</a>
        <a id="presets" class="text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src/shared/list_view.html?type=presets">Paquetes</a>
        <a id="followUps" class="text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="#">Seguimiento</a>
        <a id="users" class="text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src//shared/list_view.html?type=users">Usuarios</a>
    </nav>
    <button class="size-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100">
        <span class="material-symbols-outlined text-xl">notifications</span>
    </button>
`;

export function renderHeader(context) {
    const element = document.getElementById("headerWidget");
    if(!element) return;

    const customerView = context.role == "customer";

    element.innerHTML = `
        <div class="flex items-center gap-2">
            <img alt="Logo Ternium" class="h-8 ml-5"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Ternium_Logo.svg/1280px-Ternium_Logo.svg.png">
        </div>
        <nav class="hidden md:flex items-center justify-center gap-6">
            <a id="home" class="text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src/home/home.html?type=home">Inicio</a>
            <a id="customers" class="${customerView ? "hidden " : ""} text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5 font-semibold" href="/frontend/src/shared/list_view.html?type=customers">Clientes</a>
            <a id="consignees" class="${!customerView ? "hidden " : ""} text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5 font-semibold" href="/frontend/src/shared/list_view.html?type=consignees">Consignatarios</a>
            <a id="commercial" class="${customerView ? "hidden " : ""} text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src/shared/list_view.html?type=commercial">Comercial</a>
            <a id="products" class="${customerView ? "hidden " : ""} text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src/shared/list_view.html?type=products">Productos</a>
            <a id="presets" class="${customerView ? "hidden " : ""} text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src/shared/list_view.html?type=presets">Paquetes</a>
            <a id="followUps" class="text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="#">Seguimiento</a>
            <a id="users" class="${customerView ? "hidden " : ""} text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src//shared/list_view.html?type=users">Usuarios</a>
        </nav>
        <button class="size-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100">
            <span class="material-symbols-outlined text-xl">notifications</span>
        </button>
    `
}