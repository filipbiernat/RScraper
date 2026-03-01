/**
 * Country selector component
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

interface CountrySelectorProps {
  value: string | null;
  options: string[];
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
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
      <InputLabel id="country-select-label">{t('filter.country')}</InputLabel>
      <Select
        labelId="country-select-label"
        value={value || ''}
        label={t('filter.country')}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>{t('filter.selectCountry')}</em>
        </MenuItem>
        {options.sort().map((country) => (
          <MenuItem key={country} value={country}>
            {country}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};