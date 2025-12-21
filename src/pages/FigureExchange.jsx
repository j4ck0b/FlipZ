import React from 'react';
import ExchangeView from '../components/exchange/ExchangeView';

export default function FigureExchange() {
  return (
    <ExchangeView
      title="Figure Exchange"
      description="Trade Funko, anime figures, and designer toys"
      icon="🧸"
      allowedCategories={['funko_pop', 'anime_figures', 'designer_toys']}
      subcategories={[
        { label: 'Funko Pop', value: 'funko_pop' },
        { label: 'Anime Figures', value: 'anime_figures' },
        { label: 'Designer Toys', value: 'designer_toys' }
      ]}
      gradient="from-pink-600 to-purple-600"
    />
  );
}