import React, { useRef, useState } from "react";
import { Pencil, User } from "lucide-react";

export default function FileUpload() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>("");

  const chooseImage = () => {
    fileRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setPreview("");
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  return (
        <div className="mobile-padding tablet-padding desktop-padding">
    <div className="flex flex-col items-center mb-8">
      {/* PHOTO CIRCLE */}
      <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-indigo-600 bg-gray-100">
        {/* DEFAULT PERSON ICON */}
        {!preview && (
          <User
            size={48}
            className="text-gray-400"
          />
        )}

        {/* IMAGE PREVIEW */}
        {preview && (
          <img
            src={preview}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
        )}

        {/* PENCIL ICON OVERLAY */}
        <button
          type="button"
          onClick={chooseImage}
          className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full shadow-md hover:bg-indigo-700"
          aria-label="Edit photo"
        >
          <Pencil size={14} />
        </button>
      </div>

      {/* HIDDEN FILE INPUT */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 mt-3">
        <button
          type="button"
          className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700"
        >
          Save
        </button>

        <button
          type="button"
          onClick={removeImage}
          className="bg-gray-300 text-black px-3 py-1 rounded text-xs hover:bg-gray-400"
        >
          Remove
        </button>
      </div>
    </div>
    </div>
  );
}