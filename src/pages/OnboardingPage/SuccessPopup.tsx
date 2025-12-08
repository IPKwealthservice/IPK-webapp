export default function SuccessPopup({ open }: { open: boolean }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white px-10 py-6 rounded-lg shadow-xl text-center">
        <div className="text-green-600 text-4xl mb-2">✔</div>
        <div className="text-lg font-semibold">Profile Submitted Successfully!</div>
      </div>
    </div>
  );
}
