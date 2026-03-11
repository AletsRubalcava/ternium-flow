let approvals = [
    { id: "REQ-9821", cliente: "Metalsa", tarima: "Tarima Personalizada", peso: 20, hace: 2 },
    { id: "REQ-9822", cliente: "General Motors", tarima: "Preestablecido 17", peso: 35, hace: 5 },
    { id: "REQ-9823", cliente: "Ford Motors", tarima: "Tarima Personalizada", peso: 15, hace: 1 },
    { id: "REQ-9824", cliente: "Toyota", tarima: "Preestablecido 8", peso: 10, hace: 3 },
    { id: "REQ-9825", cliente: "Volkswagen", tarima: "Preestablecido 5", peso: 40, hace: 4 },
    { id: "REQ-9826", cliente: "Nissan", tarima: "Preestablecido 3", peso: 12.5, hace: 2 },
    { id: "REQ-9827", cliente: "Honda", tarima: "Tarima Personalizada", peso: 25, hace: 1 },
    { id: "REQ-9828", cliente: "Kia", tarima: "Preestablecido 12", peso: 28, hace: 6 },
    { id: "REQ-9829", cliente: "Chevrolet", tarima: "Preestablecido 14", peso: 50, hace: 3 },
    { id: "REQ-9830", cliente: "Mazda", tarima: "Tarima Personalizada", peso: 18, hace: 2 },
];

renderComercialApprovals();

function renderComercialApprovals() {
    updatePendingCount();
    if (approvals.length == 0) {
        renderEmptyList();
    } else {
        renderPendingApprovals();
    }
}

function updatePendingCount() {
    const span = document.getElementById("Pending Approvals");
    span.innerText = `${approvals.length} Pendientes`;
}

function renderEmptyList() {
    const list = document.getElementById("aprobaciones");
    list.innerHTML = `
    <div class="w-full h-full flex items-center justify-center">
        <div class="flex flex-col justify-center items-center gap-2">
            <div class="size-20 rounded-full bg-light-gray-slate flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-5xl text-slate-400">playlist_remove</span>
            </div>
            <p class="text-slate-400">Nada que aprobar</p>
        </div>
    </div>`;
}

function renderPendingApprovals() {
    const list = document.getElementById("aprobaciones");
    list.innerHTML = approvals.map(req => `
        <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-primary/30 transition-all group">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <p class="text-[10px] font-mono font-bold text-primary mb-1 uppercase tracking-wider">#${req.id}</p>
                    <h4 class="font-bold text-slate-900">${req.cliente}</h4>
                </div>
                <span class="text-[10px] font-bold text-slate-400">Hace ${req.hace}h</span>
            </div>
            <div class="flex items-center gap-4 mb-4 text-xs text-slate-500">
                <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">texture</span>${req.tarima}
                </div>
                <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">weight</span>${req.peso}
                </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <button data-action="aprobar" data-id="${req.id}" class="py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <span class="material-symbols-outlined text-sm">check</span> Aceptar
                </button>
                <button data-action="rechazar" data-id="${req.id}" class="py-2 bg-white border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <span class="material-symbols-outlined text-sm">close</span> Rechazar
                </button>
            </div>
        </div>
    `).join("");

    // Listener de botones
    document.querySelectorAll('[data-action="aprobar"], [data-action="rechazar"]').forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.currentTarget.dataset.id;
            approvals = approvals.filter(obj => obj.id !== id);
            renderComercialApprovals(); // rerender seguro, sin loops infinitos
        });
    });
}