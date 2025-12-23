export default function FamilyAccounts({ accounts, add, update, remove }: any) {
  return (
    <div className="mobile-padding tablet-padding desktop-padding">
    <div>
      <label className="text-gray-700 font-medium">Family Accounts</label>

      {accounts.map((acc: string, i: number) => (
        <div key={i} className="flex gap-3 mt-2">
          <input
            value={acc}
            onChange={(e) => update(i, e.target.value)}
            className="border p-2 rounded-md flex-1"
          />
          {i !== 0 && (
            <button
              className="px-3 py-2 bg-red-500 text-white rounded-md"
              onClick={() => remove(i)}
            >
              Remove
            </button>
          )}
        </div>
      ))}

      <button
        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md"
        onClick={add}
      >
        + Add Account
      </button>
    </div>
    </div>
  );
}
