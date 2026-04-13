import { session } from "../shared/session.js";

const clientId = session.getClientId();

const { data: dataConsignees } = await axios.get("http://localhost:3000/api/consignees")
const consignees = dataConsignees.filter(c => c.id_customer == clientId)

window.history.replaceState({}, "", `?id=${clientId}`);

function renderConsignees() {
    const list = document.getElementById("aprobaciones");
    list.innerHTML = consignees.map(c => `
        <div data-id-${c.id} class="p-6 rounded-xl border border-slate-50 bg-slate-100 hover:border-primary/30 transition-all group">
            <div class="flex items-start mb-3">
                <div>
                    <h4 class="font-bold text-slate-900">${c.name}</h4>
                    <span class="text-[10px] font-bold text-slate-400">0 Seguimientos Activos</span>
                </div>
            </div>
            <div class="flex items-center gap-4 mb-4 text-xs text-slate-500">
                <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">location_on</span>${c.address}
                </div>
            </div>
            <div class="grid grid-cols-1">
                <button data-action="view-more" data-id="${c.id}" class="py-2 bg-primary hover:bg-orange-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
                Ver más<span class="material-symbols-outlined text-sm">arrow_right_alt</span>
                </button>
            </div>
        </div>
    `).join("");

    // Listener de botones
    document.querySelectorAll('[data-action="view-more"]').forEach(btn => {
        btn.addEventListener("click", (e) => {
            window.location.href = `/frontend/src/consignees/detailed_consignee.html?id=${btn.dataset.id}`;
        });
    });
}

renderConsignees();