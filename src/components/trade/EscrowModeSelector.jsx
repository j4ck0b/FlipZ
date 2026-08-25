import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";

export const escrowModes = [
  {
    id: 'standard_escrow',
    name: 'Standard Escrow',
    tag: 'PROTOCOL_01',
    price: '45 zł / stronę',
    turnaround: '24–48h Hub Time',
    features: [
      'Komplet etykiet InPost (Paczkomat → Hub → Paczkomat)',
      'Spektroskopia UV 365 nm (retusz/inking)',
      'Pomiar wagi analitycznej (tolerancja ±0.001 g)',
      'Dokumentacja fotograficzna makro 4K'
    ]
  },
  {
    id: 'swiss_safe',
    name: 'Swiss Safe',
    tag: 'PROTOCOL_02',
    price: '69 zł / stronę',
    turnaround: '<24h Priority Hub Time',
    recommended: true,
    features: [
      'Wszystko ze Standard Escrow',
      'Cyfrowy pomiar grubości mikrometrem (±0.001 mm)',
      'Semi-rigid sleeve + plomba destrukcyjna VOID',
      'Cyfrowy Certyfikat Weryfikacji SHA-256 PDF'
    ]
  },
  {
    id: 'vault_black',
    name: 'Vault Black',
    tag: 'PROTOCOL_03',
    price: '99 zł / stronę',
    turnaround: '<12h Express Hub Time',
    features: [
      'Wszystko ze Swiss Safe',
      'Ciągłe nagranie wideo 4K z unboxingu i inspekcji',
      'Smart-Box z tagiem NFC smartfona',
      'Ubezpieczenie All-Risks do 100% wartości'
    ]
  }
];

export default function EscrowModeSelector({ open, onClose, tradeOffer, onSelect }) {
  const [selected, setSelected] = useState(tradeOffer?.escrow_tier || tradeOffer?.escrow_mode || 'swiss_safe');

  const handleConfirm = () => {
    onSelect(selected);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[#090A0C] text-[#F8FAFC] border border-[#1F242D] p-6 sm:p-8 rounded-lg shadow-2xl">
        <DialogHeader className="border-b border-[#1F242D] pb-3 text-left">
          <div className="flex items-center justify-between font-mono-code text-xs text-[#10B981] mb-1">
            <span>SWISS_SAFE_ESCROW_SELECTOR</span>
            <span>CENTRAL_LAB_PROTOCOL</span>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
            Wybór Protokołu Badania Escrow
          </DialogTitle>
          <DialogDescription className="text-xs text-[#94A3B8] font-mono-code">
            Fizyczna weryfikacja laboratoryjna NDT. Obie przesyłki przechodzą przez centralny Hub.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {escrowModes.map((mode) => {
            const isSelected = selected === mode.id;
            
            return (
              <div
                key={mode.id}
                onClick={() => setSelected(mode.id)}
                className={`p-4 rounded border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                  isSelected 
                    ? 'bg-[#161922] border-white ring-1 ring-white' 
                    : 'bg-[#111318] border-[#1F242D] hover:border-[#2E3644]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono-code text-[10px]">
                    <span className="text-[#64748B]">{mode.tag}</span>
                    {mode.recommended && (
                      <span className="text-[#10B981] font-bold">● RECOMMENDED</span>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-sm text-white">{mode.name}</h4>
                    <div className="mt-1 font-mono-code text-lg font-extrabold text-white">
                      {mode.price}
                    </div>
                  </div>

                  <div className="text-[11px] font-mono-code text-[#64748B] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#10B981]" />
                    {mode.turnaround}
                  </div>

                  <ul className="space-y-1.5 pt-2 border-t border-[#1F242D] text-[11px] text-[#94A3B8] font-mono-code">
                    {mode.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <div className={`w-full py-1.5 text-center text-xs font-mono-code rounded ${
                    isSelected ? 'bg-white text-black font-bold' : 'bg-[#0D0F14] text-[#64748B] border border-[#1F242D]'
                  }`}>
                    {isSelected ? 'SELECTED' : 'CHOOSE'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 border-[#1F242D] bg-[#111318] text-[#94A3B8] hover:text-white rounded font-mono-code text-xs h-10"
          >
            CANCEL
          </Button>
          <Button 
            onClick={handleConfirm} 
            className="flex-1 bg-white hover:bg-slate-200 text-black font-bold rounded font-mono-code text-xs h-10"
          >
            CONFIRM PROTOCOL
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}