interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  readOnly?: boolean;
}

export default function InputField({ label, value, onChange, type = "text", readOnly }: Props) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md px-3 py-2 w-full text-sm focus:ring focus:ring-indigo-200"
      />
    </div>
  );
}
