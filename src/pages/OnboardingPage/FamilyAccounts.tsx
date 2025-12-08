interface Props {
  accounts: string[];
  setAccounts: (data: string[]) => void;
}

export default function FamilyAccounts({ accounts, setAccounts }: Props) {
  const update = (i: number, v: string) => {
    const list = [...accounts];
    list[i] = v;
    setAccounts(list);
  };

  const remove = (i: number) => {
    setAccounts(accounts.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">Family Accounts</label>

      {accounts.map((acc, i) => (
        <div key={i} className="flex items-center gap-3 mt-2">
          <input
            value={acc}
            onChange={(e) => update(i, e.target.value)}
            placeholder="Family A/C Number"
            className="border rounded-md px-3 py-2 text-sm w-72"
          />

          {i > 0 && (
            <button onClick={() => remove(i)} className="text-red-500 text-xs">
              Remove
            </button>
          )}
        </div>
      ))}

      <button
        onClick={() => setAccounts([...accounts, ""])}
        className="mt-2 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md"
      >
        + Add Family Account
      </button>
    </div>
  );
}
