import { navIds } from "../../../../shared/navigation.js"

const BASE_URL = "http://localhost:3000/api";

export const api = {
    customers: {
        getAll: () => `${BASE_URL}/customers`
    },
    consignees: {
        getAll: () => `${BASE_URL}/consignees`
    },
    platforms: {
        getAll: () => `${BASE_URL}/platforms`
    },
    platform_request: {
        getAll:     () => `${BASE_URL}/platform_request`,
        getByID:    (id) => `${BASE_URL}/platform_request/${id}`,
        approve:    (id) => `${BASE_URL}/platform_request/${id}/accept`,
        reject:     (id) => `${BASE_URL}/platform_request/${id}/reject`,
    },
    followUps: {
        create: () => `${BASE_URL}/follow_ups`,
        getAll: () => `${BASE_URL}/follow_ups`,
        getByID: (id) => `${BASE_URL}/follow_ups/${id}`,
        update: (id) => `${BASE_URL}/follow_ups/${id}`
    }
}