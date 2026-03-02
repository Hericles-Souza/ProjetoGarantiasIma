import * as React from "react";
import Checkbox from "@mui/material/Checkbox";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

interface ColorCheckboxesProps {
  checked: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export default function ColorCheckboxes({
  checked,
  onChange,
  disabled, 
}: ColorCheckboxesProps) {
  return (
    <Checkbox
      {...label}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      sx={{
        color: "#FF0000",
        "&.Mui-checked": {
          color: "#FF0000",
        },
      }}
    />
  );
} 