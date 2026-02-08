"use client";

import { Camera, Image as ImageIcon, X } from "lucide-react";
import React, { useState, useRef } from "react";

interface ImageUploadInputProps {
  name: string;
  label: string;
}

export function ImageUploadInput({ name, label }: ImageUploadInputProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 block">
        {label}
      </label>
      <div 
        className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed border-border transition-all overflow-hidden bg-muted/30 hover:bg-muted/50 ${
          preview ? "border-primary/50" : ""
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleChange}
        />
        
        {preview ? (
          <>
            <img 
              src={preview} 
              alt={label} 
              className="w-full h-full object-cover" 
            />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 z-20 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground pointer-events-none">
            <ImageIcon size={32} className="mb-2 text-primary/40" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-60">Selecionar</span>
          </div>
        )}
      </div>
    </div>
  );
}
