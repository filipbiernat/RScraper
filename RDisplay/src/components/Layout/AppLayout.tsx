/**
 * Main application layout with Material-UI components
 */

import React, { useState } from "react";
import {
    AppBar,
    Box,
    Button,
    CssBaseline,
    Drawer,
    IconButton,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { Menu as MenuIcon, Home as HomeIcon } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface AppLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
    title: string;
    dealsPath?: string;
}

const DRAWER_WIDTH = 300;

export const AppLayout: React.FC<AppLayoutProps> = ({
    children,
    sidebar,
    title,
    dealsPath,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const { t } = useTranslation();

    const handleDrawerToggle = () => {
        setMobileDrawerOpen(!mobileDrawerOpen);
    };

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />

            {/* App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: isMobile ? "100%" : `calc(100% - ${DRAWER_WIDTH}px)`,
                    ml: isMobile ? 0 : `${DRAWER_WIDTH}px`,
                    zIndex: theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        {title}
                    </Typography>
                    {dealsPath && (
                        <Button
                            color="inherit"
                            startIcon={<HomeIcon />}
                            component={RouterLink}
                            to={dealsPath}
                            sx={{ mr: 1 }}
                        >
                            {t("deals.navDeals")}
                        </Button>
                    )}
                    <LanguageSwitcher />
                </Toolbar>
            </AppBar>

            {/* Navigation Drawer */}
            <Box
                component="nav"
                sx={{ width: isMobile ? 0 : DRAWER_WIDTH, flexShrink: 0 }}
            >
                {isMobile ? (
                    // Mobile drawer
                    <Drawer
                        variant="temporary"
                        open={mobileDrawerOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile
                        }}
                        sx={{
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                width: DRAWER_WIDTH,
                            },
                        }}
                    >
                        {sidebar}
                    </Drawer>
                ) : (
                    // Desktop drawer
                    <Drawer
                        variant="permanent"
                        sx={{
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                width: DRAWER_WIDTH,
                            },
                        }}
                        open
                    >
                        {sidebar}
                    </Drawer>
                )}
            </Box>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: isMobile ? "100%" : `calc(100% - ${DRAWER_WIDTH}px)`,
                    mt: 8, // Account for AppBar height
                }}
            >
                {children}
            </Box>
        </Box>
    );
};
