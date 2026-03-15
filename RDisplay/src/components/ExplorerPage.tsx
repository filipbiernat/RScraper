import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";

import type { SourcesConfig } from "../types/sources";
import type { FilterState } from "../types/filters";
import type { Deal } from "../types/deals";
import { AppLayout } from "./Layout/AppLayout";
import { FilterPanel } from "./FilterPanel/FilterPanel";
import { DataTable } from "./DataTable/DataTable";
import { useFilters } from "../hooks/useFilters";
import { useCsvData } from "../hooks/useCsvData";
import { useDeals } from "../hooks/useDeals";
import { ExpandableDealGrid } from "./DealsPage/ExpandableDealGrid";

interface ExplorerPageProps {
    sourcesConfig: SourcesConfig | null;
    configLoading: boolean;
}

export const ExplorerPage: React.FC<ExplorerPageProps> = ({
    sourcesConfig,
    configLoading,
}) => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [initialFiltersApplied, setInitialFiltersApplied] = useState(false);

    // Generate dynamic display title shown in AppBar (no suffix)
    const generateDisplayTitle = (filters: FilterState): string => {
        const parts: string[] = [];
        if (filters.country) parts.push(filters.country);
        if (filters.trip) parts.push(filters.trip);
        if (filters.departureAirport) parts.push(filters.departureAirport);
        if (filters.persons)
            parts.push(
                `${filters.persons} ${t("app.person", { count: filters.persons })}`,
            );
        return parts.length > 0 ? parts.join(" • ") : t("app.defaultTitle");
    };

    const { filters, availableOptions, updateFilter, currentFileName } =
        useFilters(sourcesConfig);
    const {
        data: csvData,
        loading: csvLoading,
        error: csvError,
    } = useCsvData(currentFileName);

    // Load deals data to show relevant deals in the explorer view
    const { data: dealsData } = useDeals();

    // Apply filters from URL search params (from deal card click)
    useEffect(() => {
        if (initialFiltersApplied || !sourcesConfig) return;

        const country = searchParams.get("country");
        const trip = searchParams.get("trip");
        const airport = searchParams.get("airport");
        const persons = searchParams.get("persons");

        if (country) {
            updateFilter("country", country);

            if (trip) {
                setTimeout(() => {
                    updateFilter("trip", trip);
                    if (airport) {
                        setTimeout(() => {
                            updateFilter("departureAirport", airport);
                            if (persons) {
                                setTimeout(() => {
                                    updateFilter(
                                        "persons",
                                        parseInt(persons, 10),
                                    );
                                }, 100);
                            }
                        }, 100);
                    }
                }, 100);
            }
        }

        setInitialFiltersApplied(true);
    }, [sourcesConfig, searchParams, initialFiltersApplied, updateFilter]);

    // Extract deals matching current filters
    const matchingDeals = useMemo(() => {
        if (!dealsData || !filters.country || !filters.trip) return [];

        // Flatten all deals from all sections into one array
        const allDeals: Deal[] = [];
        Object.values(dealsData.sections).forEach((section) => {
            allDeals.push(...section.deals);
        });

        // Remove duplicates based on csvFileName and dateRange
        const uniqueDealsMap = new Map<string, Deal>();
        allDeals.forEach((deal) => {
            const key = `${deal.csvFileName}-${deal.dateRange}`;
            // Keep the one with the highest score if duplicates exist
            if (
                !uniqueDealsMap.has(key) ||
                uniqueDealsMap.get(key)!.score < deal.score
            ) {
                uniqueDealsMap.set(key, deal);
            }
        });

        const uniqueDeals = Array.from(uniqueDealsMap.values());

        // Filter deals based on current selections.
        // Airport might be 'ALL', meaning all airports are matched.
        return uniqueDeals
            .filter((deal) => {
                const matchesCountry = deal.country === filters.country;
                const matchesTrip = deal.trip === filters.trip;
                const matchesAirport =
                    !filters.departureAirport ||
                    filters.departureAirport === "ALL" ||
                    deal.airport === filters.departureAirport;
                const matchesPersons =
                    !filters.persons || deal.persons === filters.persons;

                return (
                    matchesCountry &&
                    matchesTrip &&
                    matchesAirport &&
                    matchesPersons
                );
            })
            .sort((a, b) => b.score - a.score); // Highest score first
    }, [dealsData, filters]);

    const currentDisplayTitle = generateDisplayTitle(filters);
    const currentDocumentTitle = `${currentDisplayTitle} – ${t("app.titleSuffix")}`;

    useEffect(() => {
        document.title = currentDocumentTitle;
    }, [currentDocumentTitle]);

    const handleNavigateToDeals = () => {
        navigate("/");
    };

    const sidebar = (
        <FilterPanel
            filters={filters}
            availableOptions={availableOptions}
            onFilterChange={updateFilter}
            loading={configLoading}
        />
    );

    const mainContent = (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Deals Integration Section */}
            {matchingDeals.length > 0 && (
                <Box
                    sx={{
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        p: 2,
                        pt: 3,
                        boxShadow: 1,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mb: 1,
                            px: 1,
                        }}
                    >
                        <Typography
                            variant="h6"
                            color="primary.main"
                            sx={{ fontWeight: 600 }}
                        >
                            {t("deals.explorerDealsHint")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            ({matchingDeals.length}{" "}
                            {t("deals.dealsCountForThisTrip")})
                        </Typography>
                    </Box>

                    <ExpandableDealGrid
                        deals={matchingDeals}
                        sectionKey="explorer-deals"
                    />
                </Box>
            )}

            {/* Main Data Table */}
            <DataTable data={csvData} loading={csvLoading} error={csvError} />
        </Box>
    );

    return (
        <AppLayout
            sidebar={sidebar}
            title={currentDisplayTitle}
            onNavigateToDeals={handleNavigateToDeals}
        >
            {mainContent}
        </AppLayout>
    );
};
