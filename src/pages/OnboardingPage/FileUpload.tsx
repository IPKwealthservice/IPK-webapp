import { useState } from "react";

export default function FileUpload() {
  const [photo, setPhoto] = useState<string | null>(null);

  return (
    <div className="flex justify-end w-full mb-6">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto">
          <img
            src={photo || "/placeholder-user.png"}
            className="w-full h-full rounded-full border-4 border-indigo-600 object-cover"
          />
          <label className="absolute bottom-2 right-2 bg-indigo-600 text-white p-1 rounded-full cursor-pointer">
            ✏️
            <input
              type="file"
              className="hidden"
              onChange={(e) =>
                setPhoto(URL.createObjectURL(e.target.files![0]))
              }
            />
          </label>
        </div>
      </div>
    </div>
  );
}
