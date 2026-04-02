import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, Truck, Download, AlertCircle } from "lucide-react";

// Generuje deterministyczny numer śledzenia z ID wymiany (nie zmienia się przy re-renderze)
function generateTrackingNumber(tradeOfferId, role) {
  if (!tradeOfferId) return 'FZ-BRAK-ID';
  // Weź pierwsze 8 znaków UUID bez myślników, uppercase
  const base = tradeOfferId.replace(/-/g, '').substring(0, 8).toUpperCase();
  const suffix = role === 'owner' ? 'O' : 'S';
  return `FZ-${base}-${suffix}`;
}

export default function MockShippingLabel({ open, onClose, tradeOffer, userRole }) {
  const offer = tradeOffer?.offer ?? tradeOffer;
  const role = tradeOffer?.role ?? userRole;

  const isOwner = role === 'owner';
  const myName = isOwner ? offer?.owner_name : offer?.sender_name;

  // useMemo zapewnia że numer nie zmienia się przy re-renderach
  const trackingNumber = useMemo(
    () => generateTrackingNumber(offer?.id, role),
    [offer?.id, role]
  );

  // Sprawdź czy jest prawdziwa etykieta z bazy (z generateShippingLabelsFromHub)
  const hasRealLabel = offer?.shipping_label_url || offer?.tracking_number;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-xl">Etykieta wysyłkowa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Etykieta */}
          <Card className="p-6 border-2 border-dashed border-slate-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Numer śledzenia</p>
                  <p className="text-lg font-mono font-bold text-slate-900">
                    {offer?.tracking_number ?? trackingNumber}
                  </p>
                </div>
                <Package className="w-8 h-8 text-slate-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Od</p>
                  <p className="font-semibold text-slate-900">{myName ?? 'Twoje imię'}</p>
                  <p className="text-sm text-slate-600 mt-0.5">Twój adres z profilu</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Do</p>
                  <p className="font-semibold text-slate-900">FlipZ Hub</p>
                  <p className="text-sm text-slate-600 mt-0.5">ul. Centralna 1, 00-001 Warszawa</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Truck className="w-4 h-4" />
                  <span>Przesyłka priorytetowa · Wymagany podpis</span>
                </div>
              </div>
            </div>
          </Card>

          {!hasRealLabel && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                To jest etykieta podglądu. Administrator hubu wygeneruje prawdziwą etykietę InPost gdy obie strony potwierdzą wysyłkę.
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              📦 Wyślij swoją paczkę na adres hubu FlipZ w celu weryfikacji. Po sprawdzeniu paczki zostaną skrzyżowane i dostarczone do finalnych odbiorców.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Zamknij
            </Button>
            <Button
              className="flex-1 bg-slate-900 hover:bg-slate-800"
              onClick={() => {
                const url = offer?.label_url ?? offer?.shipping_label_url;
                if (url) {
                  window.open(url, '_blank');
                } else {
                  // Fallback do druku okna z etykietą
                  window.print();
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Pobierz etykietę
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}