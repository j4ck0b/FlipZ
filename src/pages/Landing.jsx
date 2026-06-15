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
    <div className="app-shell min-h-screen text-slate-100 relative overflow-hidden">
      <div className="app-shell__glow app-shell__glow--primary" aria-hidden="true" />
      <div className="app-shell__glow app-shell__glow--secondary" aria-hidden="true" />

      {/* Hero Section */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/20 via-purple-600/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-violet-500/10 text-violet-300 border border-violet-500/30 text-sm px-4 py-2 hover:bg-violet-500/20 transition-all rounded-full">
              <Sparkles className="w-4 h-4 mr-2 text-violet-400" />
              Najpopularniejsza platforma wymian w Polsce
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white leading-tight">
              Wymieniaj się <br />
              <span className="animated-gradient-text">
                bezpiecznie
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              Karty, klocki, figurki i więcej. Znajdź to czego szukasz i wymień się z innymi kolekcjonerami w nowej, bezpiecznej technologii escrow.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-lg px-8 py-6 h-auto rounded-xl shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-105 transition-all duration-200"
              >
                Zacznij wymianę
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white text-lg px-8 py-6 h-auto rounded-xl backdrop-blur-md"
                onClick={() => {
                  const target = document.getElementById("how-it-works");
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Zobacz jak działa
                <Eye className="ml-2 w-5 h-5 text-violet-400" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-20 max-w-2xl mx-auto p-6 panel-elevated rounded-2xl border border-white/10 backdrop-blur-md">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">5K+</div>
                <div className="text-slate-400 text-sm">Użytkowników</div>
              </div>
              <div className="border-x border-white/10">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">12K+</div>
                <div className="text-slate-400 text-sm">Wymian</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">98%</div>
                <div className="text-slate-400 text-sm">Zadowolenia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold section-heading mb-4">
              Co możesz wymienić?
            </h2>
            <p className="text-lg text-slate-400">
              Tysiące przedmiotów w różnych kategoriach
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category, i) => (
              <Card key={i} className="panel-muted hover:panel-elevated hover:scale-105 transition-all duration-300 border-0 ring-1 ring-white/10 hover:ring-violet-500/50 cursor-pointer group rounded-2xl">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.emoji}
                  </div>
                  <h3 className="font-semibold text-slate-200 mb-2 group-hover:text-violet-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                    {category.count} ofert
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative z-10 border-t border-white/5 bg-black/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold section-heading mb-4">
              Dlaczego FlipCardZ?
            </h2>
            <p className="text-lg text-slate-400">
              Bezpieczeństwo i wygoda na pierwszym miejscu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="panel-muted hover:panel-elevated hover:scale-[1.02] transition-all duration-300 border-0 ring-1 ring-white/10 hover:ring-violet-500/50 rounded-2xl">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg shadow-black/30`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
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
      <section id="how-it-works" className="py-24 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold section-heading mb-4">
              Jak to działa?
            </h2>
            <p className="text-lg text-slate-400">
              Prosto i bezpiecznie w 4 krokach
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, icon: Package, title: 'Wystaw przedmiot', desc: 'Dodaj zdjęcia i opis w minutę.' },
              { step: 2, icon: Eye, title: 'Znajdź ofertę', desc: 'Przeglądaj i wybieraj z tysięcy ogłoszeń.' },
              { step: 3, icon: ArrowRightLeft, title: 'Wymień się', desc: 'Wyślij za pośrednictwem huba z weryfikacją.' },
              { step: 4, icon: CheckCircle, title: 'Gotowe!', desc: 'Odbierz zweryfikowany przedmiot i wystaw ocenę.' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative group">
                  <div className="text-center p-6 panel-muted rounded-2xl border border-white/5 hover:panel-elevated transition-all duration-300 h-full">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                      {item.step}
                    </div>
                    <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-violet-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
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
      <section className="py-24 relative z-10 border-t border-white/5 bg-black/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold section-heading mb-4">
              Proste cenniki
            </h2>
            <p className="text-lg text-slate-400">
              Wybierz plan który pasuje do Ciebie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {plans.map((plan, i) => (
              <Card 
                key={i} 
                className={`relative border-0 ring-1 transition-all duration-300 flex flex-col justify-between rounded-3xl ${
                  plan.popular 
                    ? 'panel-elevated ring-violet-500 shadow-2xl scale-105 md:z-10' 
                    : 'panel-muted ring-white/10 hover:ring-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 px-4 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Najpopularniejszy
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-slate-400 ml-2 text-sm">
                        / {plan.period}
                      </span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    className={`w-full rounded-xl py-5 font-semibold text-sm ${
                      plan.popular
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-600/30'
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
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
      <section className="py-24 relative z-10 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-violet-600/10 pointer-events-none blur-3xl rounded-full" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Gotowy na pierwszą wymianę?
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">
            Dołącz do tysięcy kolekcjonerów w Polsce i zabezpiecz swoje wymiany.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-lg px-8 py-6 h-auto rounded-xl shadow-lg shadow-violet-600/30"
          >
            <Zap className="mr-2 w-5 h-5" />
            Zacznij za darmo
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-md border-t border-white/5 text-white py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">FlipCardZ</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Bezpieczna platforma wymian dla kolekcjonerów
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-200">Produkt</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="hover:text-violet-400 cursor-pointer transition-colors">Funkcje</li>
                <li className="hover:text-violet-400 cursor-pointer transition-colors">Cennik</li>
                <li className="hover:text-violet-400 cursor-pointer transition-colors">Bezpieczeństwo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-200">Firma</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="hover:text-violet-400 cursor-pointer transition-colors">O nas</li>
                <li className="hover:text-violet-400 cursor-pointer transition-colors">Kontakt</li>
                <li className="hover:text-violet-400 cursor-pointer transition-colors">Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-200">Wsparcie</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="hover:text-violet-400 cursor-pointer transition-colors">FAQ</li>
                <li className="hover:text-violet-400 cursor-pointer transition-colors">Regulamin</li>
                <li className="hover:text-violet-400 cursor-pointer transition-colors">Prywatność</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-8 pt-8 text-center text-slate-500 text-xs">
            <p>&copy; 2026 FlipCardZ. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
