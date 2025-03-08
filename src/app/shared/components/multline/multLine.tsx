import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

interface MultilineTextFieldsProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  fullWidth?: boolean;
  borderRadius?: string;
  disabled?: boolean;
}

export default function MultilineTextFields({
  value,
  onChange,
  label = "Multiline Text",
  placeholder = "Digite algo...",
  rows = 4,
  fullWidth = true,
  borderRadius = '12px',
  disabled = false,
}: MultilineTextFieldsProps) {
  return (
    <Box
      component="form"
      sx={{ '& .MuiTextField-root': { m: 1 } }}
      noValidate
      autoComplete="off"
    >
      <TextField
        id="outlined-multiline-static"
        label={label}
        multiline
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        fullWidth={fullWidth}
        disabled={disabled}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius,
          },
        }}
      />
    </Box>
  );
}