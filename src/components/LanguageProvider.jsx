import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    title: "FlipCardZ",
    tagline: "Trade your collectibles safely and easily",
    searchPlaceholder: "Search cards, categories...",
    categories: "Categories",
    allCategories: "All Categories",
    condition: "Condition",
    rarity: "Rarity",
    value: "Estimated Value",
    listingDate: "Listing Date",
    sortBy: "Sort By",
    newest: "Newest",
    valueLowHigh: "Value: Low to High",
    valueHighLow: "Value: High to Low",
    signIn: "Sign In",
    signOut: "Sign Out",
    myProfile: "My Profile",
    myListings: "My Listings",
    myTrades: "My Trades",
    createListing: "List a Card",
    editListing: "Edit Listing",
    deleteListing: "Delete Listing",
    confirmDelete: "Are you sure you want to delete this listing?",
    save: "Save",
    cancel: "Cancel",
    description: "Description",
    lookingFor: "Looking For",
    sendOffer: "Send Trade Offer",
    viewDetails: "View Details",
    noListings: "No listings found",
    loading: "Loading...",
    error: "An error occurred",
    success: "Success!",
    tradeRequested: "Trade offer sent",
    tradeAccepted: "Trade accepted",
    tradeRejected: "Trade rejected",
    tradeCompleted: "Trade completed",
    status: "Status",
    actions: "Actions",
    accept: "Accept",
    reject: "Reject",
    chat: "Chat",
    send: "Send",
    typeMessage: "Type a message...",
    noMessages: "No messages",
    uploadImages: "Upload Images",
    maxImages: "Max 5 images",
    required: "This field is required",
    minChars: "Minimum {min} characters",
    priceRange: "Value Range",
    allConditions: "All Conditions",
    allRarities: "All Rarities",
    filter: "Filter",
    clearFilters: "Clear Filters",
    noOffersMade: "No offers made",
    yourOffersAppear: "Your trade offers will appear here",
    tradeOnly: "Trade Only",
    edit: "Edit",
    markAsSold: "Mark as Sold",
    itemNamePlaceholder: "e.g., Charizard Base Set 1st Edition",
    category: "Category",
    descriptionPlaceholder: "Describe the item, condition, any special details...",
    whatLookingForPlaceholder: "Describe what items you'd accept in trade...",
    updateListing: "Update Listing",
    listItem: "List Item",
    setDisplayNameFirst: "Please set your display name in your profile first",
    listingUpdated: "Listing updated successfully!",
    listingCreated: "Listing created successfully!",
    settings: "Settings",
    language: "Language",
    notifications: "Notifications"
  },
  pl: {
    title: "FlipCardZ",
    tagline: "Wymieniaj się kartami kolekcjonerskimi bezpiecznie i łatwo",
    searchPlaceholder: "Szukaj kart, kategorii...",
    categories: "Kategorie",
    allCategories: "Wszystkie kategorie",
    condition: "Stan",
    rarity: "Rzadkość",
    value: "Szacowana wartość",
    listingDate: "Data wystawienia",
    sortBy: "Sortuj według",
    newest: "Najnowsze",
    valueLowHigh: "Wartość: od najniższej",
    valueHighLow: "Wartość: od najwyższej",
    signIn: "Zaloguj się",
    signOut: "Wyloguj się",
    myProfile: "Mój profil",
    myListings: "Moje ogłoszenia",
    myTrades: "Moje wymiany",
    createListing: "Wystaw kartę",
    editListing: "Edytuj ogłoszenie",
    deleteListing: "Usuń ogłoszenie",
    confirmDelete: "Czy na pewno chcesz usunąć to ogłoszenie?",
    save: "Zapisz",
    cancel: "Anuluj",
    description: "Opis",
    lookingFor: "Szukam",
    sendOffer: "Wyślij ofertę wymiany",
    viewDetails: "Zobacz szczegóły",
    noListings: "Nie znaleziono żadnych ogłoszeń",
    loading: "Ładowanie...",
    error: "Wystąpił błąd",
    success: "Sukces!",
    tradeRequested: "Wysłano ofertę wymiany",
    tradeAccepted: "Zaakceptowano wymianę",
    tradeRejected: "Odrzucono wymianę",
    tradeCompleted: "Wymiana zakończona",
    status: "Status",
    actions: "Akcje",
    accept: "Akceptuj",
    reject: "Odrzuć",
    chat: "Czat",
    send: "Wyślij",
    typeMessage: "Wpisz wiadomość...",
    noMessages: "Brak wiadomości",
    uploadImages: "Dodaj zdjęcia",
    maxImages: "Maksymalnie 5 zdjęć",
    required: "To pole jest wymagane",
    minChars: "Minimum {min} znaki",
    priceRange: "Zakres wartości",
    allConditions: "Wszystkie stany",
    allRarities: "Wszystkie rzadkości",
    filter: "Filtruj",
    clearFilters: "Wyczyść filtry",
    noOffersMade: "Nie złożono ofert",
    yourOffersAppear: "Twoje oferty wymiany pojawią się tutaj",
    tradeOnly: "Tylko wymiana",
    edit: "Edytuj",
    markAsSold: "Oznacz jako sprzedane",
    itemNamePlaceholder: "np. Charizard Base Set 1st Edition",
    category: "Kategoria",
    descriptionPlaceholder: "Opisz przedmiot, stan, szczególne detale...",
    whatLookingForPlaceholder: "Opisz, jakie przedmioty zaakceptujesz w zamian...",
    updateListing: "Zaktualizuj ogłoszenie",
    listItem: "Wystaw przedmiot",
    setDisplayNameFirst: "Najpierw ustaw swoją nazwę wyświetlaną w profilu",
    listingUpdated: "Ogłoszenie zaktualizowane!",
    listingCreated: "Ogłoszenie zostało wystawione!",
    settings: "Ustawienia",
    language: "Język",
    notifications: "Powiadomienia"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'pl');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
