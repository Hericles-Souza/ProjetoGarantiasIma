import React from "react";
import { TextField } from "@mui/material";
import "./OutlinedInputWithLabel.style.css";

interface OutlinedInputWithLabelProps {
  label?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; // 👈 ADICIONADO
  type?: "text" | "number" | "password";
  disabled?: boolean;
  InputProps?: object;
  fullWidth?: boolean;
}

const OutlinedInputWithLabel: React.FC<OutlinedInputWithLabelProps> = ({
  label = "Razão social",
  value,
  onChange,
  onKeyDown,
  type = "text",
  disabled = false,
  InputProps,
  fullWidth = false,
  ...props
}) => {
  return (
    <div className="input-container">
      <TextField
        label={label}
        variant="outlined"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="outlined-input"
        type={type}
        disabled={disabled}
        InputProps={{
          ...InputProps,
          sx: {
            "& .MuiInputLabel-root": { backgroundColor: "transparent" },
            "& .MuiInputLabel-root.Mui-focused": { backgroundColor: "transparent" }
          }
        }}
        fullWidth={fullWidth}
        {...props}
      />

    </div>
  );
};

export default OutlinedInputWithLabel;
