import { session } from "./session.js";

export function getAppContext() {
    return {
        role: roles.admin, // TEMPORARY
        entityId: session.getUserId()
    };
}

export const roles = {
    customer: "customer",
    admin: "admin"
}