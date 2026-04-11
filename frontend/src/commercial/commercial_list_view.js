import { platformRequest, consignees, platforms } from "../shared/db.js";

const attributes = ["Tarima", "Consignatario", "Fecha Solicitud", "Acción"];

export function loadComercial() {
    const params = new URLSearchParams(window.location.search);

    const title = document.getElementById("pageTitle");
    const search = document.getElementById("search");
    const newButton = document.getElementById("newButton");
    const thead = document.getElementById("listViewThead");
    const tbody = document.getElementById("listViewBody");

    title.textContent = "COMERCIAL";
    search.placeholder = "Buscar Solicitudes";



    newButton.classList.remove("hidden")
    newButton.innerHTML = `
        <span class="material-icons text-lg group-hover:scale-110 transition-transform">add</span>
            Nueva Asignación`;
    newButton.onclick = () => window.location.href = `/frontend/src/platforms/detailed_platform.html?create=true`;

    thead.innerHTML = attributes.map(a => `
        <th class="px-6 py-3 text-left text-xs font-bold text-text-secondary-light uppercase tracking-wider font-display" scope="col">${a}</th>
    `).join("");

tbody.innerHTML = platformRequest.map(p => `
    <tr data-id="${p.idPlatform}" class="customer-row bg-gray-50/50 hover:bg-gray-100 transition-colors">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">
            ${platforms.find(pl => pl.id == p.idPlatform).name}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">
            ${consignees.find(c => c.id == p.idConsignee).name}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary-light">
            ${p.createDate}
        </td>

        <!-- 👇 Nueva columna -->
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button class="accept-btn 
                bg-green-600 text-white 
                px-4 py-1.5 rounded-lg mr-2 font-medium
                transition-all duration-200
                hover:bg-green-700 hover:shadow-md
                active:bg-green-800">
                Aceptar
            </button>

            <button class="reject-btn 
                bg-transparent border-2 border-red-500 text-red-500 
                px-4 py-1.5 rounded-lg font-medium
                transition-all duration-200
                hover:bg-red-50 hover:border-red-600 hover:text-red-600
                active:bg-red-100">
                Rechazar
            </button>
        </td>
    </tr>
`).join("");

    document.querySelectorAll(".customer-row").forEach(row => {
        row.addEventListener("click", () => {
            const id = row.dataset.id;
            window.location.href = `/frontend/src/platforms/detailed_platform.html?id=${id}`;
        });
    });

    document.querySelectorAll(".accept-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = btn.closest("tr").dataset.id;
            console.log("Aceptar:", id);

            // TODO: Logic
        });
    });

    document.querySelectorAll(".reject-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = btn.closest("tr").dataset.id;
            console.log("Rechazar:", id);

            // TODO: Logic
        });
    });

    document.querySelectorAll(".accept-btn, .reject-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();

            const row = btn.closest("tr");
            const id = row.dataset.id;

            console.log("Eliminar fila:", id);

            // 👇 quitar fila inmediatamente
            row.remove();

            // aquí tu lógica real (API / actualizar estado)
        });
    });
}