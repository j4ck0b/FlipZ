import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, Package, Eye } from "lucide-react";
import { motion } from "framer-motion";

const escrowModes = [
  {
    id: 'eco',
    name: 'Escrow Eco',
    price: '24 PLN',
    icon: Package,
    color: 'from-green-500 to-emerald-600',
    features: [
      'Package presence verification',
      'Basic item count check',
      'Photo documentation',
      'Standard return if issues'
    ],
    description: 'Hub confirms items are physically present in packages'
  },
  {
    id: 'light',
    name: 'Escrow Light',
    price: '39 PLN',
    icon: Eye,
    color: 'from-blue-500 to-cyan-600',
    features: [
      'Item presence verification',
      'Description match check',
      'Completeness verification',
      'Full photo documentation',
      'Priority return handling'
    ],
    description: 'Hub verifies items match descriptions and are complete'
  },
  {
    id: 'full',
    name: 'Escrow Full',
    price: '59 PLN',
    icon: Shield,
    color: 'from-violet-500 to-purple-600',
    features: [
      'Complete authenticity check',
      'Condition grading',
      'Financial escrow protection',
      'Comprehensive photos',
      'Full refund guarantee',
      'Priority handling'
    ],
    description: 'Full verification with financial protection and authenticity checks'
  }
];

export default function EscrowModeSelector({ open, onClose, tradeOffer, onSelect }) {
  const [selected, setSelected] = useState('light');

  const handleConfirm = () => {
    onSelect(selected);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl">Select Escrow Protection Level</DialogTitle>
          <p className="text-slate-600 mt-2">
            Choose the verification level for your trade. Both packages will go through Flipz hub for inspection.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {escrowModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selected === mode.id;
            
            return (
              <motion.div
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  onClick={() => setSelected(mode.id)}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-2 border-violet-600 shadow-lg' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{mode.name}</h3>
                    <Badge variant="outline" className="mb-3">{mode.price}</Badge>
                    
                    <p className="text-sm text-slate-600 mb-4">{mode.description}</p>
                    
                    <ul className="space-y-2">
                      {mode.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 p-2 bg-violet-50 rounded-lg text-center"
                      >
                        <p className="text-sm font-medium text-violet-700">Selected</p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="flex-1 bg-violet-600 hover:bg-violet-700">
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}