import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { STATUS_FILTER_OPTIONS } from "../../utils/statusFilter";

export default function StatusFilterToggle({ value, onChange }) {
    return (
        <ToggleButtonGroup
            value={value}
            exclusive
            onChange={(_, next) => next && onChange(next)}
            size="small"
            sx={{ mb: 2 }}
        >
            {STATUS_FILTER_OPTIONS.map((opt) => (
                <ToggleButton key={opt.value} value={opt.value}>
                    {opt.label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}
