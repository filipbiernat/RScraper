/**
 * Main data table component for displaying trip pricing data
 */

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Chip,
    Skeleton,
    IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import { useTranslation } from "react-i18next";
import type { CsvData, YearGroup, TripTerm } from "../../types/csvData";

interface DataTableProps {
    data: CsvData | null;
    loading: boolean;
    error: string | null;
}

export const DataTable: React.FC<DataTableProps> = ({
    data,
    loading,
    error,
}) => {
    const { t } = useTranslation();
    const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Initialize expanded years when data changes
    React.useEffect(() => {
        if (data?.yearGroups) {
            const defaultExpanded = data.yearGroups
                .filter((group) => group.isExpanded)
                .map((group) => group.year);
            setExpandedYears(new Set(defaultExpanded));
        }
        setSortColumn(null);
        setSortDirection("asc");
    }, [data]);

    const toggleYearExpansion = (year: number) => {
        setExpandedYears((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(year)) {
                newSet.delete(year);
            } else {
                newSet.add(year);
            }
            return newSet;
        });
    };

    const handleSortClick = (columnKey: string) => {
        if (sortColumn === columnKey) {
            if (sortDirection === "asc") setSortDirection("desc");
            else {
                setSortColumn(null);
                setSortDirection("asc");
            }
        } else {
            setSortColumn(columnKey);
            setSortDirection("asc");
        }
    };

    const sortTerms = (terms: TripTerm[]): TripTerm[] => {
        if (!sortColumn) return terms;
        return [...terms].sort((a, b) => {
            let aVal: number | string | null = null;
            let bVal: number | string | null = null;
            if (sortColumn === "dateRange") {
                aVal = a.dateRange;
                bVal = b.dateRange;
            } else if (sortColumn === "currentPrice") {
                aVal = a.currentPrice;
                bVal = b.currentPrice;
            } else {
                const aEntry = a.priceHistory.find(
                    (p) => p.timestamp === sortColumn,
                );
                const bEntry = b.priceHistory.find(
                    (p) => p.timestamp === sortColumn,
                );
                aVal = aEntry?.price ?? null;
                bVal = bEntry?.price ?? null;
            }
            if (aVal === null && bVal === null) return 0;
            if (aVal === null) return 1;
            if (bVal === null) return -1;
            const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return sortDirection === "asc" ? cmp : -cmp;
        });
    };

    const renderYearGroup = (yearGroup: YearGroup) => {
        const isExpanded = expandedYears.has(yearGroup.year);

        return (
            <React.Fragment key={yearGroup.year}>
                {/* Year header row */}
                <TableRow>
                    <TableCell
                        colSpan={2 + (data?.timestamps.length || 0)}
                        sx={{
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            fontWeight: "bold",
                            cursor: "pointer",
                            "&:hover": { bgcolor: "primary.dark" },
                        }}
                        onClick={() => toggleYearExpansion(yearGroup.year)}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <IconButton
                                size="small"
                                sx={{ color: "inherit" }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleYearExpansion(yearGroup.year);
                                }}
                            >
                                <ExpandMoreIcon
                                    sx={{
                                        transform: isExpanded
                                            ? "rotate(180deg)"
                                            : "rotate(0deg)",
                                        transition: "transform 0.2s",
                                    }}
                                />
                            </IconButton>
                            <Typography variant="h6">
                                {yearGroup.year} (
                                {t("table.tripsCount", {
                                    count: yearGroup.terms.length,
                                })}
                                )
                            </Typography>
                        </Box>
                    </TableCell>
                </TableRow>

                {/* Trip rows for this year (only if expanded) */}
                {isExpanded &&
                    sortTerms(yearGroup.terms).map((term, index) => (
                        <TableRow
                            key={`${yearGroup.year}-${index}`}
                            hover
                            sx={{
                                "&:nth-of-type(odd)": {
                                    bgcolor: "action.hover",
                                },
                            }}
                        >
                            <TableCell
                                sx={{
                                    fontWeight: "medium",
                                    textAlign: "center",
                                }}
                            >
                                {term.dateRange}
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: "bold",
                                        color: "primary.main",
                                    }}
                                >
                                    {formatPrice(term.currentPrice)} zł
                                </Typography>
                            </TableCell>
                            {data?.timestamps.map(
                                (timestamp, timestampIndex) => {
                                    const priceEntry = term.priceHistory.find(
                                        (p) => p.timestamp === timestamp,
                                    );
                                    return (
                                        <TableCell
                                            key={timestampIndex}
                                            sx={{ textAlign: "center" }}
                                        >
                                            {priceEntry ? (
                                                <Typography variant="body2">
                                                    {formatPrice(
                                                        priceEntry.price,
                                                    )}{" "}
                                                    zł
                                                </Typography>
                                            ) : (
                                                <Typography
                                                    variant="body2"
                                                    color="text.disabled"
                                                >
                                                    —
                                                </Typography>
                                            )}
                                        </TableCell>
                                    );
                                },
                            )}
                        </TableRow>
                    ))}
            </React.Fragment>
        );
    };
    if (loading) {
        return (
            <Box>
                <Typography variant="h6" gutterBottom>
                    <Skeleton width={200} />
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Skeleton />
                                </TableCell>
                                <TableCell>
                                    <Skeleton />
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...Array(5)].map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Skeleton />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6" color="error" gutterBottom>
                    {t("table.errorLoadingData")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {error}
                </Typography>
            </Box>
        );
    }

    if (!data) {
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t("table.noDataSelected")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t("table.noDataHint")}
                </Typography>
            </Box>
        );
    }

    if (data.terms.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t("table.noFutureTrips")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t("table.noFutureTripsHint")}
                </Typography>
            </Box>
        );
    }

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat("pl-PL", {
            style: "decimal",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatTimestamp = (timestamp: string): string => {
        try {
            // Parse timestamp format: "dd.mm.yyyy hh:mm:ss"
            const [date, time] = timestamp.split(" ");
            const [day, month, year] = date.split(".");
            const [hour, minute] = time.split(":");

            // Return in European format: DD.MM.YYYY, HH:MM
            const formattedDate = `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
            const formattedTime = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

            return `${formattedDate}, ${formattedTime}`;
        } catch {
            return timestamp;
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6">{t("table.title")}</Typography>
                <Chip
                    label={t("table.upcomingTrips", {
                        count: data.terms.length,
                    })}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            </Box>

            {/* Action links */}
            <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Typography
                    component="a"
                    href={`https://github.com/filipbiernat/RScraper/blob/master/data/${data.fileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    sx={{
                        color: "primary.main",
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                    }}
                >
                    {t("table.viewCsvOnGithub")}
                </Typography>

                {data.offerUrl && (
                    <Typography
                        component="a"
                        href={data.offerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        sx={{
                            color: "secondary.main",
                            textDecoration: "none",
                            "&:hover": { textDecoration: "underline" },
                        }}
                    >
                        {t("table.viewTripOffer")}
                    </Typography>
                )}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t("table.lastUpdated")}{" "}
                {data.lastUpdated
                    ? formatTimestamp(data.lastUpdated)
                    : t("table.unknown")}
            </Typography>

            <TableContainer component={Paper} sx={{ maxHeight: "70vh" }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    fontWeight: "bold",
                                    minWidth: 120,
                                    textAlign: "center",
                                    cursor: "pointer",
                                }}
                                onClick={() => handleSortClick("dateRange")}
                            >
                                {t("table.tripDates")}
                                {sortColumn === "dateRange" &&
                                    (sortDirection === "asc" ? (
                                        <ArrowUpward fontSize="inherit" />
                                    ) : (
                                        <ArrowDownward fontSize="inherit" />
                                    ))}
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: "bold",
                                    minWidth: 100,
                                    textAlign: "center",
                                    cursor: "pointer",
                                }}
                                onClick={() => handleSortClick("currentPrice")}
                            >
                                {t("table.currentPrice")}
                                {sortColumn === "currentPrice" &&
                                    (sortDirection === "asc" ? (
                                        <ArrowUpward fontSize="inherit" />
                                    ) : (
                                        <ArrowDownward fontSize="inherit" />
                                    ))}
                            </TableCell>
                            {data.timestamps.map((timestamp, index) => (
                                <TableCell
                                    key={index}
                                    sx={{
                                        fontWeight: "bold",
                                        minWidth: 100,
                                        textAlign: "center",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleSortClick(timestamp)}
                                >
                                    {formatTimestamp(timestamp)}
                                    {sortColumn === timestamp &&
                                        (sortDirection === "asc" ? (
                                            <ArrowUpward fontSize="inherit" />
                                        ) : (
                                            <ArrowDownward fontSize="inherit" />
                                        ))}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.yearGroups.map((yearGroup) =>
                            renderYearGroup(yearGroup),
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
