import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, Truck, Download } from "lucide-react";

export default function MockShippingLabel({ open, onClose, tradeOffer, userRole }) {
  const isOwner = userRole === 'owner';
  const myName = isOwner ? tradeOffer?.owner_name : tradeOffer?.sender_name;
  const otherName = isOwner ? tradeOffer?.sender_name : tradeOffer?.owner_name;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Shipping Label</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mock Label */}
          <Card className="p-6 border-2 border-dashed border-slate-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <p className="text-xs text-slate-500">TRACKING NUMBER</p>
                  <p className="text-lg font-mono font-bold">FZ{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
                <Package className="w-8 h-8 text-slate-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">FROM</p>
                  <p className="font-semibold">{myName}</p>
                  <p className="text-sm text-slate-600">Your Address</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">TO</p>
                  <p className="font-semibold">FlipCardZ Hub</p>
                  <p className="text-sm text-slate-600">Warsaw, Poland</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Truck className="w-4 h-4" />
                  <span>Priority Shipping • Signature Required</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              📦 This is your shipping label to send your package to the FlipCardZ hub for verification.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              💰 Both parties pay for their own shipping to the hub. After verification, packages will be cross-shipped to final destinations.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button className="flex-1 bg-slate-900 hover:bg-slate-800">
              <Download className="w-4 h-4 mr-2" />
              Download Label
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}