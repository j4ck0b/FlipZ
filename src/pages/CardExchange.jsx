import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Search, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight, 
  Info, 
  Sparkles,
  ArrowRightLeft
} from "lucide-react";
import CardDetailSheet from '../components/cards/CardDetailSheet';
import ListingModal from '../components/cards/ListingModal';

const DEFAULT_GRADED_CARDS = [
  {
    id: 'specimen_01',
    title: 'Base Set 1st Ed. Charizard Holo',
    set_name: '1999 • Pokémon TCG',
    category: 'pokemon_cards',
    condition: 'PSA 9',
    grade_label: 'PSA 9 Mint',
    price: '48 500',
    views_now: 5,
    available_now: true,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8iAl8ZEjzGbyXvicbRUGKHNBiTMSzqEMp-m9SWiKDuPxTKb8yfMathCFzEY7lnk7HC3WwQPUE1kSRJuuVIEpB5HN_ml5hE_MRrHbGeXUePyfMPzxmyLHlSyL0UrvvcA-GdlSbZPiOi0oh9bkYevjFC-3LAWfbtzHd5beIy0vRZosh899AO5cfI2HcQPK9LZ4UlfrqmiggyOX7Z4HTRcikHKMyNamtMA6SRCkM7qy1tX2bajzdC7xq'
  },
  {
    id: 'specimen_02',
    title: 'Alpha Black Lotus',
    set_name: '1993 • Magic: The Gathering',
    category: 'magic_the_gathering',
    condition: 'BGS 9.5',
    grade_label: 'BGS 9.5 Gem Mint',
    price: '340 000',
    views_now: 12,
    available_now: true,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQD02ON67WN5kac-Z4AdjVUIWZJ4oxvBUjcIKWSIYfAL-71I882lphLi2dU30MFglFtsBHtrPh-ilpqW-SuT_yCYRzEYCZv4Ztq_dDlXwIsC7eKsKEEXHs5E6lOcGBDrJDuZtNmwV2_782bI3VLqkTmphl3pYH5W8A3Om9y3Km4zF0qtzX0rfcOY6aqAjLp59k84qvJnVG0REmO-o8keQmXbVgkb8FBrlenIHtHxsQu-LDd_Tjie8i'
  },
  {
    id: 'specimen_03',
    title: 'Michael Jordan Rookie #57',
    set_name: '1986 • Fleer Basketball',
    category: 'sports_cards',
    condition: 'PSA 10',
    grade_label: 'PSA 10 Gem Mint',
    price: '980 000',
    views_now: 8,
    available_now: true,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATGNSAovaFBFAPQntS7E2lelSvcpkQBQ3urSqy38OUmA9Isjo29WKHNx1FFDXCMJl-0FeBVxkyc9mcULSu6S4anp-hP0XO0aDP_oWmaEnOwKE1kK9RcWV9gcEXhyHSFPHyM2I25sXVzSnGPEv7hpJyqkqsZhYYWd-LcULwTZrWYmP3KcWYSH36mETlxNWaZ86V9frfzmXNp1Lk5bx3fFoC8cwbaV2ZEvpg8vITcUauIkBDjH6h4YxI'
  }
];

export default function CardExchange() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [selectedGrades, setSelectedGrades] = useState(['PSA 10', 'PSA 9', 'BGS 9.5']);
  const [selectedSets, setSelectedSets] = useState(['pokemon_cards', 'magic_the_gathering', 'sports_cards']);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchListings();
  }, [user?.id]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('card_listings')
        .select('*')
        .eq('status', 'available')
        .order('created_date', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data && data.length > 0) {
        setListings(data);
      } else {
        setListings(DEFAULT_GRADED_CARDS);
      }
    } catch (err) {
      console.warn('Fallback to curated graded cards');
      setListings(DEFAULT_GRADED_CARDS);
    } finally {
      setLoading(false);
    }
  };

  const toggleGrade = (grade) => {
    if (selectedGrades.includes(grade)) {
      setSelectedGrades(selectedGrades.filter(g => g !== grade));
    } else {
      setSelectedGrades([...selectedGrades, grade]);
    }
  };

  const toggleSet = (setVal) => {
    if (selectedSets.includes(setVal)) {
      setSelectedSets(selectedSets.filter(s => s !== setVal));
    } else {
      setSelectedSets([...selectedSets, setVal]);
    }
  };

  const clearFilters = () => {
    setSelectedGrades(['PSA 10', 'PSA 9', 'BGS 9.5']);
    setSelectedSets(['pokemon_cards', 'magic_the_gathering', 'sports_cards']);
    setSearchQuery('');
  };

  const displayListings = listings.length > 0 ? listings : DEFAULT_GRADED_CARDS;

  const filtered = displayListings.filter(item => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || item.card_name || '').toLowerCase().includes(q);
      const matchSet = (item.set_name || item.category || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSet) return false;
    }
    return true;
  });

  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen -m-6 flex flex-col">
      
      {/* Top Banner Hero */}
      <div className="w-full bg-surface-container py-10 px-6 lg:px-12 border-b border-outline-variant/30">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="w-full lg:w-1/2 flex flex-col gap-4 z-10">
            <div className="flex items-center gap-1.5 text-on-surface-variant font-semibold text-xs uppercase tracking-wider">
              <span>Kategorie</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-secondary font-bold">Karty Kolekcjonerskie</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight">
              Premium Collectible Cards
            </h1>
            <p className="text-base text-on-surface-variant max-w-xl leading-relaxed">
              Odkryj certyfikowane (PSA, BGS, CGC) karty kolekcjonerskie o wysokiej wartości, dostępne do bezpiecznej wymiany przez Protokół Escrow.
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowListingModal(true)}
                className="bg-secondary text-on-secondary px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm hover:bg-on-secondary-fixed-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Wystaw Kartę
              </button>
              <button 
                onClick={() => window.open('/#how-it-works', '_self')}
                className="bg-surface text-on-surface px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm border border-outline-variant/50 hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">info</span>
                Standard Escrow
              </button>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-transparent blur-3xl rounded-full scale-110 z-0"></div>
            <img 
              alt="Collectible card in slab" 
              className="w-full max-w-md object-cover rounded-2xl shadow-2xl z-10 hover:-translate-y-1.5 transition-transform duration-500 relative border border-outline-variant/40" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5wVAjWqJeCV38HRQ_uX5fn7j_nv8UwJjwXQJLJXXflUfQfn_ECpyj_EtwTKsLvG924h1lzzC14LiUQ2f1wCq9_OhXcin83Zpgcx95B_D9YxF1xfwqdzCG6oPlqVHnTuWS1JsiYTNN_cfM3HqeuNEme-9PnXjEaBGXdmZLtWH5AwL_k8sYKbq7W3Z4ZvI-AkJvxLUs3u5GCalbG9n5TsKHo0_2jtbhL22vG2JrnYaZqYlJTPjL3JpV"
            />
          </div>
        </div>
      </div>

      {/* Main Content Layout with Sidebar & Grid */}
      <div className="max-w-[1280px] mx-auto w-full px-6 lg:px-10 py-10 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-6 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/40 self-start sticky top-28">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-on-surface">Filtry</h2>
            <button 
              onClick={clearFilters}
              className="text-xs font-semibold text-on-surface-variant hover:text-secondary transition-colors"
            >
              Wyczyść
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Certyfikacja i Grade</h3>
            <label className="flex items-center gap-2.5 cursor-pointer group text-sm">
              <input 
                type="checkbox" 
                checked={selectedGrades.includes('PSA 10')} 
                onChange={() => toggleGrade('PSA 10')}
                className="w-4 h-4 rounded accent-secondary cursor-pointer" 
              />
              <span className="text-on-surface group-hover:text-secondary transition-colors">PSA 10 Gem Mint</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group text-sm">
              <input 
                type="checkbox" 
                checked={selectedGrades.includes('PSA 9')} 
                onChange={() => toggleGrade('PSA 9')}
                className="w-4 h-4 rounded accent-secondary cursor-pointer" 
              />
              <span className="text-on-surface group-hover:text-secondary transition-colors">PSA 9 Mint</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group text-sm">
              <input 
                type="checkbox" 
                checked={selectedGrades.includes('BGS 9.5')} 
                onChange={() => toggleGrade('BGS 9.5')}
                className="w-4 h-4 rounded accent-secondary cursor-pointer" 
              />
              <span className="text-on-surface group-hover:text-secondary transition-colors">BGS 9.5 Gem Mint</span>
            </label>
          </div>

          <div className="w-full h-[1px] bg-outline-variant/30"></div>

          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Gra / Kategoria</h3>
            <label className="flex items-center gap-2.5 cursor-pointer group text-sm">
              <input 
                type="checkbox" 
                checked={selectedSets.includes('pokemon_cards')} 
                onChange={() => toggleSet('pokemon_cards')}
                className="w-4 h-4 rounded accent-secondary cursor-pointer" 
              />
              <span className="text-on-surface group-hover:text-secondary transition-colors">Pokémon TCG</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group text-sm">
              <input 
                type="checkbox" 
                checked={selectedSets.includes('magic_the_gathering')} 
                onChange={() => toggleSet('magic_the_gathering')}
                className="w-4 h-4 rounded accent-secondary cursor-pointer" 
              />
              <span className="text-on-surface group-hover:text-secondary transition-colors">Magic: The Gathering</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group text-sm">
              <input 
                type="checkbox" 
                checked={selectedSets.includes('sports_cards')} 
                onChange={() => toggleSet('sports_cards')}
                className="w-4 h-4 rounded accent-secondary cursor-pointer" 
              />
              <span className="text-on-surface group-hover:text-secondary transition-colors">Sports (Basketball/Football)</span>
            </label>
          </div>
        </aside>

        {/* Catalog Grid Area */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Top Bar: Count & Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-container p-3.5 rounded-xl shadow-sm border border-outline-variant/30 gap-3">
            <span className="text-xs text-on-surface-variant font-medium">
              Wyświetlanie <strong>{filtered.length}</strong> zweryfikowanych kart
            </span>
            <div className="flex gap-2.5 items-center">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Sortuj:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface outline-none shadow-sm cursor-pointer border border-outline-variant/40"
              >
                <option value="newest">Najnowsze</option>
                <option value="value_high">Najwyższa Wartość</option>
                <option value="grade_high">Grade (Od najwyższego)</option>
              </select>
            </div>
          </div>

          {/* Refresh Notification Banner */}
          <div 
            onClick={fetchListings}
            className="bg-secondary/15 border border-secondary/30 p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-secondary/25 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-secondary text-[20px] animate-pulse">sync</span>
            <span className="text-xs text-on-secondary-container font-semibold">
              Znaleziono nowe certyfikowane oferty — kliknij aby odświeżyć
            </span>
          </div>

          {/* Grid of Slab Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((card) => (
              <article 
                key={card.id}
                onClick={() => {
                  setSelectedCard(card);
                  setShowDetailSheet(true);
                }}
                className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer border border-outline-variant/40 relative overflow-hidden"
              >
                {/* Escrow Badge */}
                <div className="absolute top-4 right-4 bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] font-bold z-10 flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[13px]">verified</span> 
                  Escrow Ready
                </div>

                {/* Card Image / Slab Mockup */}
                <div className="w-full aspect-[3/4] bg-surface-container rounded-xl overflow-hidden relative border border-outline-variant/30 flex items-center justify-center">
                  <img 
                    src={card.image_url || card.photos?.[0]} 
                    alt={card.title || card.card_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>

                {/* Card Content & Details */}
                <div className="pt-4 flex flex-col gap-2 flex-1">
                  <div>
                    <h3 className="font-bold text-base text-on-surface leading-tight group-hover:text-secondary transition-colors truncate">
                      {card.title || card.card_name}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">{card.set_name || '1999 • Kolekcjonerskie TCG'}</p>
                  </div>

                  {/* Grade tag & Value */}
                  <div className="mt-auto pt-3 flex items-center justify-between border-t border-outline-variant/20">
                    <div className="flex gap-1.5 items-center bg-primary-container px-2.5 py-1 rounded-md text-on-primary">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider">
                        {card.condition || 'PSA 9'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-semibold text-on-surface-variant uppercase">Wycena Hub</span>
                      <span className="text-base text-secondary font-extrabold font-mono">
                        ~{card.price || card.estimated_value || 'Wymiana'} PLN
                      </span>
                    </div>
                  </div>

                  {/* Pulse status indicator */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-error rounded-full animate-ping"></span>
                      <span className="text-[11px] text-error font-semibold">{card.views_now || 5} osób ogląda teraz</span>
                    </div>
                    <span className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                      Dostępne od zaraz
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

        </div>
      </div>

      <CardDetailSheet
        card={selectedCard}
        isOpen={showDetailSheet}
        onClose={() => setShowDetailSheet(false)}
      />

      <ListingModal
        isOpen={showListingModal}
        onClose={() => setShowListingModal(false)}
        onSuccess={fetchListings}
      />
    </div>
  );
}
