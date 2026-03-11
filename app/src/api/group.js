import api from "../services/api";

const GROUP_ROUTE = "/groups";

export async function getGroups() {
    const response = await api.get(GROUP_ROUTE);
    return response.data;
}

export async function getGroupDetail(groupId) {
    const response = await api.get(`${GROUP_ROUTE}/${groupId}`);
    return response.data;
}

export async function createGroup(data) {
    const response = await api.post(GROUP_ROUTE, data);
    return response.data;
}

export async function updateGroup(groupId, data) {
    const response = await api.patch(`${GROUP_ROUTE}/${groupId}`, data);
    return response.data;
}

export async function deleteGroup(groupId) {
    const response = await api.delete(`${GROUP_ROUTE}/${groupId}`);
    return response.data;
}

export async function addGroupMember(groupId, userId) {
    const response = await api.post(`${GROUP_ROUTE}/${groupId}/members`, { user_id: userId });
    return response.data;
}

export async function removeGroupMember(groupId, userId) {
    const response = await api.delete(`${GROUP_ROUTE}/${groupId}/members/${userId}`);
    return response.data;
}

export async function addGroupPrinterPermit(groupId, data) {
    const response = await api.post(`${GROUP_ROUTE}/${groupId}/printers`, data);
    return response.data;
}

export async function updateGroupPrinterPermit(groupId, printerId, data) {
    const response = await api.patch(`${GROUP_ROUTE}/${groupId}/printers/${printerId}`, data);
    return response.data;
}

export async function removeGroupPrinterPermit(groupId, printerId) {
    const response = await api.delete(`${GROUP_ROUTE}/${groupId}/printers/${printerId}`);
    return response.data;
}
