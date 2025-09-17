import * as React from "react";

type Props = {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

export default function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 9999,
  className = "",
}: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div
      className={
        "inline-flex items-stretch rounded-2xl bg-white border border-black/10 overflow-hidden shadow-sm " +
        className
      }
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className="px-5 text-2xl font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        –
      </button>

      {/* Value (read-only visual). Keep an input for accessibility if you want */}
      <div className="w-16 grid place-items-center text-xl font-bold select-none">
        {value}
      </div>

      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className="px-5 text-2xl font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-40"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
