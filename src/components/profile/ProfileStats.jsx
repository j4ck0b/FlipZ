import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Package, CheckCircle2, ArrowRightLeft, TrendingUp } from "lucide-react";

export default function ProfileStats({ stats }) {
  const items = [
    { 
      label: 'Active Listings', 
      value: stats.activeListings || 0, 
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      label: 'Completed Sales', 
      value: stats.completedSales || 0, 
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      label: 'Trades Made', 
      value: stats.tradesMade || 0, 
      icon: ArrowRightLeft,
      color: 'text-violet-600',
      bgColor: 'bg-violet-100'
    },
    { 
      label: 'Total Value', 
      value: `$${stats.totalValue || 0}`, 
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                  <p className="text-xs text-slate-500">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}