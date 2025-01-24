import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

export default function ColorCheckboxes() {
  return (
    <Checkbox
      {...label}
      defaultChecked
      sx={{
        color: '#FF0000', 
        '&.Mui-checked': {
          color: '#FF0000', 
        },
      }}
    />
  );
}
