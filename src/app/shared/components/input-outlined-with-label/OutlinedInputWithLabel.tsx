import React, { useState } from 'react';
import { TextField } from '@mui/material';
import './OutlinedInputWithLabel.style.css';

const OutlinedInputWithLabel = ({ ...props }) => {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="input-container">
      <TextField
        label="Razão social"
        variant="outlined"
        value={value}
        onChange={handleChange}
        fullWidth
        focused
        className="outlined-input"
        {...props} 
      />
    </div>
  );
};

export default OutlinedInputWithLabel;
