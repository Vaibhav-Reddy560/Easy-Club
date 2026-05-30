import React, { useState, useEffect } from 'react';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  allowNegative?: boolean;
}

export default function NumberInput({ value, onChange, allowNegative = true, className, ...props }: NumberInputProps) {
  const [localVal, setLocalVal] = useState(value.toString());

  useEffect(() => {
    // Only update local value if it's materially different to prevent overwriting user mid-typing (e.g. "-")
    const parsedLocal = parseFloat(localVal);
    if (isNaN(parsedLocal) || parsedLocal !== value) {
      if (localVal !== "-" && localVal !== "" && localVal !== "-0" && localVal !== "0." && !localVal.endsWith(".")) {
        setLocalVal(value.toString());
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    if (!allowNegative) {
      val = val.replace('-', '');
    }

    setLocalVal(val);

    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const parsed = parseFloat(localVal);
    if (isNaN(parsed)) {
      setLocalVal(value.toString());
    } else {
      setLocalVal(parsed.toString()); // Clean up things like "0."
    }
    props.onBlur?.(e);
  };

  return (
    <input
      type="text"
      value={localVal}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      {...props}
    />
  );
}
