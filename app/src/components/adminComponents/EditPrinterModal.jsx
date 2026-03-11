import { useState, useEffect } from "react";
import {
    Button,
    Checkbox,
    FormControlLabel,
    InputAdornment,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import CustomModal from "../utils/CustomModal";


export default function EditPrinterModal({ open, onClose, printer, onSave }) {
    const [form, setForm] = useState({
        price_per_page_bw: "",
        admits_color: false,
        price_per_page_color: "",
        is_active: true,
        is_restricted: false,
        supports_duplex: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (printer) {
            setForm({
                price_per_page_bw: printer.price_per_page_bw ?? "",
                admits_color: printer.admits_color ?? false,
                price_per_page_color: printer.price_per_page_color ?? "",
                is_active: printer.is_active ?? true,
                is_restricted: printer.is_restricted ?? false,
                supports_duplex: printer.supports_duplex ?? false,
            });
            setError("");
        }
    }, [printer]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const bw = parseFloat(form.price_per_page_bw);
        const color = parseFloat(form.price_per_page_color);

        if (isNaN(bw) || bw < 0) {
            setError("B&W price must be a valid non-negative number.");
            return;
        }
        if (form.admits_color && (isNaN(color) || color < 0)) {
            setError("Color price must be a valid non-negative number.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await onSave(printer.name, {
                price_per_page_bw: bw,
                admits_color: form.admits_color,
                price_per_page_color: form.admits_color ? color : 0,
                is_active: form.is_active,
                is_restricted: form.is_restricted,
                supports_duplex: form.supports_duplex,
            });
            onClose();
        } catch (err) {
            const detail = err?.response?.data?.detail;
            setError(detail ?? "Failed to update printer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title={`Edit Printer — ${printer?.name ?? ""}`}
            isForm
            maxWidth="xs"
            content={
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                    <TextField
                        label="B&W price per page"
                        name="price_per_page_bw"
                        type="number"
                        value={form.price_per_page_bw}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                inputProps: { min: 0, step: 0.001 }
                            }
                        }}
                    />
                    <TextField
                        label="Color price per page"
                        name="price_per_page_color"
                        type="number"
                        value={form.price_per_page_color}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        disabled={!form.admits_color}
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                inputProps: { min: 0, step: 0.001 }
                            }
                        }}
                    />
                    <Stack spacing={0}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={form.admits_color}
                                onChange={handleChange}
                                name="admits_color"
                            />
                        }
                        label="Supports color printing"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={form.supports_duplex}
                                onChange={handleChange}
                                name="supports_duplex"
                            />
                        }
                        label="Supports 2-sided (duplex) printing"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={form.is_restricted}
                                onChange={handleChange}
                                name="is_restricted"
                            />
                        }
                        label="Restricted (only visible to permitted groups)"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={form.is_active}
                                onChange={handleChange}
                                name="is_active"
                            />
                        }
                        label="Active (visible to users)"
                    />
                    </Stack>
                </Stack>
            }
            actions={
                <>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        onClick={handleSubmit}
                    >
                        {loading ? "Saving…" : "Save"}
                    </Button>
                </>
            }
        />
    );
}
