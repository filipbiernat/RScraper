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

  // Split deals by person count and limit to top 30 each to prevent rendering lag
  const deals1os = deals.filter(d => d.persons === 1).slice(0, 30);
  const deals2os = deals.filter(d => d.persons === 2).slice(0, 30);

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

      {/* 1 person group */}
      {deals1os.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 1, mb: 0.5 }}>
            👤 {t('deals.onePersonGroup')}
          </Typography>
          <ExpandableDealGrid deals={deals1os} sectionKey={`${sectionKey}-1os`} />
        </Box>
      )}

      {/* 2 persons group */}
      {deals2os.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 1, mb: 0.5 }}>
            👥 {t('deals.twoPersonsGroup')}
          </Typography>
          <ExpandableDealGrid deals={deals2os} sectionKey={`${sectionKey}-2os`} />
        </Box>
      )}

      <Divider sx={{ mt: 2 }} />
    </Box>
  );
};

