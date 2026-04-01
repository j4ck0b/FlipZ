import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles } from "lucide-react";
import confetti from 'canvas-confetti';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-violet-200 shadow-2xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              Gratulacje! 🎉
            </h1>
            <p className="text-lg text-slate-600">
              Twoja subskrypcja została aktywowana
            </p>
          </div>

          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <div className="flex items-center justify-center gap-2 text-violet-700 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Plan Premium aktywny!</span>
            </div>
            <p className="text-sm text-slate-600">
              Możesz teraz korzystać ze wszystkich funkcji premium
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={() => navigate(createPageUrl('MyListings'))}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90"
            >
              Przejdź do moich wymian
            </Button>
            <Button
              onClick={() => navigate(createPageUrl('Home'))}
              variant="outline"
              className="w-full"
            >
              Wróć do strony głównej
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}