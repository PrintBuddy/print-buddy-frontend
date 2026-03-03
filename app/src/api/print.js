import api from "../services/api"


const PRINT_ROUTE = "/print"


export async function getMyJobs() {
    const response = await api.get(`${PRINT_ROUTE}/my-jobs`);
    return response.data;
}

export async function getAllJobs() {
    const response = await api.get(`${PRINT_ROUTE}/all-jobs`);
    return response.data;
}


export async function print(
    printerName, fileId, options
) {

    let sides = "";
    switch (options.sides) {
        case "1S":
            sides = "one-sided"
            break;
        
        case "2SLng":
            sides = "two-sided-long-edge"
            break;

        case "2SSht":
            sides = "two-sided-short-edge"
    }

    const printerOptions = {
        copies: String(options.copies),
        sides: sides,
        page_ranges: options.pageRanges || "all",
        color: options.colorMode == "Color",
        number_up: String(options.numberUp)
    }

    const response = await api.post(`${PRINT_ROUTE}/${printerName}/${fileId}`,
        printerOptions
    )

    return response.data;
}