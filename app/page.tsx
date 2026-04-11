import React from "react";
import { getDashboardData, addTransaction } from "../lib/notion";
import { StatsCard } from "../components/StatsCard";
import { ExpenseChart } from "../components/ExpenseChart";
import { AddEntryButton } from "../components/AddEntryButton";

// Optimize for Cloudflare Pages
export const runtime = 'edge';

// Changed to 10 seconds (ISR). The page loads instantly from cache, 
// and seamlessly updates in the background every 10 seconds.
export const revalidate = 10; 

export default async function SurfinanceDashboard() {
  const { transactions, accounts, masterCategories } = await getDashboardData();

  async function handleAddEntry(formData: any) {
    "use server";
    await addTransaction(formData);
  }

  const accountNames = accounts.map((acc: any) => acc.name);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] p-6 pb-32 md:p-10 font-body">
      {/* FIX: Changed max-w-5xl to max-w-[1440px] for a wider, premium dashboard view */}
      <div className="max-w-[1440px] mx-auto space-y-10">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading tracking-tight text-gray-900">Surfinance</h1>
            <p className="text-gray-400 text-sm mt-1 font-medium">My budget tracker</p>
          </div>
          <div className="fixed bottom-8 left-6 right-6 z-50 flex justify-center md:static md:bottom-auto md:left-auto md:right-auto md:z-auto">
            <AddEntryButton 
              onSaveAction={handleAddEntry} 
              existingCategories={masterCategories} 
              accounts={accountNames} 
            />
          </div>
        </header>
        
        {/* Your cards and charts will now also expand to the new width automatically */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc: any, index: number) => {
            const colors: ("blue" | "green")[] = ["blue", "green"];
            const colorType = colors[index % colors.length];
            return (
              <StatsCard 
                key={acc.id}
                title={acc.name} 
                amount={acc.balance} 
                colorType={colorType} 
              />
            );
          })}
        </div>

        <ExpenseChart transactions={transactions} />
      </div>
    </div>
  );
}