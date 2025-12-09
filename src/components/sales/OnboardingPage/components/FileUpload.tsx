import React, { useRef, useState } from "react";

export default function FileUpload() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState("");

  const chooseImage = () => fileRef.current?.click();

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => setPreview("");

  return (
    <div className="flex flex-col items-center mb-8">
      <div className="relative">
        <img
          src={preview || "https://via.placeholder.com/120"}
          className="w-32 h-32 rounded-full border-4 border-indigo-600 object-cover"
        />

        <button
          onClick={chooseImage}
          className="absolute bottom-2 right-2 bg-indigo-600 text-white px-2 py-1 rounded-md text-xs"
        >
          Edit
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      <div className="flex gap-3 mt-3">
        <button className="bg-indigo-600 text-white px-3 py-1 rounded text-xs">
          Save
        </button>

        <button
          onClick={removeImage}
          className="bg-gray-300 text-black px-3 py-1 rounded text-xs"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
