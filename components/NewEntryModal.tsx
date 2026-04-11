"use client";

import React, { useState, useRef, useEffect } from "react";
import { Hash, CircleDot, Calendar, Tag, ArrowUpRight, X, Plus } from "lucide-react";

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  existingCategories: string[];
  accounts: string[]; // FIX: Added accounts array here
}

const getNotionColor = (text: string) => {
  const colors = [
    "bg-gray-100 text-gray-700",
    "bg-red-100 text-red-700",
    "bg-orange-100 text-orange-700",
    "bg-amber-100 text-amber-700",
    "bg-green-100 text-green-700",
    "bg-blue-100 text-blue-700",
    "bg-indigo-100 text-indigo-700",
    "bg-purple-100 text-purple-700",
    "bg-pink-100 text-pink-700",
  ];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function NewEntryModal({ isOpen, onClose, onSave, existingCategories, accounts }: NewEntryModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<string>("Expense"); // FIX: Made dynamic
  
  // FIX: Default to the first account in your Notion list
  const [rel, setRel] = useState<string>(accounts.length > 0 ? accounts[0] : ""); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false); 
  
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update default account if accounts list loads late
  useEffect(() => {
    if (accounts.length > 0 && !rel) {
      setRel(accounts[0]);
    }
  }, [accounts, rel]);

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
      rel, // This will now send "Kotak Bank" or "Canara Bank" etc.
    });

    setIsSubmitting(false);
    setName("");
    setAmount("");
    setCategory("");
    onClose();
  };

  const filteredCategories = existingCategories
    .filter(c => c.toLowerCase().includes(category.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  const exactMatchExists = existingCategories.some(c => c.toLowerCase() === category.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 transition-opacity font-body">
      <div className="bg-white rounded-[24px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-8 pb-4 relative">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>
          
          <input
            type="text"
            placeholder="Transaction Name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-2xl sm:text-4xl font-bold font-heading text-gray-900 placeholder-gray-300 bg-transparent border-none focus:outline-none mb-2 pr-10"
          />
        </div>

        <div className="px-8 py-4 space-y-5">
          
          <div className="flex items-center">
            <div className="w-28 sm:w-36 shrink-0 flex items-center gap-2 text-gray-400 text-sm font-medium">
              <Hash size={16} /> Amount
            </div>
            <input
              type={isAmountFocused ? "number" : "text"}
              placeholder="₹0.00"
              value={isAmountFocused ? amount : (amount ? `₹${Number(amount).toFixed(1)}/-` : "")}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={() => setIsAmountFocused(true)}
              onBlur={() => setIsAmountFocused(false)}
              className="flex-1 text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none placeholder-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoFocus
            />
          </div>

          <div className="flex items-center pt-1" ref={categoryRef}>
            <div className="w-28 sm:w-36 shrink-0 flex items-center gap-2 text-gray-400 text-sm font-medium">
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
                className="w-full text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none placeholder-gray-300 font-body"
              />
              
              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 max-h-56 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-2 space-y-1">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <span className={`text-xs font-medium px-2 py-1 rounded-md ${getNotionColor(cat)} font-body`}>
                        {cat}
                      </span>
                    </button>
                  ))}
                  {category && !exactMatchExists && (
                    <button
                      onClick={() => setIsCategoryDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 text-sm font-medium text-[#0092FF] hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 font-body"
                    >
                      <Plus size={14} /> Create "{category}"
                    </button>
                  )}
                  {filteredCategories.length === 0 && !category && (
                    <div className="px-3 py-2 text-sm text-gray-400 italic font-body">No categories yet</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-28 sm:w-36 shrink-0 flex items-center gap-2 text-gray-400 text-sm font-medium">
              <Calendar size={16} /> Date
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker();
                } catch (err) {}
              }}
              className="flex-1 text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer w-full"
            />
          </div>

          <div className="flex items-center">
            <div className="w-28 sm:w-36 shrink-0 flex items-center gap-2 text-gray-400 text-sm font-medium">
              <Tag size={16} /> Type
            </div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex-1 text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer outline-none ring-0 appearance-none bg-no-repeat bg-right pr-6"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>

          {/* FIX: Dynamic Accounts Dropdown mapped to Notion */}
          <div className="flex items-center">
            <div className="w-28 sm:w-36 shrink-0 flex items-center gap-2 text-gray-400 text-sm font-medium">
              <ArrowUpRight size={16} /> Account
            </div>
            <select
  value={rel}
  onChange={(e) => setRel(e.target.value)}
  className="flex-1 text-sm font-body font-semibold text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer outline-none ring-0 appearance-none bg-no-repeat bg-right pr-6"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
            >
              {accounts.map((accName) => (
                <option key={accName} value={accName}>{accName}</option>
              ))}
            </select>
          </div>
          
        </div>

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