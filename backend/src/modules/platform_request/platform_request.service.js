import platform_request from "./platform_request.model.js";

export async function getAllPlatformRequests() {
    const request = await platform_request.findAll();
    return request;
}