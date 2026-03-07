"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wallet, HandCoins } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for Tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatsCardProps {
  title: string;
  amount: number;
  colorType?: "blue" | "green";
}

export function StatsCard({ title, amount, colorType = "blue" }: StatsCardProps) {
  // Format amount to Indian Rupees layout
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);

  // Resolve Icon internally based on the title string
  const Icon = title === "Digital Cash" ? Wallet : HandCoins;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer"
    >
      {/* Background aesthetic icon */}
      <Icon 
        className={cn(
          "absolute -right-6 -top-6 w-32 h-32 opacity-5 transition-transform group-hover:scale-110",
          colorType === "blue" ? "text-blue-500" : "text-green-500"
        )} 
      />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Icon className={cn("w-5 h-5", colorType === "blue" ? "text-blue-500" : "text-green-500")} />
          <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest">
            {title}
          </p>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold font-heading tracking-tight text-gray-900">
          {formattedAmount}
        </h2>
      </div>
    </motion.div>
  );
}