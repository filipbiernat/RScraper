import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Tab,
    Tabs,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { AppLayout } from "../Layout/AppLayout";
import { useLastMinuteData } from "../../hooks/useLastMinuteData";
import type { LastMinuteEntry } from "../../types/lastMinute";
import { LastMinuteCard } from "./LastMinuteCard";

const parseLocalDate = (isoDate: string): Date => {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Date(year, month - 1, day);
};

const formatGroupDate = (isoDate: string, language: string): string => {
    return parseLocalDate(isoDate).toLocaleDateString(
        language === "pl" ? "pl-PL" : "en-US",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
        },
    );
};

const getTodayAtMidnight = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const getDaysUntilDeparture = (isoDate: string, today: Date): number => {
    const departureDate = parseLocalDate(isoDate);
    const diffInMs = departureDate.getTime() - today.getTime();
    return Math.round(diffInMs / (1000 * 60 * 60 * 24));
};

interface LastMinuteEntryViewModel extends LastMinuteEntry {
    effectiveDaysUntilDeparture: number;
}

export const LastMinutePage: React.FC = () => {
    const { data, loading, error } = useLastMinuteData();
    const { t, i18n } = useTranslation();
    const [activePersons, setActivePersons] = useState<number>(1);
    const [windowDays, setWindowDays] = useState<number>(14);
    const [selectedCountry, setSelectedCountry] = useState<string>("");
    const [selectedAirport, setSelectedAirport] = useState<string>("");
    const [maxPriceInput, setMaxPriceInput] = useState<string>("");
    const maxWindowDays = data?.maxWindowDays ?? 30;
    const today = getTodayAtMidnight();

    useEffect(() => {
        document.title = `${t("lastMinute.pageTitle")} - ${t("app.titleSuffix")}`;
    }, [t, i18n.language]);

    const windowEntries = useMemo(() => {
        if (!data) {
            return [] as LastMinuteEntryViewModel[];
        }

        return data.entries
            .map((entry) => ({
                ...entry,
                effectiveDaysUntilDeparture: getDaysUntilDeparture(
                    entry.departureDate,
                    today,
                ),
            }))
            .filter(
                (entry) =>
                    entry.persons === activePersons &&
                    entry.effectiveDaysUntilDeparture >= 0 &&
                    entry.effectiveDaysUntilDeparture <= windowDays,
            );
    }, [activePersons, data, today, windowDays]);

    const availableCountries = useMemo(() => {
        return Array.from(
            new Set(windowEntries.map((entry) => entry.country)),
        ).sort((a, b) => a.localeCompare(b));
    }, [windowEntries]);

    const availableAirports = useMemo(() => {
        return Array.from(
            new Set(
                windowEntries
                    .filter(
                        (entry) =>
                            !selectedCountry ||
                            entry.country === selectedCountry,
                    )
                    .map((entry) => entry.airport),
            ),
        ).sort((a, b) => a.localeCompare(b));
    }, [selectedCountry, windowEntries]);

    useEffect(() => {
        if (selectedCountry && !availableCountries.includes(selectedCountry)) {
            setSelectedCountry("");
        }
    }, [availableCountries, selectedCountry]);

    useEffect(() => {
        if (selectedAirport && !availableAirports.includes(selectedAirport)) {
            setSelectedAirport("");
        }
    }, [availableAirports, selectedAirport]);

    const parsedMaxPrice = maxPriceInput.trim() ? Number(maxPriceInput) : null;
    const maxPrice =
        parsedMaxPrice !== null &&
        Number.isFinite(parsedMaxPrice) &&
        parsedMaxPrice > 0
            ? parsedMaxPrice
            : null;

    const filteredEntries = useMemo(() => {
        return windowEntries
            .filter(
                (entry) =>
                    !selectedCountry || entry.country === selectedCountry,
            )
            .filter(
                (entry) =>
                    !selectedAirport || entry.airport === selectedAirport,
            )
            .filter(
                (entry) => maxPrice === null || entry.currentPrice <= maxPrice,
            )
            .sort((a, b) => {
                if (a.departureDate !== b.departureDate) {
                    return a.departureDate.localeCompare(b.departureDate);
                }
                if (a.isDeal !== b.isDeal) {
                    return a.isDeal ? -1 : 1;
                }
                if (a.currentPrice !== b.currentPrice) {
                    return a.currentPrice - b.currentPrice;
                }
                return a.trip.localeCompare(b.trip);
            });
    }, [maxPrice, selectedAirport, selectedCountry, windowEntries]);

    const groupedEntries = useMemo(() => {
        const groups = new Map<string, LastMinuteEntryViewModel[]>();

        filteredEntries.forEach((entry) => {
            const existing = groups.get(entry.departureDate);
            if (existing) {
                existing.push(entry);
            } else {
                groups.set(entry.departureDate, [entry]);
            }
        });

        return Array.from(groups.entries()).map(([departureDate, entries]) => ({
            departureDate,
            entries,
        }));
    }, [filteredEntries]);

    const sidebar = (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Toolbar />

            <Box sx={{ p: 2, flexGrow: 1 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        backgroundColor: "transparent",
                        height: "100%",
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        {t("lastMinute.filtersTitle")}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={2}>
                        <FormControl fullWidth>
                            <InputLabel id="last-minute-country-label">
                                {t("filter.country")}
                            </InputLabel>
                            <Select
                                labelId="last-minute-country-label"
                                value={selectedCountry}
                                label={t("filter.country")}
                                onChange={(event) =>
                                    setSelectedCountry(event.target.value)
                                }
                            >
                                <MenuItem value="">
                                    {t("lastMinute.allCountries")}
                                </MenuItem>
                                {availableCountries.map((country) => (
                                    <MenuItem key={country} value={country}>
                                        {country}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel id="last-minute-airport-label">
                                {t("filter.departureAirport")}
                            </InputLabel>
                            <Select
                                labelId="last-minute-airport-label"
                                value={selectedAirport}
                                label={t("filter.departureAirport")}
                                onChange={(event) =>
                                    setSelectedAirport(event.target.value)
                                }
                            >
                                <MenuItem value="">
                                    {t("lastMinute.allAirports")}
                                </MenuItem>
                                {availableAirports.map((airport) => (
                                    <MenuItem key={airport} value={airport}>
                                        {airport}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            type="number"
                            label={t("lastMinute.maxPrice")}
                            value={maxPriceInput}
                            onChange={(event) =>
                                setMaxPriceInput(event.target.value)
                            }
                            inputProps={{ min: 0, step: 100 }}
                            helperText={t("lastMinute.pricePerPerson")}
                            fullWidth
                        />

                        <Button
                            variant={
                                windowDays === maxWindowDays
                                    ? "contained"
                                    : "outlined"
                            }
                            onClick={() => setWindowDays(maxWindowDays)}
                            disabled={windowDays === maxWindowDays}
                        >
                            {t("lastMinute.showWiderWindow")}
                        </Button>

                        {data && (
                            <Typography variant="body2" color="text.secondary">
                                {t("lastMinute.generatedAt")}:{" "}
                                {new Date(data.generatedAt).toLocaleString(
                                    i18n.language === "pl" ? "pl-PL" : "en-US",
                                )}
                            </Typography>
                        )}
                    </Stack>
                </Paper>
            </Box>
        </Box>
    );

    return (
        <AppLayout
            sidebar={sidebar}
            title={t("lastMinute.pageTitle")}
            dealsPath="/"
        >
            <Stack spacing={3}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {t("lastMinute.pageTitle")}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t("lastMinute.subtitle", { count: windowDays })}
                    </Typography>
                </Box>

                <Paper sx={{ p: 1 }}>
                    <Tabs
                        value={activePersons}
                        onChange={(_event, value: number) =>
                            setActivePersons(value)
                        }
                        variant="fullWidth"
                    >
                        <Tab value={1} label={t("deals.onePersonGroup")} />
                        <Tab value={2} label={t("deals.twoPersonsGroup")} />
                    </Tabs>
                </Paper>

                {loading && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 8,
                        }}
                    >
                        <CircularProgress size={48} />
                    </Box>
                )}

                {error && (
                    <Alert severity="error">
                        {t("lastMinute.errorLoading")}: {error}
                    </Alert>
                )}

                {!loading && !error && filteredEntries.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            {t("lastMinute.emptyTitle")}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                        >
                            {windowDays === 14
                                ? t("lastMinute.emptyHint14")
                                : t("lastMinute.emptyHint30")}
                        </Typography>
                        {windowDays === 14 && (
                            <Button
                                variant="contained"
                                onClick={() => setWindowDays(maxWindowDays)}
                            >
                                {t("lastMinute.showWiderWindow")}
                            </Button>
                        )}
                    </Paper>
                )}

                {!loading && !error && filteredEntries.length > 0 && (
                    <Stack spacing={3}>
                        <Typography variant="body2" color="text.secondary">
                            {t("lastMinute.resultsCount", {
                                count: filteredEntries.length,
                            })}
                        </Typography>

                        {groupedEntries.map((group) => (
                            <Box key={group.departureDate}>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        mb: "20px",
                                        textTransform: "capitalize",
                                    }}
                                >
                                    {formatGroupDate(
                                        group.departureDate,
                                        i18n.language,
                                    )}
                                </Typography>
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                            xs: "1fr",
                                            md: "repeat(2, minmax(0, 1fr))",
                                            lg: "repeat(4, minmax(0, 1fr))",
                                        },
                                        gap: 2,
                                    }}
                                >
                                    {group.entries.map((entry) => (
                                        <LastMinuteCard
                                            key={`${entry.csvFileName}-${entry.dateRange}-${entry.persons}`}
                                            entry={entry}
                                            daysUntilDeparture={
                                                entry.effectiveDaysUntilDeparture
                                            }
                                        />
                                    ))}
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Stack>
        </AppLayout>
    );
};
