"use client";

import React, { useState, useRef, useEffect } from "react";
import { Hash, CircleDot, Calendar, Tag, ArrowUpRight, X, ChevronDown, Plus } from "lucide-react";

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  existingCategories: string[];
}

export function NewEntryModal({ isOpen, onClose, onSave, existingCategories }: NewEntryModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"Expense" | "Income">("Expense");
  const [rel, setRel] = useState<"Digital Cash" | "Hand Cash">("Digital Cash");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  const categoryRef = useRef<HTMLDivElement>(null);

  // Close category dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!amount || !category) return; 

    setIsSubmitting(true);
    
    await onSave({
      name: name || "Untitled",
      amount: Number(amount),
      category,
      date,
      type,
      rel,
    });

    setIsSubmitting(false);
    setName("");
    setAmount("");
    setCategory("");
    onClose();
  };

  // Filter categories based on what the user types
  const filteredCategories = existingCategories.filter(c => 
    c.toLowerCase().includes(category.toLowerCase())
  );

  const exactMatchExists = existingCategories.some(c => c.toLowerCase() === category.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 transition-opacity font-body">
      <div className="bg-white rounded-[24px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header / Title Section */}
        <div className="p-8 pb-4 relative">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <input
            type="text"
            placeholder="Transaction Name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-4xl font-bold font-heading text-gray-900 placeholder-gray-300 bg-transparent border-none focus:outline-none mb-2"
          />
        </div>

        {/* Stacked Properties Section */}
        <div className="px-8 py-4 space-y-5">
          
          {/* Amount (Removed Slider Arrows via CSS) */}
          <div className="flex items-center">
            <div className="w-36 flex items-center gap-2 text-gray-400 text-sm font-medium">
              <Hash size={16} /> Amount
            </div>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none placeholder-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoFocus
            />
          </div>

          {/* Smart Category Autocomplete */}
          <div className="flex items-start pt-1" ref={categoryRef}>
            <div className="w-36 flex items-center gap-2 text-gray-400 text-sm font-medium mt-1">
              <CircleDot size={16} /> Category
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Select or type..."
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setIsCategoryDropdownOpen(true);
                }}
                onFocus={() => setIsCategoryDropdownOpen(true)}
                className="w-full text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none placeholder-gray-300"
              />
              
              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1">
                  
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}

                  {/* Option to create a new category if it doesn't exist perfectly yet */}
                  {category && !exactMatchExists && (
                    <button
                      onClick={() => setIsCategoryDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm text-[#0092FF] hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <Plus size={14} /> Create "{category}"
                    </button>
                  )}

                  {filteredCategories.length === 0 && !category && (
                    <div className="px-4 py-2 text-sm text-gray-400 italic">No categories yet</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center">
            <div className="w-36 flex items-center gap-2 text-gray-400 text-sm font-medium">
              <Calendar size={16} /> Date
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer"
            />
          </div>

          {/* Type */}
          <div className="flex items-center">
            <div className="w-36 flex items-center gap-2 text-gray-400 text-sm font-medium">
              <Tag size={16} /> Type
            </div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "Expense" | "Income")}
              className="flex-1 text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer outline-none ring-0 appearance-none bg-no-repeat bg-right pr-6"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>

          {/* Account (Formerly 'rel') */}
          <div className="flex items-center">
            <div className="w-36 flex items-center gap-2 text-gray-400 text-sm font-medium">
              <ArrowUpRight size={16} /> Account
            </div>
            <select
              value={rel}
              onChange={(e) => setRel(e.target.value as "Digital Cash" | "Hand Cash")}
              className="flex-1 text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer outline-none ring-0 appearance-none bg-no-repeat bg-right pr-6"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
            >
              <option value="Digital Cash">Digital Cash</option>
              <option value="Hand Cash">Hand Cash</option>
            </select>
          </div>
          
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !amount || !category}
            className="px-5 py-2.5 text-sm font-bold text-white bg-[#0092FF] hover:bg-[#007acc] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
          >
            {isSubmitting ? "Saving..." : "Save Entry"}
          </button>
        </div>
        
      </div>
    </div>
  );
}