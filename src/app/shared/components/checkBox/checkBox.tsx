import * as React from "react";
import Checkbox from "@mui/material/Checkbox";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

interface ColorCheckboxesProps {
  checked: boolean;  // Recebe o estado `checked` do componente pai
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ColorCheckboxes({ checked, onChange }: ColorCheckboxesProps) {
  return (
    <Checkbox
      {...label}
      checked={checked}  
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
