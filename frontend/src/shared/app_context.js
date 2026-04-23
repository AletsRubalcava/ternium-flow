import { session } from "./session.js"

export function getAppContext() {
    const token = session.getToken();
    if (!token) {
        window.location.href = '/frontend/src/index.html';
        return null;
    }

    const user = session.getUser();

    return {
        role: user?.role,
        userId: user?.id,
        customerId: user?.id_cliente
    };
}

export const roles = {
    administrador: 'administrador',
    gestion_clientes: 'gestion_clientes',
    operador_logistico: 'operador_logistico',
    customer: 'customer'
}