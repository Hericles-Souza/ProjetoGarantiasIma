import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function MultilineTextFields() {
  return (
    <Box
      component="form"
      sx={{ '& .MuiTextField-root': { m: 1 } }}
      noValidate
      autoComplete="off"
    >
      <TextField
        id="outlined-multiline-static"
        label="Resultados da conclusão"
        multiline
        rows={4}
        defaultValue=" "
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px', 
          },
        }}
      />
    </Box>
  );
}
