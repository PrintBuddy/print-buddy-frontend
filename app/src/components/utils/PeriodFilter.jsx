import { useState } from "react";
import dayjs from "dayjs";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const PRESETS = [
    { value: "all", label: "All Time" },
    { value: "7d", label: "7D" },
    { value: "30d", label: "30D" },
    { value: "90d", label: "90D" },
    { value: "ytd", label: "This Year" },
    { value: "custom", label: "Custom" },
];

const DATE_FORMAT = "YYYY-MM-DD";

function presetToRange(preset) {
    const today = dayjs();
    switch (preset) {
        case "7d":
            return { start: today.subtract(6, "day").format(DATE_FORMAT), end: today.format(DATE_FORMAT) };
        case "30d":
            return { start: today.subtract(29, "day").format(DATE_FORMAT), end: today.format(DATE_FORMAT) };
        case "90d":
            return { start: today.subtract(89, "day").format(DATE_FORMAT), end: today.format(DATE_FORMAT) };
        case "ytd":
            return { start: today.startOf("year").format(DATE_FORMAT), end: today.format(DATE_FORMAT) };
        default:
            return { start: null, end: null };
    }
}

// Shared All Time / preset / custom-range filter for the statistics pages.
// Reports { start, end } as ISO date strings (or null/null for "All Time")
// via onChange — the caller owns fetching, this only owns picking a range.
export default function PeriodFilter({ onChange }) {
    const [preset, setPreset] = useState("all");
    const [customStart, setCustomStart] = useState(null);
    const [customEnd, setCustomEnd] = useState(null);

    const handlePresetChange = (_, value) => {
        if (!value) return;
        setPreset(value);
        if (value === "custom") {
            if (customStart && customEnd) {
                onChange({ start: customStart.format(DATE_FORMAT), end: customEnd.format(DATE_FORMAT) });
            }
            return;
        }
        onChange(presetToRange(value));
    };

    const handleCustomStart = (value) => {
        setCustomStart(value);
        if (value && customEnd) {
            onChange({ start: value.format(DATE_FORMAT), end: customEnd.format(DATE_FORMAT) });
        }
    };

    const handleCustomEnd = (value) => {
        setCustomEnd(value);
        if (customStart && value) {
            onChange({ start: customStart.format(DATE_FORMAT), end: value.format(DATE_FORMAT) });
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
                <ToggleButtonGroup value={preset} exclusive onChange={handlePresetChange} size="small">
                    {PRESETS.map((p) => (
                        <ToggleButton key={p.value} value={p.value}>{p.label}</ToggleButton>
                    ))}
                </ToggleButtonGroup>
                {preset === "custom" && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <DatePicker
                            label="From"
                            value={customStart}
                            onChange={handleCustomStart}
                            maxDate={customEnd ?? undefined}
                            slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
                        />
                        <DatePicker
                            label="To"
                            value={customEnd}
                            onChange={handleCustomEnd}
                            minDate={customStart ?? undefined}
                            slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
                        />
                    </Box>
                )}
            </Box>
        </LocalizationProvider>
    );
}
