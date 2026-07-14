import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

function shortLabelMobile(label, maxLen = 9) {
    if (!label) return "";
    return label.length > maxLen ? label.slice(0, maxLen - 1) + "…" : label;
}

// Unifies what used to be two near-identical chart components (a dual B/W
// vs Color series, and a single Revenue series) — each series and its value
// formatting is passed in rather than duplicating the mobile/desktop
// layout logic per chart.
export default function StatsBarChart({
    data,
    height,
    isMobile,
    series,
    valueFormatter = (v) => v.toLocaleString(),
    tickFormatter,
    allowDecimals,
    showLegend = true,
    desktopMargin = { top: 5, right: 10, left: 0, bottom: 5 },
}) {
    const tooltipFormatter = (value, name) => [valueFormatter(value), name];
    const labelFormatter = (_, payload) => payload?.[0]?.payload?.fullName ?? "";

    if (isMobile) {
        const mobileData = data.map((d) => ({ ...d, name: shortLabelMobile(d.fullName) }));
        const barSize = Math.max(10, Math.min(20, Math.floor(220 / (data.length || 1))));
        return (
            <ResponsiveContainer width="100%" height={Math.max(height, data.length * 44 + 60)}>
                <BarChart
                    data={mobileData}
                    layout="vertical"
                    margin={{ top: 5, right: 16, left: 4, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                        type="number"
                        tick={{ fontSize: 11 }}
                        tickFormatter={tickFormatter}
                        allowDecimals={allowDecimals}
                    />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={72} />
                    <Tooltip formatter={tooltipFormatter} labelFormatter={labelFormatter} />
                    {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
                    {series.map((s) => (
                        <Bar key={s.dataKey} dataKey={s.dataKey} fill={s.color} radius={[0, 3, 3, 0]} barSize={barSize} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={desktopMargin}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={tickFormatter} allowDecimals={allowDecimals} />
                <Tooltip formatter={tooltipFormatter} labelFormatter={labelFormatter} />
                {showLegend && <Legend />}
                {series.map((s) => (
                    <Bar key={s.dataKey} dataKey={s.dataKey} fill={s.color} radius={[3, 3, 0, 0]} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
}
