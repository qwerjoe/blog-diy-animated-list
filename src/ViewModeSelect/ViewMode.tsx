const kViewModes = ["diy", "motion", "side-by-side"] as const;
export type ViewMode = (typeof kViewModes)[number];

export type ViewModeSelectProps = {
  value?: ViewMode;
  onChange?: (mode: ViewMode) => void;
};

export function ViewModeSelect({
  value = "diy",
  onChange,
}: ViewModeSelectProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = event.target.value as ViewMode;
    if (onChange) {
      onChange(newMode);
    }
  };

  return (
    <select className="app--select" onChange={handleChange} value={value}>
      {kViewModes.map((mode) => (
        <option key={mode} value={mode}>
          {mode}
        </option>
      ))}
    </select>
  );
}
