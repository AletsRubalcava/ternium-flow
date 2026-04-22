import { navIds } from "../../../../shared/navigation.js"

const BASE_URL = "http://localhost:3000/api";

const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/frontend/src/login/login.html';
} else {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const api = {
    customers: {
        create: () => `${BASE_URL}/customers`,
        getAll: () => `${BASE_URL}/customers`,
        getByID: (id) => `${BASE_URL}/customers/${id}`,
        update: (id) => `${BASE_URL}/customers/${id}`,
        delete: (id) => `${BASE_URL}/customers/${id}`
    },
    consignees: {
        create: () => `${BASE_URL}/consignees`,
        getAll: () => `${BASE_URL}/consignees`,
        getByID: (id) => `${BASE_URL}/consignees/${id}`,
        update: (id) => `${BASE_URL}/consignees/${id}`,
        delete: (id) => `${BASE_URL}/consignees/${id}`
    },
    platforms: {
        create: () => `${BASE_URL}/platforms`,
        getAll: () => `${BASE_URL}/platforms`,
        getByID: (id) => `${BASE_URL}/platforms/${id}`,
        update: (id) => `${BASE_URL}/platforms/${id}`,
        delete: (id) => `${BASE_URL}/platforms/${id}`
    },
    platform_items: {
        create: () => `${BASE_URL}/items`,
        getAll: () => `${BASE_URL}/items`,
        getByID: (id) => `${BASE_URL}/items/${id}`,
        update: (id) => `${BASE_URL}/items/${id}`,
        delete: (id) => `${BASE_URL}/items/${id}`
    },
    platform_request: {
        create: () => `${BASE_URL}/platform_request`,
        getAll:     () => `${BASE_URL}/platform_request`,
        getByID:    (id) => `${BASE_URL}/platform_request/${id}`,
        approve:    (id) => `${BASE_URL}/platform_request/${id}/accept`,
        reject:     (id) => `${BASE_URL}/platform_request/${id}/reject`,
    },
    products: {
        create: () => `${BASE_URL}/products`,
        getAll: () => `${BASE_URL}/products`,
        getByID: (id) => `${BASE_URL}/products/${id}`,
        update: (id) => `${BASE_URL}/products/${id}`,
        delete: (id) => `${BASE_URL}/products/${id}`
    },
    followUps: {
        create: () => `${BASE_URL}/follow_ups`,
        getAll: () => `${BASE_URL}/follow_ups`,
        getByID: (id) => `${BASE_URL}/follow_ups/${id}`,
        update: (id) => `${BASE_URL}/follow_ups/${id}`
    },
    users: {
        create: () => `${BASE_URL}/users`,
        getAll: () => `${BASE_URL}/users`,
        getByID: (id) => `${BASE_URL}/users/${id}`,
        update: (id) => `${BASE_URL}/users/${id}`,
        delete: (id) => `${BASE_URL}/users/${id}`
    },
    contacts: {
        create: () => `${BASE_URL}/contacts`,
        getAll: () => `${BASE_URL}/contacts`,
        getByID: (id) => `${BASE_URL}/contacts/${id}`,
        update: (id) => `${BASE_URL}/contacts/${id}`,
        delete: (id) => `${BASE_URL}/contacts/${id}`,
    },
    dispatch: {
        getAll: () => `${BASE_URL}/dispatch`
    },
    config: {
        get: () => `${BASE_URL}/config`
    },
    prediction: () => `${BASE_URL}/prediction/recommendation`
}