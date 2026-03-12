/**
 * Deals page — dashboard with 4 sections showing travel deals
 */

import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Button,
  Container,
} from '@mui/material';
import {
  Explore as ExploreIcon,
  Star as StarIcon,
  TrendingDown as TrendingDownIcon,
  LocalOffer as LocalOfferIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../Layout/LanguageSwitcher';
import { useDeals } from '../../hooks/useDeals';
import { DealSection } from './DealSection';

const sectionConfig = [
  { key: 'combined', icon: <StarIcon sx={{ color: '#f48fb1', fontSize: 28 }} /> },
  { key: 'priceDrops', icon: <TrendingDownIcon sx={{ color: '#66bb6a', fontSize: 28 }} /> },
  { key: 'lowestPerTrip', icon: <LocalOfferIcon sx={{ color: '#42a5f5', fontSize: 28 }} /> },
  { key: 'allTimeLow', icon: <TrophyIcon sx={{ color: '#ffa726', fontSize: 28 }} /> },
] as const;

export const DealsPage: React.FC = () => {
  const { data, loading, error } = useDeals();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            🔥 {t('deals.pageTitle')}
          </Typography>
          <Button
            color="inherit"
            startIcon={<ExploreIcon />}
            onClick={() => navigate('/explorer')}
            sx={{ mr: 1 }}
          >
            {t('deals.goToExplorer')}
          </Button>
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Container maxWidth="xl" sx={{ pt: 10, pb: 4 }}>
        {/* Loading state */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={48} />
          </Box>
        )}

        {/* Error state */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {t('deals.errorLoading')}: {error}
          </Alert>
        )}

        {/* Deals sections */}
        {data && (
          <>
            {/* Last updated info */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'right' }}>
              {t('deals.generatedAt')}: {new Date(data.generatedAt).toLocaleString('pl-PL')}
            </Typography>

            {/* Render sections in order: Combined (D), Price Drops (A), Lowest (B), All-Time Low (C) */}
            {sectionConfig.map(({ key, icon }) => {
              const section = data.sections[key];
              if (!section || section.deals.length === 0) {
                return null;
              }
              return (
                <DealSection
                  key={key}
                  sectionKey={key}
                  label={t(`deals.section.${key}`)}
                  deals={section.deals}
                  icon={icon}
                />
              );
            })}

            {/* Empty state */}
            {Object.values(data.sections).every(s => s.deals.length === 0) && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  {t('deals.noDeals')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {t('deals.noDealsHint')}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};
