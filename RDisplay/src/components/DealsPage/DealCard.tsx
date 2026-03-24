/**
 * Individual deal card component
 */

import React from "react";
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Chip,
    Box,
    IconButton,
    Tooltip,
} from "@mui/material";
import {
    OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Deal } from "../../types/deals";
import {
    formatDealPrice,
    getCountryFlag,
    getDealReasonColor,
    getDealReasonIcon,
    getPriceDropBadgeText,
} from "../../utils/dealPresentation";

interface DealCardProps {
    deal: Deal;
}

export const DealCard: React.FC<DealCardProps> = ({ deal }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleClick = () => {
        const params = new URLSearchParams({
            country: deal.country,
            trip: deal.trip,
            airport: deal.airport,
            persons: deal.persons.toString(),
        });
        navigate(`/explorer?${params.toString()}`);
    };

    const handleOfferClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (deal.offerUrl) {
            window.open(deal.offerUrl, "_blank", "noopener,noreferrer");
        }
    };

    // Build deal badge text
    const getBadgeText = (): string => {
        const priceDropText = getPriceDropBadgeText(
            deal.currentPrice,
            deal.previousPrice,
        );

        if (deal.reason === "priceDrop" && priceDropText) {
            return priceDropText;
        }
        if (deal.reason === "allTimeLow") {
            return t("deals.allTimeLowBadge");
        }
        if (deal.reason === "lowestPerTrip") {
            return t("deals.lowestBadge");
        }
        return `${deal.score} pts`;
    };

    return (
        <Card
            sx={{
                minWidth: 0,
                height: "100%",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: (theme) =>
                        `0 8px 24px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.15)"}`,
                },
                background: (theme) =>
                    theme.palette.mode === "dark"
                        ? "linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)"
                        : "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                position: "relative",
                overflow: "visible",
            }}
            onClick={handleClick}
        >
            {/* Country flag badge */}
            <Chip
                label={getCountryFlag(deal.country)}
                aria-label={deal.country}
                sx={{
                    position: "absolute",
                    top: -16,
                    left: 12,
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    height: 36,
                    "& .MuiChip-label": { px: 1 },
                }}
            />

            {/* Score badge */}
            <Chip
                icon={getDealReasonIcon(deal.reason)}
                label={getBadgeText()}
                color={getDealReasonColor(deal.reason)}
                size="small"
                sx={{
                    position: "absolute",
                    top: -10,
                    right: 12,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                }}
            />

            <CardContent sx={{ pb: 1 }}>
                {/* Country */}
                <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ letterSpacing: 1.5 }}
                >
                    {deal.country}
                </Typography>

                {/* Trip name */}
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: 600, lineHeight: 1.3, mb: 1 }}
                >
                    {deal.trip}
                </Typography>

                {/* Date range */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                >
                    📅 {deal.dateRange}
                </Typography>

                {/* Airport */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                >
                    ✈️ {deal.airport}
                </Typography>

                {/* Price */}
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: "primary.main",
                        }}
                    >
                        {formatDealPrice(deal.currentPrice)} zł
                    </Typography>
                    {deal.previousPrice &&
                        deal.previousPrice > deal.currentPrice && (
                            <Typography
                                variant="body2"
                                sx={{
                                    textDecoration: "line-through",
                                    color: "text.disabled",
                                }}
                            >
                                {formatDealPrice(deal.previousPrice)} zł
                            </Typography>
                        )}
                </Box>
            </CardContent>

            <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                {deal.offerUrl && (
                    <Tooltip title={t("deals.viewOnRpl")}>
                        <IconButton
                            size="small"
                            onClick={handleOfferClick}
                            sx={{ color: "text.secondary" }}
                        >
                            <OpenInNewIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </CardActions>
        </Card>
    );
};
