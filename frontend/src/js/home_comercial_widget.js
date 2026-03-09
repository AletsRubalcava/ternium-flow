let approvals = [
  {
    id: "REQ-9821",
    cliente: "Metalsa",
    tarima: "Tarima Personalizada",
    peso: 20,
    hace: 2,
  },
  {
    id: "REQ-9822",
    cliente: "General Motros",
    tarima: "Preestablecido 17",
    peso: 35,
    hace: 5,
  },
  {
    id: "REQ-9823",
    cliente: "Ford Motors",
    tarima: "Tarima Personalizada",
    peso: 15,
    hace: 1,
  },
];

render();

function render(){
    const tbody = document.getElementById("aprobaciones");

    tbody.innerHTML = approvals.map(
    (request, index) => `
        <div
            class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-primary/30 transition-all group">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <p class="text-[10px] font-mono font-bold text-primary mb-1 uppercase tracking-wider">
                        #${request.id}</p>
                    <h4 class="font-bold text-slate-900">${request.cliente}</h4>
                </div>
                <span class="text-[10px] font-bold text-slate-400">Hace ${request.hace}h</span>
            </div>
            <div class="flex items-center gap-4 mb-4 text-xs text-slate-500">
                <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">texture</span>
                    ${request.tarima}
                </div>
                <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">weight</span>
                    ${request.peso}
                </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <button
                    data-action="aprobar"
                    data-id="${request.id}"
                    class="py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <span class="material-symbols-outlined text-sm">check</span> Aceptar
                </button>
                <button
                    data-action="rechazar"
                    data-id="${request.id}"
                    class="py-2 bg-white border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <span class="material-symbols-outlined text-sm">close</span> Rechazar
                </button>
            </div>
        </div>
    `
    ).join("");

    document.querySelectorAll('[data-action="aprobar"], [data-action="rechazar"]').forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.dataset.id;
            approvals = approvals.filter(obj => obj.id !== id);
            render();
        });
    });
}