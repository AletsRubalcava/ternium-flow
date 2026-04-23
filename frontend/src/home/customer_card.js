// home/customers_widget.js
import { api } from "../shared/api/api_routes.js";

const attributes = ["ID", "Razón Social", "RFC", "Contacto", "Estado"];

export async function renderCustomersWidget({ tableHeaderEl, tableBodyEl, newButtonEl }) {
    const { data: customers } = await axios.get(api.customers.getAll());
    const { data: contacts } = await axios.get(api.contacts.getAll());

    if (newButtonEl) {
        newButtonEl.innerHTML = `<span class="material-symbols-outlined text-sm">add_circle</span>Nuevo Cliente`;
        newButtonEl.onclick = () => window.location.href = `/frontend/src/customers/detailed_customer.html?create=true`;
    }

    tableHeaderEl.innerHTML = attributes.map(a => `
        <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">${a}</th>
    `).join("");

    tableBodyEl.innerHTML = customers.map(c => `
        <tr data-id="${c.id}" class="customerData hover:bg-slate-200 transition-colors group cursor-pointer">
            <td class="px-6 py-4 text-sm font-medium text-slate-700">${c.id_customer}</td>
            <td class="px-6 py-4 text-sm font-medium text-slate-700">${c.name}</td>
            <td class="px-6 py-4 text-xs text-slate-500">${c.rfc ?? "N/A"}</td>
            <td class="px-6 py-4 text-xs text-slate-500">${contacts.find(co => co.id_customer === c.id).name ?? "N/A"}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-[10px] font-bold rounded-full ${c.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}">
                    ${c.status ? "Activo" : "Inactivo"}
                </span>
            </td>
        </tr>
    `).join("");

    tableBodyEl.addEventListener("click", (e) => {
        const row = e.target.closest(".customerData");
        if (!row) return;
        window.location.href = `/frontend/src/customers/detailed_customer.html?id=${row.dataset.id}`;
    });
}