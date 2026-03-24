import React from "react";
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardActions,
    Chip,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    OpenInNew as OpenInNewIcon,
    LocalFireDepartment as LocalFireDepartmentIcon,
    AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import type { LastMinuteEntry } from "../../types/lastMinute";
import {
    formatDealPrice,
    getCountryFlag,
    getDealReasonColor,
    getPriceDropBadgeText,
} from "../../utils/dealPresentation";

interface LastMinuteCardProps {
    entry: LastMinuteEntry;
    daysUntilDeparture: number;
}

export const LastMinuteCard: React.FC<LastMinuteCardProps> = ({
    entry,
    daysUntilDeparture,
}) => {
    const { t } = useTranslation();

    const explorerPath = `/explorer?${new URLSearchParams({
        country: entry.country,
        trip: entry.trip,
        airport: entry.airport,
        persons: entry.persons.toString(),
    }).toString()}`;

    const handleOpenOffer = () => {
        if (entry.offerUrl) {
            window.open(entry.offerUrl, "_blank", "noopener,noreferrer");
        }
    };

    const reasonColor = getDealReasonColor(entry.dealReason);

    const handleOfferClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        handleOpenOffer();
    };

    const getBadgeText = (): string => {
        const priceDropText = getPriceDropBadgeText(
            entry.currentPrice,
            entry.previousPrice,
        );

        if (entry.isDeal && entry.dealReason === "priceDrop" && priceDropText) {
            return priceDropText;
        }

        if (entry.isDeal && entry.dealReason) {
            return t(`lastMinute.reason.${entry.dealReason}`);
        }

        return t("lastMinute.departsInDays", { count: daysUntilDeparture });
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
                borderWidth: entry.isDeal ? 2 : 1,
                borderColor: entry.isDeal ? `${reasonColor}.main` : "divider",
                borderRadius: 2,
                position: "relative",
                overflow: "visible",
            }}
        >
            <CardActionArea
                component={RouterLink}
                to={explorerPath}
                sx={{
                    position: "absolute",
                    top: -20,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    zIndex: 1,
                    borderRadius: 2,
                    color: "inherit",
                    textDecoration: "none",
                    "&:hover": {
                        textDecoration: "none",
                    },
                    "&.Mui-focusVisible": {
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: 4,
                    },
                }}
                aria-label={`${entry.country} ${entry.trip}`}
            />

            <Chip
                label={getCountryFlag(entry.country)}
                aria-label={entry.country}
                sx={{
                    position: "absolute",
                    top: -16,
                    left: 12,
                    zIndex: 2,
                    pointerEvents: "none",
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    height: 36,
                    "& .MuiChip-label": { px: 1 },
                }}
            />

            <Chip
                icon={
                    entry.isDeal ? (
                        <LocalFireDepartmentIcon fontSize="small" />
                    ) : (
                        <AccessTimeIcon fontSize="small" />
                    )
                }
                label={getBadgeText()}
                color={
                    entry.isDeal
                        ? reasonColor
                        : daysUntilDeparture <= 7
                          ? "error"
                          : "default"
                }
                size="small"
                sx={{
                    position: "absolute",
                    top: -10,
                    right: 12,
                    zIndex: 2,
                    pointerEvents: "none",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    maxWidth: 160,
                }}
            />

            <CardContent sx={{ pb: 1, position: "relative", zIndex: 0 }}>
                <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ letterSpacing: 1.5 }}
                >
                    {entry.country}
                </Typography>

                <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: 600, lineHeight: 1.3, mb: 1 }}
                >
                    {entry.trip}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                >
                    📅 {entry.dateRange}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                >
                    ✈️ {entry.airport}
                </Typography>

                {entry.tripLengthDays > 0 && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1.5 }}
                    >
                        ⏱️{" "}
                        {t("lastMinute.tripLengthDays", {
                            count: entry.tripLengthDays,
                        })}
                    </Typography>
                )}

                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: "primary.main",
                        }}
                    >
                        {formatDealPrice(entry.currentPrice)} zł
                    </Typography>
                    {entry.previousPrice &&
                        entry.previousPrice > entry.currentPrice && (
                            <Typography
                                variant="body2"
                                sx={{
                                    textDecoration: "line-through",
                                    color: "text.disabled",
                                }}
                            >
                                {formatDealPrice(entry.previousPrice)} zł
                            </Typography>
                        )}
                </Box>
            </CardContent>

            <CardActions
                sx={{
                    justifyContent: "flex-end",
                    pt: 0,
                    position: "relative",
                    zIndex: 2,
                    pointerEvents: "none",
                }}
            >
                {entry.offerUrl && (
                    <Tooltip title={t("lastMinute.openOffer")}>
                        <IconButton
                            size="small"
                            onClick={handleOfferClick}
                            sx={{
                                color: "text.secondary",
                                pointerEvents: "auto",
                            }}
                        >
                            <OpenInNewIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </CardActions>
        </Card>
    );
};
