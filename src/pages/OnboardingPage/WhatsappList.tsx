interface Props {
  list: string[];
  setList: (list: string[]) => void;
  form: any;
  update: (field: string, val: any) => void;
}

export default function WhatsappList({ list, setList, form, update }: Props) {
  const add = () => setList([...list, ""]);
  const remove = (i: number) => setList(list.filter((_, idx) => idx !== i));

  const updateWA = (i: number, v: string) => {
    const newList = [...list];
    newList[i] = v;
    setList(newList);
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <InputField
          label="Mobile No."
          value={form.mobile}
          onChange={(val) => {
            update("mobile", val);
          }}
        />
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700">WhatsApp Numbers</label>

        {list.map((num, i) => (
          <div key={i} className="flex items-center gap-3 mt-2">
            <input
              value={num}
              placeholder="WhatsApp number"
              onChange={(e) => updateWA(i, e.target.value)}
              className="border rounded-md px-3 py-2 text-sm w-72"
            />

            {i === 0 && (
              <label className="flex items-center text-sm gap-2">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    updateWA(0, e.target.checked ? form.mobile : "")
                  }
                />
                Same as Mobile
              </label>
            )}

            {i > 0 && (
              <button onClick={() => remove(i)} className="text-red-500 text-xs">
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          onClick={add}
          className="mt-2 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md"
        >
          + Add WhatsApp Number
        </button>
      </div>
    </div>
  );
}
