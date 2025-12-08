interface Props {
  open: boolean;
  data: any;
  onClose: () => void;
  onSubmit: () => void;
}

export default function PreviewModal({ open, data, onClose, onSubmit }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[700px] rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-indigo-700">Profile Preview</h2>

        <pre className="text-xs bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={onSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
