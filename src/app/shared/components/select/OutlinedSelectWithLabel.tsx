import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import './OutlinedSelectWithLabel.css';

// Adicione uma interface para definir as props
interface OutlinedSelectWithLabelProps {
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  className?: string; // Permite que o componente receba uma classe CSS
  [key: string]: any; // Captura outras propriedades adicionais
}

export default function OutlinedSelectWithLabel({
  label,
  options,
  defaultValue,
  className,
  ...props // Captura propriedades adicionais
}: OutlinedSelectWithLabelProps) {
  return (
    <Box
      component="form"
      sx={{
        gap: '3px',
        width: '100%',
      }}
      noValidate
      autoComplete="off"
    >
      <div className={`input-container ${className || ''}`} style={{ width: '100%' }}>
        <TextField
          id="outlined-select-currency"
          select
          label={label}
          defaultValue={defaultValue || options[0]?.value}
          helperText=""
          sx={{
            width: '100%',
            height: '40px',
            borderRadius: '4px',
            '& .MuiOutlinedInput-root': {
              borderColor: '#5F5A56',
            },
            '& .MuiInputLabel-root': {
              color: '#5F5A56',
            },
            '& .MuiOutlinedInput-root.Mui-focused': {
              borderColor: '#5F5A56',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#dadada',
              borderWidth: '2px',
            },
          }}
          className={`outlined-select ${className || ''}`}
          {...props} // Repassa propriedades adicionais ao TextField
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </div>
    </Box>
  );
}
