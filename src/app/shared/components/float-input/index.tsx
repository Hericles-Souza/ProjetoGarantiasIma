// FloatInput.tsx
import React, { useState } from "react";
import styles from "./float-input.module.css";

interface FloatInputProps {
  value?: number;
  placeholder?: string;
  onChange?: (value: number | undefined) => void;
}

const FloatInput: React.FC<FloatInputProps> = ({ value, placeholder, onChange }) => {
  const [inputValue, setInputValue] = useState<string>(value?.toString() || "");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    if (/^\d*\.?\d*$/.test(input)) {
      setInputValue(input);
      onChange?.(input ? parseFloat(input) : undefined);
    }
  };

  return (
    <div className={styles.floatInput}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={styles.input}
      />
    </div>
  );
};

export default FloatInput;
