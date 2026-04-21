import { loadClientes } from "../customers/customers_list_view.js";
import { loadConsignees } from "../consignees/consignee_list_view.js";
import { loadProductos } from "../products/products_list_view.js";
import { loadPlatforms } from "../platforms/platform_list_view.js";
import { loadUsers } from "../users/users_list_view.js";
import { loadPresets } from "../platforms/preset_list_view.js";
import { loadComercial } from "../commercial/commercial_list_view.js";
import { setActiveNav } from "./utils/nav.js";
import { loadFolllowUps } from "../followUps/followUp_list_view.js";
import { navIds } from "../../../shared/navigation.js";

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");

    if (type === navIds.home) {
        setActiveNav("home");
    } else if (type === navIds.customers) {
        loadClientes();
        setActiveNav("customers");
    } else if (type === navIds.consignees){
        loadConsignees();
        setActiveNav("customers");
    } else if (type === navIds.commercial){
        loadComercial();
        setActiveNav("commercial");
    } else if (type === navIds.platforms){
        loadPlatforms();
        setActiveNav("customers");
    } else if (type === navIds.products) {
        loadProductos();
        setActiveNav("products");
    } else if (type === navIds.presets) {
        loadPresets();
        setActiveNav("presets");
    } else if (type === navIds.followUps) {
        loadFolllowUps();
        setActiveNav(navIds.followUps);  
    } else if (type === navIds.users) {
        loadUsers();
        setActiveNav(navIds.users);
    }
});