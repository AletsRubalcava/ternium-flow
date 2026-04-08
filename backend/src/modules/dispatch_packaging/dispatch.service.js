import dispatch_packaging from "./dispatch_packaging.model.js";

export async function getAllDispatches() {
    const dispatches = await dispatch_packaging.findAll();
    return dispatches;
}

export async function getDispatchById(id) {
    const customer = await dispatch_packaging.findByPk(id);
    return customer;
}