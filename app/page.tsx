import React from "react";
import { getDashboardData, addTransaction } from "../lib/notion";
import { StatsCard } from "../components/StatsCard";
import { ExpenseChart } from "../components/ExpenseChart";
import { AddEntryButton } from "../components/AddEntryButton";

// Optimize for Cloudflare Pages
export const runtime = 'edge';
// Ensure fresh data on every request (no stale caching for finances)
export const revalidate = 0; 

export default async function SurfinanceDashboard() {
  // Fetching data securely on the server side
  const { transactions, digitalBalance, handBalance } = await getDashboardData();

  // Next.js Server Action: This runs securely on the server when the modal saves
  async function handleAddEntry(formData: any) {
    "use server";
    await addTransaction(formData);
  }

  // Extract all unique categories from past transactions to pass to the modal
  const existingCategories = Array.from(new Set(transactions.map((t) => t.category))).filter(Boolean);

  return (
    // FIX 1: Added pb-32 (padding-bottom) on mobile so you can scroll past the floating button without it blocking your content
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] p-6 pb-32 md:p-10 font-body">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading tracking-tight text-gray-900">
              Surfinance
            </h1>
            <p className="text-gray-400 text-sm mt-1 font-medium">
              Your budget, buttery smooth.
            </p>
          </div>
          
          {/* FIX 2: Changed to span the bottom width on mobile (left-6 right-6) and flex justify-center to hold a wide Apple-style button */}
          <div className="fixed bottom-8 left-6 right-6 z-50 flex justify-center md:static md:bottom-auto md:left-auto md:right-auto md:z-auto">
            <AddEntryButton onSaveAction={handleAddEntry} existingCategories={existingCategories} />
          </div>
        </header>

        {/* Balance Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsCard 
            title="Digital Cash" 
            amount={digitalBalance} 
            colorType="blue" 
          />
          <StatsCard 
            title="Hand Cash" 
            amount={handBalance} 
            colorType="green" 
          />
        </div>

        {/* The Notion-Style Chart */}
        <ExpenseChart transactions={transactions} />

      </div>
    </div>
  );
}