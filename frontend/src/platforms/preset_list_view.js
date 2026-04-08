import { platforms, platformType } from "../shared/db.js";

const attributes = ["Clave", "Nombre", "Consignatario", "Estado"];

export async function loadPresets() {
    const resConsignees = await axios.get("http://localhost:3000/api/consignees");
    const allConsignees = resConsignees.data;

    const platform = platforms.filter(p => p.type == platformType.preset);

    const title = document.getElementById("pageTitle");
    const search = document.getElementById("search");
    const newButton = document.getElementById("newButton");
    const thead = document.getElementById("listViewThead");
    const tbody = document.getElementById("listViewBody");

    title.textContent = "PAQUETES";
    search.placeholder = "Buscar Paquetes";

    newButton.innerHTML = `
        <span class="material-icons text-lg group-hover:scale-110 transition-transform">add</span>
            Nuevo Paquete`;

    newButton.classList.remove("hidden");

    const newId = platforms.length > 0 ? Math.max(...platform.map(p => p.id)) + 1 : 1;
    newButton.onclick = () => window.location.href = `/frontend/src/platforms/detailed_platform.html?create=true&id=${newId}&type=preset`;

    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
    `).join("");

    tbody.innerHTML = platform.map(p => {
        const consignee = allConsignees.find(c => c.id == p.id_consignee);
        return `
        <tr data-id="${p.id}" class="customer-row bg-gray-50/50 hover:bg-gray-100 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">${p.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">${p.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light">${consignee?.name || "—"}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="${p.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    ${p.status ? "Activo" : "Inactivo"}
                </span>
            </td>
        </tr>`;
    }).join("");

    document.querySelectorAll(".customer-row").forEach(row => {
        row.addEventListener("click", () => {
            const id = row.dataset.id;
            window.location.href = `/frontend/src/platforms/detailed_platform.html?id=${id}&type=preset`;
        });
    });
}