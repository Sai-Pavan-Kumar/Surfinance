"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { NewEntryModal } from "./NewEntryModal";
import { useRouter } from "next/navigation";

interface AddEntryButtonProps {
  onSaveAction: (data: any) => Promise<void>;
  existingCategories: string[];
}

export function AddEntryButton({ onSaveAction, existingCategories }: AddEntryButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSave = async (data: any) => {
    // 1. Close modal immediately so the UI feels responsive
    setIsModalOpen(false); 
    
    // 2. Perform the save action
    await onSaveAction(data);
    
    // 3. Refresh the data. 
    // router.refresh() is soft, so we use it first, then wait a beat.
    router.refresh(); 
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        // FIX: Made the button wider on mobile, perfectly centered, thicker, and rounded like a pill
        className="flex items-center justify-center gap-2 w-full max-w-[250px] md:w-auto bg-[#007AFF] text-white px-6 py-3.5 md:py-2.5 rounded-full font-bold font-body shadow-xl shadow-blue-200/50 transition-transform active:scale-95 hover:bg-[#0063CC]"
      >
        <Plus size={20} />
        {/* FIX: Removed 'hidden sm:inline' so the text always shows on mobile */}
        <span className="text-base">New Entry</span>
      </button>

      <NewEntryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        existingCategories={existingCategories}
      />
    </>
  );
}