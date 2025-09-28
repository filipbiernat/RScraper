/**
 * Person count selector component with radio buttons
 */

import React from 'react';
import {
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup
} from '@mui/material';

interface PersonSelectorProps {
  value: number | null;
  options: number[];
  onChange: (value: number | null) => void;
  disabled?: boolean;
}

export const PersonSelector: React.FC<PersonSelectorProps> = ({
  value,
  options,
  onChange,
  disabled = false
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    onChange(isNaN(newValue) ? null : newValue);
  };

  return (
    <FormControl component="fieldset" margin="normal" disabled={disabled}>
      <FormLabel component="legend">Number of Persons</FormLabel>
      <RadioGroup
        value={value?.toString() || ''}
        onChange={handleChange}
        row
      >
        {options.sort((a, b) => a - b).map((count) => (
          <FormControlLabel
            key={count}
            value={count.toString()}
            control={<Radio />}
            label={`${count} person${count > 1 ? 's' : ''}`}
            disabled={disabled}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};