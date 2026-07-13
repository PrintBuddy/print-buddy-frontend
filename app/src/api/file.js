import api, { fetchAllPages } from "../services/api";


const FILE_ROUTE = "/files"


export async function getFiles() {
    return fetchAllPages(FILE_ROUTE);
}


export async function uploadFile(file) {
    const formData = new FormData();

    formData.append('file', file);

    try {
        const response = await api.post(`${FILE_ROUTE}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })

        return response.data
    } catch (error) {
        
        if (error.response) {
            const status = error.response.status;
            if (status === 415) {
                throw new Error(error.response.data.detail || "File format not supported");
            } else if (status === 413) {
                throw new Error(error.response.data.detail || "File size too large");
            } else if (status === 403) {
                // keep previous behavior for explicit forbidden responses
                throw new Error(error.response.data.detail || "Error uploading file");
            } else {
                throw new Error("Error uploading file");
            }
        } else {
            throw new Error("Network error, please try again later.");
        }
    }
}


export async function deleteFile(fileId) {
    const response = api.delete(`${FILE_ROUTE}/${fileId}`);
    return response.data
}