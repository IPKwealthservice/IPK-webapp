interface Props {
  label: string;
  value: string;
  otherValue?: string;
  onChange: (value: string) => void;
  onOtherChange?: (value: string) => void;
  options: string[];
}

export default function DropdownField({
  label,
  value,
  otherValue,
  options,
  onChange,
  onOtherChange,
}: Props) {
  const isOther = value === "Others";

  return (
    <div className="flex flex-col">
      <label className="text-sm mb-1 font-medium text-gray-700">{label}</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md px-3 py-2 text-sm focus:ring focus:ring-indigo-200"
      >
        <option value="">Select {label}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
        <option value="Others">Others</option>
      </select>

      {isOther && onOtherChange && (
        <input
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Enter custom value"
          className="mt-2 border rounded-md px-3 py-2 text-sm focus:ring focus:ring-indigo-200"
        />
      )}
    </div>
  );
}
