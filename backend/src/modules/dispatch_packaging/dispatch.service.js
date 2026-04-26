import dispatch_packaging from "./dispatch_packaging.model.js";

export async function getAllDispatches() {
    const dispatches = await dispatch_packaging.findAll();
    return dispatches;
}

export async function getDispatchById(id) {
    const dispatch = await dispatch_packaging.findByPk(id);
    return dispatch;
}

export async function createDispatch(name) {
    const dispatch = await dispatch_packaging.create({ name });
    return dispatch;
}

export async function deleteDispatch(id) {
    const dispatch = await dispatch_packaging.findByPk(id);
    if (!dispatch) return null;
    await dispatch.destroy();
    return dispatch;
}