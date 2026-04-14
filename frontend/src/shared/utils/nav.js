export function setActiveNav(navId) {
    const active = document.getElementById(navId);
    if (active) {
        active.classList.remove("text-slate-500", "font-medium");
        active.classList.add("text-primary", "font-semibold", "border-b-2", "border-primary");
    }
}