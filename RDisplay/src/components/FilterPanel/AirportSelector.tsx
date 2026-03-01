/**
 * Airport selector component
 */

import React from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface AirportSelectorProps {
  value: string | null;
  options: string[];
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export const AirportSelector: React.FC<AirportSelectorProps> = ({
  value,
  options,
  onChange,
  disabled = false
}) => {
  const { t } = useTranslation();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newValue = event.target.value;
    onChange(newValue === '' ? null : newValue);
  };

  return (
    <FormControl fullWidth margin="normal" disabled={disabled}>
      <InputLabel id="airport-select-label">{t('filter.departureAirport')}</InputLabel>
      <Select
        labelId="airport-select-label"
        value={value || ''}
        label={t('filter.departureAirport')}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>{t('filter.selectAirport')}</em>
        </MenuItem>
        {options.sort().map((airport) => (
          <MenuItem key={airport} value={airport}>
            {airport}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};