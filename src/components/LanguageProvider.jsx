import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation
    home: "Home",
    myCollection: "My Collection",
    messages: "Messages",
    profile: "Profile",
    logout: "Logout",
    
    // Common
    search: "Search items... (e.g., Pikachu, Charizard, Deadpool)",
    listItem: "List Item",
    newest: "Newest",
    mostTraded: "Most Traded",
    itemsAvailable: "items available",
    noItemsFound: "No items found",
    beFirstToList: "Be the first to list an item in this category!",
    
    // Card Exchange
    cardExchangeTitle: "Card Exchange",
    cardExchangeDesc: "Trade Pokémon, Magic, Yu-Gi-Oh!, and sports cards",
    
    // Brick Exchange
    brickExchangeTitle: "Brick Exchange",
    brickExchangeDesc: "Trade LEGO sets and minifigures",
    
    // Figure Exchange
    figureExchangeTitle: "Figure Exchange",
    figureExchangeDesc: "Trade Funko Pops, anime figures, and designer toys",
    
    // Diecast Exchange
    diecastExchangeTitle: "Diecast Exchange",
    diecastExchangeDesc: "Trade Hot Wheels, Matchbox, and diecast collectibles",
    
    // Collectible Exchange
    collectibleExchangeTitle: "Collectible Exchange",
    collectibleExchangeDesc: "Trade retro games, vinyl records, sneakers, and more",
    
    // Filters
    allCategories: "All Categories",
    pokemon: "Pokémon",
    magicTheGathering: "Magic: The Gathering",
    yugioh: "Yu-Gi-Oh!",
    sports: "Sports",
    other: "Other",
    condition: "Condition",
    allConditions: "All Conditions",
    mint: "Mint",
    nearMint: "Near Mint",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
    rarity: "Rarity",
    allRarities: "All Rarities",
    common: "Common",
    uncommon: "Uncommon",
    rare: "Rare",
    ultraRare: "Ultra Rare",
    legendary: "Legendary",
    filters: "Filters",
    clearAllFilters: "Clear All Filters",
    clear: "Clear",
    tradeOnly: "Trade Only",
    
    // Categories
    all: "All",
    funkoPop: "Funko Pop",
    animeFigures: "Anime Figures",
    designerToys: "Designer Toys",
    hotWheels: "Hot Wheels",
    matchbox: "Matchbox",
    retroGames: "Retro Games",
    vinylRecords: "Vinyl Records",
    sneakers: "Sneakers"
  },
  
  pl: {
    // Navigation
    home: "Strona główna",
    myCollection: "Moja kolekcja",
    messages: "Wiadomości",
    profile: "Profil",
    logout: "Wyloguj",
    
    // Common
    search: "Szukaj przedmiotów... (np. Pikachu, Charizard, Deadpool)",
    listItem: "Dodaj przedmiot",
    newest: "Najnowsze",
    mostTraded: "Najczęściej wymieniane",
    itemsAvailable: "dostępnych przedmiotów",
    noItemsFound: "Nie znaleziono przedmiotów",
    beFirstToList: "Bądź pierwszym, który wystawi przedmiot w tej kategorii!",
    
    // Card Exchange
    cardExchangeTitle: "Wymiana kart",
    cardExchangeDesc: "Wymieniaj karty Pokémon, Magic, Yu-Gi-Oh! i sportowe",
    
    // Brick Exchange
    brickExchangeTitle: "Wymiana klocków",
    brickExchangeDesc: "Wymieniaj zestawy LEGO i minifigurki",
    
    // Figure Exchange
    figureExchangeTitle: "Wymiana figurek",
    figureExchangeDesc: "Wymieniaj figurki Funko Pop, anime i designerskie zabawki",
    
    // Diecast Exchange
    diecastExchangeTitle: "Wymiana modeli",
    diecastExchangeDesc: "Wymieniaj Hot Wheels, Matchbox i modele kolekcjonerskie",
    
    // Collectible Exchange
    collectibleExchangeTitle: "Wymiana kolekcji",
    collectibleExchangeDesc: "Wymieniaj retro gry, płyty winylowe, sneakersy i więcej",
    
    // Filters
    allCategories: "Wszystkie kategorie",
    pokemon: "Pokémon",
    magicTheGathering: "Magic: The Gathering",
    yugioh: "Yu-Gi-Oh!",
    sports: "Sport",
    other: "Inne",
    condition: "Stan",
    allConditions: "Wszystkie stany",
    mint: "Idealny",
    nearMint: "Prawie idealny",
    excellent: "Doskonały",
    good: "Dobry",
    fair: "Zadowalający",
    poor: "Słaby",
    rarity: "Rzadkość",
    allRarities: "Wszystkie rzadkości",
    common: "Zwykły",
    uncommon: "Niezwykły",
    rare: "Rzadki",
    ultraRare: "Ultra rzadki",
    legendary: "Legendarny",
    filters: "Filtry",
    clearAllFilters: "Wyczyść wszystkie filtry",
    clear: "Wyczyść",
    tradeOnly: "Tylko wymiana",
    
    // Categories
    all: "Wszystkie",
    funkoPop: "Funko Pop",
    animeFigures: "Figurki anime",
    designerToys: "Zabawki designerskie",
    hotWheels: "Hot Wheels",
    matchbox: "Matchbox",
    retroGames: "Retro gry",
    vinylRecords: "Płyty winylowe",
    sneakers: "Sneakersy"
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export default function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'pl' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}