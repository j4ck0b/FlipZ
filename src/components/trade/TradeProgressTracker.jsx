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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Trade Progress</h3>
            {tradeOffer.escrow_mode && (
              <Badge variant="outline" className="mt-1">
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

        {/* Progress Line */}
        <div className="relative">
          {/* Line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: isFailed ? '0%' : `${(currentStepIndex / (steps.length - 1)) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-600"
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isComplete = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isUpcoming = index > currentStepIndex;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: isComplete ? 0.3 : 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      rounded-full flex items-center justify-center mb-2 z-10
                      ${isComplete ? 'w-7 h-7 bg-gradient-to-br from-violet-600 to-indigo-600 text-white' : ''}
                      ${isCurrent && !isFailed ? 'w-10 h-10 bg-white border-4 border-violet-600 text-violet-600' : ''}
                      ${isCurrent && isFailed ? 'w-10 h-10 bg-white border-4 border-red-600 text-red-600' : ''}
                      ${isUpcoming ? 'w-10 h-10 bg-slate-200 text-slate-400' : ''}
                    `}
                  >
                    <Icon className={`${isComplete ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  </motion.div>
                  <p className={`
                    text-xs font-medium text-center
                    ${isComplete ? 'text-slate-400 opacity-50' : ''}
                    ${isCurrent ? 'text-slate-900' : ''}
                    ${isUpcoming ? 'text-slate-400' : ''}
                  `}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hub Verification Status */}
        {tradeOffer.progress_step === 'hub_verification' && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Sender's Package</p>
              <Badge className={
                tradeOffer.hub_verification_sender === 'passed' ? 'bg-green-100 text-green-700' :
                tradeOffer.hub_verification_sender === 'failed' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }>
                {tradeOffer.hub_verification_sender || 'pending'}
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Owner's Package</p>
              <Badge className={
                tradeOffer.hub_verification_owner === 'passed' ? 'bg-green-100 text-green-700' :
                tradeOffer.hub_verification_owner === 'failed' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
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