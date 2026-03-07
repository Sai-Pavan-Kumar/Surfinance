"use client";

import React, { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Filter, Calendar, X, ChevronDown } from "lucide-react";

interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: string;
  rel: string;
  date: string;
}

interface ExpenseChartProps {
  transactions: Transaction[];
}

type TimeFilterOption = "This Week" | "This Month" | "This Year" | "All Time" | "Custom";

export function ExpenseChart({ transactions }: ExpenseChartProps) {
  const [filterType, setFilterType] = useState<"Expense" | "Income" | "All">("Expense");
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>("This Month");
  
  // Dropdown states
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // Custom Date States
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Helper to format the button display text cleanly
  const getDisplayTime = () => {
    if (timeFilter === "Custom" && customStart && customEnd) {
      // Format to short date like "Mar 4 - Mar 10"
      const start = new Date(customStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = new Date(customEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${start} - ${end}`;
    }
    return timeFilter;
  };

  // 1. Base filtered transactions (by Time and Type)
  const baseFilteredTransactions = useMemo(() => {
    const now = new Date();

    return transactions.filter(t => {
      // Type Check
      if (filterType !== "All" && t.type !== filterType) return false;

      // Time Check
      if (timeFilter === "All Time") return true;

      const tDate = new Date(t.date);
      
      if (timeFilter === "This Month") {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      }

      if (timeFilter === "This Year") {
        return tDate.getFullYear() === now.getFullYear();
      }
      
      if (timeFilter === "This Week") {
        const pastWeek = new Date();
        pastWeek.setDate(now.getDate() - 7);
        return tDate >= pastWeek;
      }

      if (timeFilter === "Custom" && customStart && customEnd) {
        const startDate = new Date(customStart);
        const endDate = new Date(customEnd);
        endDate.setHours(23, 59, 59, 999);
        return tDate >= startDate && tDate <= endDate;
      }

      return true;
    });
  }, [transactions, filterType, timeFilter, customStart, customEnd]);

  // 2. Group for the Chart
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    baseFilteredTransactions.forEach(t => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });

    return Object.keys(grouped)
      .map(key => ({
        category: key,
        amount: grouped[key],
      }))
      .filter(item => item.amount !== 0) 
      .sort((a, b) => b.amount - a.amount);
  }, [baseFilteredTransactions]);

  // 3. Specific transactions for the clicked category
  const selectedCategoryTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    
    return baseFilteredTransactions
      .filter(t => t.category === selectedCategory)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); 
  }, [baseFilteredTransactions, selectedCategory]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xl z-50">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">{label}</p>
          <p className="text-xl font-bold text-[#0092FF]">₹{payload[0].value.toFixed(2)}</p>
          <p className="text-gray-400 text-[10px] mt-1">Click to view transactions</p>
        </div>
      );
    }
    return null;
  };

  const handleChartClick = (data: any) => {
    if (data && data.activeLabel) {
      setSelectedCategory(data.activeLabel);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm mt-8 transition-all duration-300 relative">
      
      {/* Invisible backdrop to close dropdowns when clicking outside */}
      {(isTimeDropdownOpen || isTypeDropdownOpen) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => { setIsTimeDropdownOpen(false); setIsTypeDropdownOpen(false); }}
        />
      )}

      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h3 className="text-xl font-bold font-heading text-gray-900">Expense Trend</h3>
        
        <div className="flex items-center gap-3 relative z-20">
          
          {/* Mobile-Friendly Time Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => { setIsTimeDropdownOpen(!isTimeDropdownOpen); setIsTypeDropdownOpen(false); }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors"
            >
              <Calendar className="w-4 h-4 text-gray-500" />
              {getDisplayTime()}
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTimeDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isTimeDropdownOpen && (
              <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-[280px] bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 p-3">
                
                {/* Quick Filters Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {(["This Week", "This Month", "This Year", "All Time"] as const).map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setTimeFilter(time);
                        setSelectedCategory(null);
                        setIsTimeDropdownOpen(false);
                      }}
                      className={`px-3 py-2 text-xs rounded-xl transition-colors text-center ${
                        timeFilter === time ? "font-bold text-[#0092FF] bg-blue-50 border border-blue-100" : "font-medium text-gray-600 bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Custom Range</p>
                  <div className="flex gap-2">
                    <input 
                      type="date" 
                      value={customStart}
                      onChange={(e) => {
                        setCustomStart(e.target.value);
                        if (customEnd) setTimeFilter("Custom");
                      }}
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:border-[#0092FF]"
                    />
                    <span className="text-gray-400 flex items-center">-</span>
                    <input 
                      type="date" 
                      value={customEnd}
                      onChange={(e) => {
                        setCustomEnd(e.target.value);
                        if (customStart) setTimeFilter("Custom");
                      }}
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:border-[#0092FF]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Type Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => { setIsTypeDropdownOpen(!isTypeDropdownOpen); setIsTimeDropdownOpen(false); }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4 text-gray-500" />
              {filterType}
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTypeDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isTypeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 p-1">
                {(["Expense", "Income", "All"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilterType(type);
                      setSelectedCategory(null);
                      setIsTypeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-colors ${
                      filterType === type ? "font-bold text-[#0092FF] bg-blue-50" : "font-medium text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Recharts Area */}
      <div className="h-[350px] w-full cursor-pointer mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ top: 10, right: 10, left: -20, bottom: 50 }} 
            onClick={handleChartClick} 
          >
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0092FF" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#0092FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis 
              dataKey="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              angle={-45} 
              textAnchor="end" 
              interval={0} 
              height={60}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 2, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#0092FF" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorAmount)" 
              activeDot={{ r: 6, fill: '#0092FF', stroke: '#FFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Selected Category Transactions List */}
      {selectedCategory && (
        <div className="mt-8 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0092FF]"></span>
              {selectedCategory} Transactions
            </h4>
            <button 
              onClick={() => setSelectedCategory(null)}
              className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {selectedCategoryTransactions.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs font-medium text-gray-500">{t.date}</p>
                    <span className="text-gray-300">•</span>
                    <p className="text-xs font-medium text-gray-500">{t.rel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${t.type === 'Income' ? 'text-green-600' : 'text-gray-900'}`}>
                    {t.type === 'Income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}