import {
    Box,
    FormHelperText,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Tooltip,
    IconButton,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useEffect, useState } from "react";


const validatePageRanges = (input, totalPages) => {
    if (!input) return null; // Empty is fine = all pages

    const parts = input.split(',').map(p => p.trim());
    const rangeRegex = /^(\d+)(-(\d+))?$/;

    for (const part of parts) {
        const match = rangeRegex.exec(part);
        if (!match) return "Invalid format. Use commas and dashes (e.g. 1, 2-4)";

        const start = parseInt(match[1], 10);
        const end = match[3] ? parseInt(match[3], 10) : start;

        if (start < 1 || end < 1)
            return "Pages must start from 1 (no zero or negatives)";
        if (end < start)
            return "Invalid range (lower bound greater than upper bound)";
        if (totalPages && end > totalPages)
            return `Page range exceeds total number of pages (${totalPages})`;
    }

    return null;
};


export default function PrintOptionsForm({ options, onChange, colorDisabled, duplexDisabled, totalPages, changeValid }) {
    const [pageRangeError, setPageRangeError] = useState("");
    
    const handleChange = (key, value) => {
        if (onChange) onChange({ ...options, [key]: value });
    };

    // Reset sides to one-sided when the printer does not support duplex
    useEffect(() => {
        if (duplexDisabled && options?.sides && options.sides !== "1S") {
            handleChange("sides", "1S");
        }
    }, [duplexDisabled]);

    const validateRange = (value) => {
        const error = validatePageRanges(value, totalPages);
        changeValid?.(!error)
        return error;
    }

    const handlePageRangesChange = (e) => {
        const value = e.target.value;
        const error = validateRange(value);
        setPageRangeError(error);
        handleChange("pageRanges", value);
    };

    const handleCopiesBlur = (e) => {
        const value = e.target.value;
        if (value < 1) {
            handleChange("copies", 1);
        } else {
            handleChange("copies", value);
        }
    }

    useEffect(() => {
        if (options) {
            const error = validateRange(options.pageRanges);
            setPageRangeError(error);
        }
    }, [])

    return (
        <Box
            sx={{ 
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 2,
                alignItems: "start",
            }}
        >
            <FormControl fullWidth disabled={colorDisabled}>
                <InputLabel>Color Mode</InputLabel>
                <Select
                    value={options?.colorMode || "B&W"}
                    label="Color Mode"
                    onChange={(e) => handleChange("colorMode", e.target.value)}
                >
                    <MenuItem value="Color">Color</MenuItem>
                    <MenuItem value="B&W">Black and White</MenuItem>
                </Select>
                <FormHelperText>
                    {colorDisabled ? "Black and white only." : "Choose color or B/W."}
                </FormHelperText>
            </FormControl>

            <Box display="flex" alignItems="center" gap={1} width="100%">
                <FormControl fullWidth disabled={duplexDisabled}>
                    <InputLabel>Sides</InputLabel>
                    <Select
                        value={duplexDisabled ? "1S" : (options?.sides || "1S")}
                        label="Sides"
                        onChange={(e) => handleChange("sides", e.target.value)}
                    >
                        <MenuItem value="1S">One-sided</MenuItem>
                        <MenuItem value="2SLng">Two-sided (long edge)</MenuItem>
                        <MenuItem value="2SSht">Two-sided (short edge)</MenuItem>
                    </Select>
                    <FormHelperText>
                        {duplexDisabled ? "Duplex not available." : "Choose one- or two-sided printing."}
                    </FormHelperText>
                </FormControl>
                {duplexDisabled && (
                    <Tooltip title="This printer does not support automatic 2-sided (duplex) printing." arrow>
                        <IconButton size="small" tabIndex={-1} sx={{ flexShrink: 0 }}>
                            <InfoOutlinedIcon fontSize="small" color="disabled" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            <FormControl fullWidth>
                <InputLabel>Pages per sheet</InputLabel>
                <Select
                    value={options?.numberUp || 1}
                    label="Pages per sheet"
                    onChange={(e) => handleChange("numberUp", e.target.value)}
                >
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={4}>4</MenuItem>
                    <MenuItem value={6}>6</MenuItem>
                    <MenuItem value={9}>9</MenuItem>
                    <MenuItem value={16}>16</MenuItem>
                </Select>
                <FormHelperText>
                    Print multiple pages on one sheet.
                </FormHelperText>
            </FormControl>

            <TextField
                label="Number of copies"
                type="number"
                value={options?.copies || 1}
                onChange={(e) => {
                    const value = Number(e.target.value);
                    if (isNaN(value)) {
                        handleChange("copies", 1); // valor por defecto mínimo
                    } else {
                        handleChange("copies", value);
                    }

                }}
                onBlur={handleCopiesBlur}
                onFocus={(e) => e.target.select()}
                fullWidth
                inputProps={{ min: 1 }}
                helperText="How many copies to print."
            />

            <TextField
                label="Page ranges"
                placeholder="Use commas and dashes (e.g. 1, 2-4)"
                value={options?.pageRanges || ""}
                onChange={handlePageRangesChange}
                fullWidth
                sx={{ gridColumn: { xs: "span 1", md: "span 2" } }}
                error={!!pageRangeError}
                helperText={pageRangeError || "Leave empty for all pages"}
            />
        </Box>
    )
}
