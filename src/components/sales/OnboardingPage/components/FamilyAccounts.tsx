export default function FamilyAccounts({
  accounts,
  add,
  update,
  remove,
}: any) {
  return (
    // 🔑 Single full-width, grid-safe wrapper
    <div className="w-full space-y-3">

      <label className="text-gray-700 font-medium">
        Family Accounts
      </label>

      {accounts.map((acc: string, i: number) => (
        <div key={i} className="flex gap-3">
          <input
            value={acc}
            onChange={(e) => update(i, e.target.value)}
            className="h-10 flex-1 rounded-md border border-gray-300 px-3 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {i !== 0 && (
            <button
              type="button"
              className="h-10 rounded-md bg-red-500 px-3 text-sm text-white"
              onClick={() => remove(i)}
            >
              Remove
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        className="mt-2 h-10 w-fit rounded-md bg-indigo-600 px-4 text-sm text-white"
        onClick={add}
      >
        + Add Account
      </button>
    </div>
  );
}
