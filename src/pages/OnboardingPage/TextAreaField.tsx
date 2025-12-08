interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function TextAreaField({ label, value, onChange }: Props) {
  return (
    <div className="flex flex-col w-full">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md px-3 py-2 h-28 text-sm resize-none focus:ring focus:ring-indigo-200"
      />
    </div>
  );
}
