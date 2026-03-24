import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Deal } from '../../types/deals';
import { ExpandableDealGrid } from './ExpandableDealGrid';

interface DealSectionProps {
  sectionKey: string;
  label: string;
  deals: Deal[];
  icon: React.ReactNode;
}

export const DealSection: React.FC<DealSectionProps> = ({ sectionKey, label, deals, icon }) => {
  const { t } = useTranslation();

  if (deals.length === 0) {
    return null;
  }

  // Limit to top 30 to prevent rendering lag
  const visibleDeals = deals.slice(0, 30);

  return (
    <Box sx={{ mb: 4 }}>
      {/* Section header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        {icon}
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ({deals.length} {t('deals.dealsCount')})
        </Typography>
      </Box>

      <ExpandableDealGrid deals={visibleDeals} sectionKey={sectionKey} />

      <Divider sx={{ mt: 2 }} />
    </Box>
  );
};

