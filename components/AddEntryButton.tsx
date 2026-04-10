"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { NewEntryModal } from "./NewEntryModal";
import { useRouter } from "next/navigation";

interface AddEntryButtonProps {
  onSaveAction: (data: any) => Promise<void>;
  existingCategories: string[];
  accounts: string[]; // Added accounts array here
}

export function AddEntryButton({ onSaveAction, existingCategories, accounts }: AddEntryButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSave = async (data: any) => {
    // 1. Close modal immediately so the UI feels responsive
    setIsModalOpen(false); 
    
    // 2. Perform the save action
    await onSaveAction(data);
    
    // 3. Refresh the data. 
    router.refresh(); 
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-center gap-2 w-full max-w-[250px] md:w-auto bg-[#007AFF] text-white px-6 py-3.5 md:py-2.5 rounded-full font-bold font-body shadow-xl shadow-blue-200/50 transition-transform active:scale-95 hover:bg-[#0063CC]"
      >
        <Plus size={20} />
        <span className="text-base">New Entry</span>
      </button>

      <NewEntryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        existingCategories={existingCategories}
        accounts={accounts} // Passing the bank accounts to the modal
      />
    </>
  );
}