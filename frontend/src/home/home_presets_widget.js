const presets = [
    {
        nombre: "Preestablecido 3",
        detalles: "Descripción del paquete 3",
        peso: 12.5,
        usos: 75,
    },
    {
        nombre: "Preestablecido 17",
        detalles: "Descripción del paquete 17",
        peso: 35.0,
        usos: 42,
    },
    {
        nombre: "Preestablecido 8",
        detalles: "Descripción del paquete 8",
        peso: 5.5,
        usos: 15,
    },
    {
        nombre: "Preestablecido 5",
        detalles: "Descripción del paquete 5",
        peso: 40.0,
        usos: 23,
    },
    {
        nombre: "Preestablecido 21",
        detalles: "Descripción del paquete 21",
        peso: 18.0,
        usos: 60,
    },
    {
        nombre: "Preestablecido 12",
        detalles: "Descripción del paquete 12",
        peso: 25.5,
        usos: 30,
    },
    {
        nombre: "Preestablecido 7",
        detalles: "Descripción del paquete 7",
        peso: 8.0,
        usos: 10,
    },
    {
        nombre: "Preestablecido 14",
        detalles: "Descripción del paquete 14",
        peso: 50.0,
        usos: 5,
    },
    {
        nombre: "Preestablecido 9",
        detalles: "Descripción del paquete 9",
        peso: 22.0,
        usos: 40,
    },
    {
        nombre: "Preestablecido 19",
        detalles: "Descripción del paquete 19",
        peso: 30.0,
        usos: 55,
    }
]

const tbody = document.getElementById("tableDataContent");
tbody.innerHTML = presets.map(preset =>`
    <tr class="hover:bg-slate-200 transition-colors group">
        <td class="px-6 py-4">
            <div class="flex items-center gap-3">
                <span class="font-bold text-slate-700 dark:text-slate-300">${preset.nombre}</span>
            </div>
        </td>
        <td class="px-6 py-4 text-xs text-slate-500">${preset.detalles}</td>
        <td class="px-6 py-4">
            <span
                class="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold">${preset.peso} T</span>
        </td>
        <td class="px-6 py-4">
            <div class="flex items-center gap-1.5">
                <span class="text-[12px] font-bold text-slate-400">${preset.usos} usos</span>
            </div>
        </td>
    </tr>
`).join("");