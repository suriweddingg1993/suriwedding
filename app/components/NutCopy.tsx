"use client";
import { useState } from "react";

export default function NutCopy({ textCanCopy }: { textCanCopy: string }) {
  const [daCopy, setDaCopy] = useState(false);

  const xuLyCopy = () => {
    if (!textCanCopy) return;
    
    // Lệnh copy vào bộ nhớ của thiết bị
    navigator.clipboard.writeText(textCanCopy);
    
    // Hiện chữ "Đã copy"
    setDaCopy(true);
    
    // Sau 2 giây tự động quay về trạng thái ban đầu
    setTimeout(() => {
      setDaCopy(false);
    }, 2000);
  };

  return (
    <button
      onClick={xuLyCopy}
      title="Copy"
      className={`ml-2 text-xs px-2 py-1 rounded transition-colors ${
        daCopy 
          ? "bg-green-100 text-green-700 border border-green-300 font-bold" 
          : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
      }`}
    >
      {daCopy ? "✓ Đã copy" : "📋 Copy"}
    </button>
  );
}