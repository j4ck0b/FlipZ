import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Circle, 
  Package, 
  CreditCard, 
  Truck, 
  Shield,
  Home,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { id: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'preparing_shipment', label: 'Preparing', icon: Package },
  { id: 'shipping_to_hub', label: 'To Hub', icon: Truck },
  { id: 'hub_verification', label: 'Inspection', icon: Shield },
  { id: 'shipping_to_users', label: 'Delivery', icon: Truck },
  { id: 'completed', label: 'Complete', icon: Home }
];

export default function TradeProgressTracker({ tradeOffer }) {
  const currentStepIndex = steps.findIndex(s => s.id === tradeOffer.progress_step);
  const isFailed = tradeOffer.status === 'failed';

  return (
    <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-100">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900">Trade Progress</h3>
            {tradeOffer.escrow_mode && (
              <Badge variant="outline" className="mt-1 bg-white/50">
                Escrow {tradeOffer.escrow_mode.charAt(0).toUpperCase() + tradeOffer.escrow_mode.slice(1)}
              </Badge>
            )}
          </div>
          {isFailed && (
            <Badge className="bg-red-100 text-red-700">
              <AlertCircle className="w-3 h-3 mr-1" />
              Failed
            </Badge>
          )}
        </div>

        {/* Desktop Progress Line */}
        <div className="hidden md:block relative pb-8">
          {/* Line */}
          <div className="absolute top-6 left-8 right-8 h-1 bg-white/60 rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: isFailed ? '0%' : `${(currentStepIndex / (steps.length - 1)) * 100}%` 
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-lg"
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between px-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isComplete = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isUpcoming = index > currentStepIndex;

              return (
                <div key={step.id} className="flex flex-col items-center gap-3">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: isComplete ? 0.85 : 1, 
                      opacity: isComplete ? 0.4 : 1 
                    }}
                    transition={{ delay: index * 0.08, duration: 0.3 }}
                    className={`
                      rounded-full flex items-center justify-center z-10 shadow-lg
                      ${isComplete ? 'w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 text-white' : ''}
                      ${isCurrent && !isFailed ? 'w-12 h-12 bg-white border-4 border-violet-600 text-violet-600 shadow-xl' : ''}
                      ${isCurrent && isFailed ? 'w-12 h-12 bg-white border-4 border-red-600 text-red-600 shadow-xl' : ''}
                      ${isUpcoming ? 'w-10 h-10 bg-white border-2 border-slate-300 text-slate-400' : ''}
                    `}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </motion.div>
                  <p className={`
                    text-xs font-semibold text-center whitespace-nowrap
                    ${isComplete ? 'text-slate-500 opacity-60' : ''}
                    ${isCurrent ? 'text-violet-700' : ''}
                    ${isUpcoming ? 'text-slate-400' : ''}
                  `}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Vertical Layout */}
        <div className="md:hidden space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isComplete = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isComplete ? 0.5 : 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  flex items-center gap-4 p-3 rounded-xl transition-all
                  ${isCurrent ? 'bg-white shadow-lg border-2 border-violet-600' : ''}
                  ${isComplete ? 'bg-white/40' : ''}
                  ${isUpcoming ? 'bg-white/60' : ''}
                `}
              >
                <div className={`
                  rounded-full flex items-center justify-center flex-shrink-0
                  ${isComplete ? 'w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md' : ''}
                  ${isCurrent && !isFailed ? 'w-12 h-12 bg-white border-4 border-violet-600 text-violet-600 shadow-lg' : ''}
                  ${isCurrent && isFailed ? 'w-12 h-12 bg-white border-4 border-red-600 text-red-600 shadow-lg' : ''}
                  ${isUpcoming ? 'w-10 h-10 bg-slate-200 text-slate-400' : ''}
                `}>
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`
                    text-sm font-semibold
                    ${isComplete ? 'text-slate-500' : ''}
                    ${isCurrent ? 'text-violet-700' : ''}
                    ${isUpcoming ? 'text-slate-500' : ''}
                  `}>
                    {step.label}
                  </p>
                </div>
                {isCurrent && (
                  <Badge className="bg-violet-600 text-white text-xs">
                    Current
                  </Badge>
                )}
                {isComplete && (
                  <CheckCircle2 className="w-4 h-4 text-violet-600" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Hub Verification Status */}
        {tradeOffer.progress_step === 'hub_verification' && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-white rounded-xl border-2 border-slate-100 shadow-sm">
              <p className="text-xs text-slate-500 mb-2 font-medium">Sender's Package</p>
              <Badge className={
                tradeOffer.hub_verification_sender === 'passed' ? 'bg-green-100 text-green-700 border-green-200' :
                tradeOffer.hub_verification_sender === 'failed' ? 'bg-red-100 text-red-700 border-red-200' :
                'bg-amber-100 text-amber-700 border-amber-200'
              }>
                {tradeOffer.hub_verification_sender || 'pending'}
              </Badge>
            </div>
            <div className="p-3 md:p-4 bg-white rounded-xl border-2 border-slate-100 shadow-sm">
              <p className="text-xs text-slate-500 mb-2 font-medium">Owner's Package</p>
              <Badge className={
                tradeOffer.hub_verification_owner === 'passed' ? 'bg-green-100 text-green-700 border-green-200' :
                tradeOffer.hub_verification_owner === 'failed' ? 'bg-red-100 text-red-700 border-red-200' :
                'bg-amber-100 text-amber-700 border-amber-200'
              }>
                {tradeOffer.hub_verification_owner || 'pending'}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}