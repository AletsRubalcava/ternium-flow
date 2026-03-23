import { loadClientes } from "./customers_list_view_content.js";
import { loadConsignees } from "../consignees/consignee_list_view.js";
import { loadProductos } from "../products/products_list_view_content.js";
import { loadPlatforms } from "./customer_platform_list_view.js";
import { loadUsers } from "../users/users_list_view.js";

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");

    if (type === "home") {
        setActiveNav("home");
    } else if (type === "customers") {
        loadClientes();
        setActiveNav("customers");
    } else if (type === "consignees"){
        loadConsignees();
        setActiveNav("customers");
    } else if (type === "platforms"){
      loadPlatforms();
      setActiveNav("customers");
    } else if (type === "products") {
        loadProductos();
        setActiveNav("products");
    }else if (type === "users"){
        loadUsers();
        setActiveNav("users");
    }
});

export function setActiveNav(navId) {
    const active = document.getElementById(navId);
    if (active) {
        active.classList.remove("text-slate-500", "font-medium");
        active.classList.add("text-primary", "font-semibold", "border-b-2", "border-primary");
    }
}