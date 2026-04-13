import { session } from "./session.js";

const clientId = session.getClientId();

document.getElementById("headerWidget").innerHTML = `
        <!-- LEFT SIDE -->
        <div class="flex items-center gap-10">
            <div class="flex items-center gap-2">
                <img alt="Logo Ternium" class="h-8 ml-5"
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Ternium_Logo.svg/1280px-Ternium_Logo.svg.png">
            </div>

            <nav class="flex items-center gap-10 ml-5">
                <a id="home" class="text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="/frontend/src/customer_view/home/home_customer_view.html?id=${clientId}">Inicio</a>
                <a id="consignees" class="text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5 font-semibold" href="/frontend/src/shared/list_view.html?type=consignees">Consignatarios</a>
                <a id="followUps" class="text-slate-500 text-sm font-medium hover:text-primary transition-colors py-5" href="#">Seguimientos</a>
            </nav>
        </div>

        <!-- RIGHT SIDE -->
        <button class="size-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100">
            <span class="material-symbols-outlined text-xl">notifications</span>
        </button>
`;