/**
 * Trip selector component
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

interface TripSelectorProps {
  value: string | null;
  options: string[];
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export const TripSelector: React.FC<TripSelectorProps> = ({
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
      <InputLabel id="trip-select-label">{t('filter.trip')}</InputLabel>
      <Select
        labelId="trip-select-label"
        value={value || ''}
        label={t('filter.trip')}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>{t('filter.selectTrip')}</em>
        </MenuItem>
        {options.sort().map((trip) => (
          <MenuItem key={trip} value={trip}>
            {trip}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};