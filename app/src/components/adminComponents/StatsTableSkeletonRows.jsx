import { Skeleton, TableCell, TableRow } from "@mui/material";

export default function StatsTableSkeletonRows({ cols, rows = 4 }) {
    return Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
            {Array.from({ length: cols }).map((_, j) => (
                <TableCell key={j}>
                    <Skeleton />
                </TableCell>
            ))}
        </TableRow>
    ));
}
