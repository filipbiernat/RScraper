import React, { useState, useMemo } from "react";
import { Box, Button, useTheme, useMediaQuery } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import type { Deal } from "../../types/deals";
import { DealCard } from "./DealCard";

interface ExpandableDealGridProps {
    deals: Deal[];
    sectionKey?: string; // Optional key strictly for mapping uniqueness
}

export const ExpandableDealGrid: React.FC<ExpandableDealGridProps> = ({
    deals,
    sectionKey = "deals",
}) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const theme = useTheme();

    // Responsive column count detection to fill the first row accurately
    const isXl = useMediaQuery(theme.breakpoints.up("xl")); // > 1536px
    const isLg = useMediaQuery(theme.breakpoints.up("lg")); // > 1200px
    const isMd = useMediaQuery(theme.breakpoints.up("md")); // > 900px
    const isSm = useMediaQuery(theme.breakpoints.up("sm")); // > 600px

    const initialCount = useMemo(() => {
        if (isXl) return 5; // On 1920px (user's screen), 5 cards fit perfectly
        if (isLg) return 4;
        if (isMd) return 3;
        if (isSm) return 2;
        return 1;
    }, [isXl, isLg, isMd, isSm]);

    if (!deals || deals.length === 0) {
        return null;
    }

    // If we only have 1 extra deal beyond the row, just show it instead of adding a button
    // This feels much better than having a "Show more" for just one card.
    const effectiveInitialCount =
        deals.length === initialCount + 1 ? deals.length : initialCount;
    const showExpandButton = deals.length > effectiveInitialCount;

    const visibleDeals = isExpanded
        ? deals
        : deals.slice(0, effectiveInitialCount);

    return (
        <Box sx={{ width: "100%", pb: 1, maxWidth: 1600, mx: "auto" }}>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${initialCount}, minmax(0, 1fr))`,
                    gap: 2,
                    pt: 1.5,
                    pb: 2,
                }}
            >
                {visibleDeals.map((deal, index) => (
                    <DealCard
                        key={`${sectionKey}-${deal.csvFileName}-${deal.dateRange}-${index}`}
                        deal={deal}
                    />
                ))}
            </Box>

            {showExpandButton && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 1,
                        mb: 2,
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={() => setIsExpanded(!isExpanded)}
                        endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                        color="primary"
                        sx={{
                            borderRadius: 6,
                            px: 3,
                            textTransform: "none",
                            fontWeight: 600,
                        }}
                    >
                        {isExpanded ? t("deals.showLess") : t("deals.showMore")}
                    </Button>
                </Box>
            )}
        </Box>
    );
};
