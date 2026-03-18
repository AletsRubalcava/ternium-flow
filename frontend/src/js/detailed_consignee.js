import {customers, consignees} from './db.js'
import { setActiveNav } from './page_directory.js';

setActiveNav("customers");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const consignee = consignees.find(c => c.id == id);
const customer = customers.find(c => c.id = consignee.idCustomer);

const consigneeID = document.getElementById("consigneeID");
const consigneeCustomer = document.getElementById("consigneeCustomer");
const consigneeName = document.getElementById("consigneeName");
const consigneeAddress = document.getElementById("consigneeAddress");

consigneeID.textContent = id;
consigneeCustomer.textContent = customer.name;
consigneeName.textContent = consignee.name;
consigneeAddress.textContent = consignee.address;

