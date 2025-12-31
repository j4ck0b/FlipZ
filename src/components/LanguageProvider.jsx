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
    sneakers: "Sneakers",
    
    // Home page
    tradeWhatYouCollect: "Trade What You Collect",
    safeExchanges: "Safe exchanges. Real collectors. No selling.",
    cardsAndMore: "Cards, figures, bricks, and more — safely exchanged with collectors worldwide",
    howItWorks: "How FlipCardZ Works",
    safeSecureTrades: "Safe, secure trades with built-in protection",
    proposeTrade: "Propose Trade",
    proposeTradeDesc: "Select items from your collection to trade",
    activateExchange: "Activate Exchange",
    activateExchangeDesc: "Both parties secure the trade with shipping labels (24 zł)",
    shipAndComplete: "Ship & Complete",
    shipAndCompleteDesc: "Exchange items safely with tracking and protection",
    
    // Landing page
    signIn: "Sign In",
    secureTrading: "Secure Trading for Collectors",
    whoCareAboutItems: "Who Care About Their Items",
    secureEscrowDesc: "FlipCardZ.store is a secure escrow-based platform that lets collectors safely buy, sell, and trade valuable items online — without fear of scams or disputes.",
    getStartedFree: "Get Started Free",
    seeHowItWorks: "See How It Works",
    whatYouCanTrade: "What You Can Trade on FlipCardZ",
    differentCollectibles: "Different collectibles, one secure trading system.",
    escrowProcess: "Escrow Process",
    howSecureWorks: "How Secure Trading Works",
    safetyTransparency: "Safety, transparency, and reduced risk at every step",
    createAgreement: "Create Agreement",
    createAgreementDesc: "Create a trade or sale agreement with another collector",
    sendToEscrow: "Send to Escrow",
    sendToEscrowDesc: "Both parties send items to FlipCardZ secure escrow",
    verification: "Verification",
    verificationDesc: "Items are verified for condition and authenticity",
    safeDelivery: "Safe Delivery",
    safeDeliveryDesc: "Items are safely delivered to their new owners",
    whyChoose: "Why Collectors Choose FlipCardZ",
    escrowProtection: "Escrow Protection",
    escrowProtectionDesc: "Items are secured before exchange, ensuring both parties are protected",
    verificationProcess: "Verification Process",
    verificationProcessDesc: "Designed to reduce fraud and disputes with professional verification",
    builtForCollectors: "Built for Collectors",
    builtForCollectorsDesc: "Tools created specifically for high-value collectibles trading",
    growingCommunity: "Growing Community",
    growingCommunityDesc: "Connect with passionate collectors worldwide",
    transparentPricing: "Simple, Transparent Pricing",
    freeAccountDesc: "Free account with limited exchanges",
    subscriptionDesc: "Subscription: 20 PLN/month for increased exchange limits",
    perExchange: "Per exchange",
    mostPopular: "Most Popular",
    standardEscrow: "Standard escrow protection",
    basicVerification: "Basic verification",
    standardDelivery: "Standard delivery",
    enhancedProtection: "Enhanced escrow protection",
    detailedVerification: "Detailed verification",
    prioritySupport: "Priority support",
    maximumProtection: "Maximum protection",
    professionalAuth: "Professional authentication",
    premiumSupport: "Premium support",
    insuranceIncluded: "Insurance included",
    noHiddenFees: "No hidden fees. Pay only when you trade.",
    builtOnTrust: "Built on Trust, Powered by Community",
    trustEssential: "Trust is essential in collectibles trading. FlipCardZ is designed to protect both sides of every trade with community moderation and verified processes, ensuring a safe marketplace for passionate collectors.",
    startTradingConfidence: "Start Trading With Confidence",
    joinCommunity: "Join our community and experience secure, verified trading for your valuable collectibles.",
    createFreeAccount: "Create Free Account",
    exploreMarketplace: "Explore the Marketplace",
    terms: "Terms",
    privacy: "Privacy",
    contact: "Contact",
    allRightsReserved: "All rights reserved",
    
    // MyListings page
    myDashboard: "My Dashboard",
    manageListing: "Manage your listings and trade requests",
    newListing: "New Listing",
    myListings: "My Listings",
    incomingOffers: "Incoming Offers",
    myOffers: "My Offers",
    noListingsYet: "No listings yet",
    startByListing: "Start by listing your first card",
    createListing: "Create Listing",
    noOffersYet: "No offers yet",
    tradeOffersAppear: "Trade offers from collectors will appear here",
    noOffersMade: "No offers made",
    yourOffersAppear: "Your trade offers will appear here",
    tradeOnly: "Trade Only",
    edit: "Edit",
    markAsSold: "Mark as Sold",
    markAsTraded: "Mark as Traded",
    delete: "Delete",
    deleteListing: "Delete Listing",
    areYouSure: "Are you sure you want to delete",
    cannotBeUndone: "This action cannot be undone.",
    cancel: "Cancel",
    wants: "Wants",
    theirOffer: "Their Offer",
    yourOffer: "Your Offer",
    chat: "Chat",
    accept: "Accept",
    decline: "Decline",
    completePayment: "Complete Payment",
    bothPaidReady: "Both Paid - Ready!",
    waitingFor: "Waiting for",
    viewShippingLabel: "View Shipping Label",
    iHaveSentPackage: "I Have Sent Package",
    packageSent: "Package Sent",
    skipToHubInspection: "Skip to Hub Inspection",
    everythingOK: "Everything OK",
    viewDetails: "View Details",
    inspectionAccepted: "Inspection Accepted",
    completeTrade: "Complete Trade",
    to: "To:",
    for: "For:",
    
    // Messages page
    yourTradeConversations: "Your trade conversations",
    searchConversations: "Search conversations...",
    noConversationsYet: "No conversations yet",
    noMessagesYet: "No messages yet",
    selectAConversation: "Select a conversation",
    chooseConversation: "Choose a conversation to start chatting",
    
    // Profile page
    editProfile: "Edit Profile",
    joined: "Joined",
    lookingFor: "Looking For",
    activeListings: "Active Listings",
    listings: "Listings",
    tradeOffers: "Trade Offers",
    trades: "Trades",
    pastTransactions: "Past Transactions",
    past: "Past",
    noCompletedTransactions: "No completed transactions yet",
    sold: "Sold",
    traded: "Traded"
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
    sneakers: "Sneakersy",
    
    // Home page
    tradeWhatYouCollect: "Wymieniaj to, co kolekcjonujesz",
    safeExchanges: "Bezpieczne wymiany. Prawdziwi kolekcjonerzy. Bez sprzedaży.",
    cardsAndMore: "Karty, figurki, klocki i więcej — bezpiecznie wymieniane z kolekcjonerami z całego świata",
    howItWorks: "Jak działa FlipCardZ",
    safeSecureTrades: "Bezpieczne wymiany z wbudowaną ochroną",
    proposeTrade: "Zaproponuj wymianę",
    proposeTradeDesc: "Wybierz przedmioty ze swojej kolekcji do wymiany",
    activateExchange: "Aktywuj wymianę",
    activateExchangeDesc: "Obie strony zabezpieczają wymianę etykietami wysyłkowymi (24 zł)",
    shipAndComplete: "Wyślij i zakończ",
    shipAndCompleteDesc: "Wymieniaj przedmioty bezpiecznie ze śledzeniem i ochroną",
    
    // Landing page
    signIn: "Zaloguj się",
    secureTrading: "Bezpieczna wymiana dla kolekcjonerów",
    whoCareAboutItems: "którym zależy na swoich przedmiotach",
    secureEscrowDesc: "FlipCardZ.store to bezpieczna platforma oparta na escrow, która pozwala kolekcjonerom bezpiecznie kupować, sprzedawać i wymieniać cenne przedmioty online — bez obaw o oszustwa lub spory.",
    getStartedFree: "Zacznij za darmo",
    seeHowItWorks: "Zobacz jak to działa",
    whatYouCanTrade: "Co możesz wymienić na FlipCardZ",
    differentCollectibles: "Różne kolekcje, jeden bezpieczny system wymiany.",
    escrowProcess: "Proces Escrow",
    howSecureWorks: "Jak działa bezpieczna wymiana",
    safetyTransparency: "Bezpieczeństwo, przejrzystość i zmniejszone ryzyko na każdym kroku",
    createAgreement: "Utwórz umowę",
    createAgreementDesc: "Utwórz umowę wymiany lub sprzedaży z innym kolekcjonerem",
    sendToEscrow: "Wyślij do Escrow",
    sendToEscrowDesc: "Obie strony wysyłają przedmioty do bezpiecznego escrow FlipCardZ",
    verification: "Weryfikacja",
    verificationDesc: "Przedmioty są weryfikowane pod kątem stanu i autentyczności",
    safeDelivery: "Bezpieczna dostawa",
    safeDeliveryDesc: "Przedmioty są bezpiecznie dostarczane do nowych właścicieli",
    whyChoose: "Dlaczego kolekcjonerzy wybierają FlipCardZ",
    escrowProtection: "Ochrona Escrow",
    escrowProtectionDesc: "Przedmioty są zabezpieczone przed wymianą, zapewniając ochronę obu stronom",
    verificationProcess: "Proces weryfikacji",
    verificationProcessDesc: "Zaprojektowany w celu zmniejszenia oszustw i sporów dzięki profesjonalnej weryfikacji",
    builtForCollectors: "Zbudowany dla kolekcjonerów",
    builtForCollectorsDesc: "Narzędzia stworzone specjalnie do wymiany cennych przedmiotów kolekcjonerskich",
    growingCommunity: "Rosnąca społeczność",
    growingCommunityDesc: "Połącz się z pasjonatami kolekcjonerami z całego świata",
    transparentPricing: "Proste, przejrzyste ceny",
    freeAccountDesc: "Darmowe konto z limitowanymi wymianami",
    subscriptionDesc: "Subskrypcja: 20 PLN/miesiąc za zwiększone limity wymiany",
    perExchange: "Za wymianę",
    mostPopular: "Najpopularniejszy",
    standardEscrow: "Standardowa ochrona escrow",
    basicVerification: "Podstawowa weryfikacja",
    standardDelivery: "Standardowa dostawa",
    enhancedProtection: "Ulepszona ochrona escrow",
    detailedVerification: "Szczegółowa weryfikacja",
    prioritySupport: "Priorytetowe wsparcie",
    maximumProtection: "Maksymalna ochrona",
    professionalAuth: "Profesjonalna autentykacja",
    premiumSupport: "Premium wsparcie",
    insuranceIncluded: "Ubezpieczenie wliczone",
    noHiddenFees: "Brak ukrytych opłat. Płać tylko wtedy, gdy wymieniasz.",
    builtOnTrust: "Zbudowany na zaufaniu, napędzany przez społeczność",
    trustEssential: "Zaufanie jest niezbędne w handlu przedmiotami kolekcjonerskimi. FlipCardZ został zaprojektowany, aby chronić obie strony każdej wymiany dzięki moderacji społeczności i zweryfikowanym procesom, zapewniając bezpieczny rynek dla pasjonatów kolekcjonerów.",
    startTradingConfidence: "Zacznij wymieniać z pewnością",
    joinCommunity: "Dołącz do naszej społeczności i doświadcz bezpiecznej, zweryfikowanej wymiany swoich cennych przedmiotów kolekcjonerskich.",
    createFreeAccount: "Utwórz darmowe konto",
    exploreMarketplace: "Przeglądaj rynek",
    terms: "Regulamin",
    privacy: "Prywatność",
    contact: "Kontakt",
    allRightsReserved: "Wszelkie prawa zastrzeżone",
    
    // MyListings page
    myDashboard: "Mój panel",
    manageListing: "Zarządzaj swoimi ogłoszeniami i ofertami wymiany",
    newListing: "Nowe ogłoszenie",
    myListings: "Moje ogłoszenia",
    incomingOffers: "Przychodzące oferty",
    myOffers: "Moje oferty",
    noListingsYet: "Brak ogłoszeń",
    startByListing: "Zacznij od wystawienia swojej pierwszej karty",
    createListing: "Utwórz ogłoszenie",
    noOffersYet: "Brak ofert",
    tradeOffersAppear: "Oferty wymiany od kolekcjonerów pojawią się tutaj",
    noOffersMade: "Nie złożono ofert",
    yourOffersAppear: "Twoje oferty wymiany pojawią się tutaj",
    tradeOnly: "Tylko wymiana",
    edit: "Edytuj",
    markAsSold: "Oznacz jako sprzedane",
    markAsTraded: "Oznacz jako wymienione",
    delete: "Usuń",
    deleteListing: "Usuń ogłoszenie",
    areYouSure: "Czy na pewno chcesz usunąć",
    cannotBeUndone: "Ta akcja nie może być cofnięta.",
    cancel: "Anuluj",
    wants: "Chce",
    theirOffer: "Ich oferta",
    yourOffer: "Twoja oferta",
    chat: "Czat",
    accept: "Akceptuj",
    decline: "Odrzuć",
    completePayment: "Dokończ płatność",
    bothPaidReady: "Obaj zapłacili - Gotowe!",
    waitingFor: "Czekam na",
    viewShippingLabel: "Zobacz etykietę wysyłki",
    iHaveSentPackage: "Wysłałem paczkę",
    packageSent: "Paczka wysłana",
    skipToHubInspection: "Przejdź do inspekcji",
    everythingOK: "Wszystko w porządku",
    viewDetails: "Zobacz szczegóły",
    inspectionAccepted: "Inspekcja zaakceptowana",
    completeTrade: "Zakończ wymianę",
    to: "Do:",
    for: "Za:",
    
    // Messages page
    yourTradeConversations: "Twoje rozmowy handlowe",
    searchConversations: "Szukaj rozmów...",
    noConversationsYet: "Brak rozmów",
    noMessagesYet: "Brak wiadomości",
    selectAConversation: "Wybierz rozmowę",
    chooseConversation: "Wybierz rozmowę, aby rozpocząć czat",
    
    // Profile page
    editProfile: "Edytuj profil",
    joined: "Dołączył",
    lookingFor: "Szukam",
    activeListings: "Aktywne ogłoszenia",
    listings: "Ogłoszenia",
    tradeOffers: "Oferty wymiany",
    trades: "Wymiany",
    pastTransactions: "Przeszłe transakcje",
    past: "Przeszłe",
    noCompletedTransactions: "Brak ukończonych transakcji",
    sold: "Sprzedane",
    traded: "Wymienione"
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