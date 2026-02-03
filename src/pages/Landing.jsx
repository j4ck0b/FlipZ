import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  ArrowRight, 
  Package,
  ArrowRightLeft,
  CheckCircle,
  Users,
  Eye,
  Truck,
  Sparkles,
  Crown,
  Zap
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Jeśli zalogowany, przekieruj do home
  if (user) {
    navigate('/home');
    return null;
  }

  const features = [
    {
      icon: ShieldCheck,
      title: 'Bezpieczne wymiany',
      description: 'System escrow i weryfikacja przedmiotów',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Package,
      title: 'Łatwe wystawianie',
      description: 'Dodaj zdjęcia i szczegóły w minutę',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Społeczność',
      description: 'Tysiące kolekcjonerów czeka na wymianę',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Truck,
      title: 'Szybka wysyłka',
      description: 'Etykiety i tracking w jednym miejscu',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const categories = [
    { emoji: '🃏', name: 'Karty Pokémon', count: '2,500+' },
    { emoji: '🧱', name: 'LEGO', count: '1,200+' },
    { emoji: '🚗', name: 'Hot Wheels', count: '800+' },
    { emoji: '🧸', name: 'Figurki', count: '1,500+' },
    { emoji: '🎮', name: 'Retro Games', count: '600+' },
  ];

  const plans = [
    {
      name: 'Free',
      price: '0 zł',
      period: 'na zawsze',
      features: [
        '3 wymiany miesięcznie',
        'Podstawowe filtry',
        'Czat z użytkownikami',
        'Profil publiczny'
      ],
      cta: 'Zacznij za darmo',
      popular: false
    },
    {
      name: 'Basic',
      price: '19 zł',
      period: 'miesięcznie',
      features: [
        '10 wymian miesięcznie',
        'Zaawansowane filtry',
        'Prywatne oferty',
        'Wsparcie email',
        'Badge Basic'
      ],
      cta: 'Wybierz Basic',
      popular: false
    },
    {
      name: 'Premium',
      price: '39 zł',
      period: 'miesięcznie',
      features: [
        '∞ Nielimitowane wymiany',
        'Priorytetowe wsparcie',
        'Własne kolekcje',
        'Analityka',
        'Badge Premium',
        'Early access'
      ],
      cta: 'Zostań Premium',
      popular: true
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white border-white/40 text-lg px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Najpopularniejsza platforma wymian w Polsce
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Wymieniaj się<br />
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                bezpiecznie
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Karty, klocki, figurki i więcej. Znajdź to czego szukasz i wymień się z innymi kolekcjonerami.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-white text-violet-600 hover:bg-white/90 text-lg px-8 py-6 h-auto"
              >
                Zacznij wymianę
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg"
                className="border-2 border-white text-white hover:bg-black/10 text-lg px-8 py-6 h-auto"
              >
                Zobacz jak działa
                <Eye className="ml-2 w-5 h-5" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div>
                <div className="text-4xl font-bold mb-2">5K+</div>
                <div className="text-white/70">Użytkowników</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">12K+</div>
                <div className="text-white/70">Wymian</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-white/70">Zadowolenia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Co możesz wymienić?
            </h2>
            <p className="text-xl text-slate-600">
              Tysiące przedmiotów w różnych kategoriach
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category, i) => (
              <Card key={i} className="hover:shadow-xl transition-all cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    {category.emoji}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {category.count} ofert
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Dlaczego FlipCardZ?
            </h2>
            <p className="text-xl text-slate-600">
              Bezpieczeństwo i wygoda na pierwszym miejscu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="border-2 hover:border-violet-200 transition-all">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Jak to działa?
            </h2>
            <p className="text-xl text-slate-600">
              Prosto i bezpiecznie w 4 krokach
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, icon: Package, title: 'Wystaw przedmiot', desc: 'Dodaj zdjęcia i opis' },
              { step: 2, icon: Eye, title: 'Znajdź ofertę', desc: 'Przeglądaj i wybieraj' },
              { step: 3, icon: ArrowRightLeft, title: 'Wymień się', desc: 'Akceptuj i wyślij' },
              { step: 4, icon: CheckCircle, title: 'Gotowe!', desc: 'Oceń wymianę' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg">
                      {item.step}
                    </div>
                    <div className="w-12 h-12 bg-white rounded-xl border-2 border-violet-200 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Proste cenniki
            </h2>
            <p className="text-xl text-slate-600">
              Wybierz plan który pasuje do Ciebie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <Card 
                key={i} 
                className={`relative ${
                  plan.popular 
                    ? 'border-2 border-violet-600 shadow-2xl scale-105' 
                    : 'border-2'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Najpopularniejszy
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-900">
                      {plan.price}
                    </span>
                    <span className="text-slate-600 ml-2">
                      / {plan.period}
                    </span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/login')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Gotowy na pierwszą wymianę?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Dołącz do tysięcy kolekcjonerów już dziś!
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/login')}
            className="bg-white text-violet-600 hover:bg-white/90 text-lg px-8 py-6 h-auto"
          >
            <Zap className="mr-2 w-5 h-5" />
            Zacznij za darmo
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">FlipCardZ</h3>
              <p className="text-slate-400">
                Bezpieczna platforma wymian dla kolekcjonerów
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produkt</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Funkcje</li>
                <li>Cennik</li>
                <li>Bezpieczeństwo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Firma</h4>
              <ul className="space-y-2 text-slate-400">
                <li>O nas</li>
                <li>Kontakt</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Wsparcie</h4>
              <ul className="space-y-2 text-slate-400">
                <li>FAQ</li>
                <li>Regulamin</li>
                <li>Prywatność</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2026 FlipCardZ. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
