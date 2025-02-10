import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

interface MultilineTextFieldsProps {
  value: string; // Valor do campo de texto (obrigatório)
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; // Função de mudança (obrigatória)
  label?: string; // Label do campo (opcional)
  placeholder?: string; // Placeholder do campo (opcional)
  rows?: number; // Número de linhas (opcional, padrão: 4)
  fullWidth?: boolean; // Ocupar largura total (opcional, padrão: true)
  borderRadius?: string; // Raio da borda (opcional, padrão: '12px')
}

export default function MultilineTextFields({
  value,
  onChange,
  label = "Multiline Text", // Valor padrão para o label
  placeholder = "Digite algo...", // Valor padrão para o placeholder
  rows = 4, // Valor padrão para o número de linhas
  fullWidth = true, // Valor padrão para ocupar a largura total
  borderRadius = '12px', // Valor padrão para o raio da borda
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
        label={label} // Label personalizado
        multiline
        rows={rows} // Número de linhas personalizado
        value={value} // Valor controlado pelo estado externo
        onChange={onChange} // Função para atualizar o estado externo
        placeholder={placeholder} // Placeholder personalizado
        fullWidth={fullWidth} // Define se ocupa a largura total
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius, // Raio da borda personalizado
          },
        }}
      />
    </Box>
  );
}