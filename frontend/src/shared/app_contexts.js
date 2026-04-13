import { session } from "../customer_view/shared/session";

export function getAppContext() {
    return {
        role: "customer", // TEMPORARY
        clientId: session.getClientId()
    };
}