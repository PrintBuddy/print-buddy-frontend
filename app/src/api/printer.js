import api from "../services/api";


const PRINTER_ROUTE = "/printers"


export async function getPrinters() {

    const response = await api.get(`${PRINTER_ROUTE}`);
    return response.data;
}

export async function getAllPrinters() {
    const response = await api.get(`${PRINTER_ROUTE}/all`);
    return response.data;
}


export async function getPrinter(name) {
    try {
        const response = await  api.get(`${PRINTER_ROUTE}/${name}`);
        return response.data;
    } catch (err) {
        if (err.response){
            const code = err.response.status;
            if (code == 404) {
                throw new Error(`Printer ${name} not found`);
            } 
        }

        throw new Error(err.message);
    }
}

export async function updatePrinter(name, data) {
    const response = await api.patch(`${PRINTER_ROUTE}/${name}`, data);
    return response.data;
}

export async function getTonerLevels(name) {
    const response = await api.get(`${PRINTER_ROUTE}/${name}/toner`);
    return response.data;
}
