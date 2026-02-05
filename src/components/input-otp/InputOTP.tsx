"use client";
import * as React from "react";

interface InputOTPProps {
  length?: number;                   
  onChange?: (value: string) => void;
}

export const InputOTP: React.FC<InputOTPProps> = ({ length = 6, onChange }) => {
  const [values, setValues] = React.useState(Array(length).fill(""));

  const handleChange = (idx: number, val: string) => {
    const newValues = [...values];
    newValues[idx] = val.slice(-1); // only last character
    setValues(newValues);
    onChange?.(newValues.join(""));
    if (val && idx < length - 1) {
      const next = document.getElementById(`otp-${idx + 1}`);
      next?.focus();
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      {values.map((v, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          value={v}
          onChange={(e) => handleChange(i, e.target.value)}
          maxLength={1}
          style={{ width: "2rem", textAlign: "center" }}
        />
      ))}
    </div>
  );
};
