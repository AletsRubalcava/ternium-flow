import { session } from "./session.js";

export function getAppContext() {
    return {
        role: roles.customer, // TEMPORARY
        entityId: session.getUserId()
    };
}

export const roles = {
    customer: "customer",
    admin: "admin"
}