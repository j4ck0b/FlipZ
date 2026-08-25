import React from 'react';
import ExchangeView from '../components/exchange/ExchangeView';

export default function FigureExchange() {
  return (
    <ExchangeView
      title="Giełda Figurek & Statuetek"
      description="Funko Pop Grail, Action Figures i rzadkie figurki kolekcjonerskie"
      allowedCategories={['action_figures', 'funko_pop', 'figures', 'anime_figures']}
    />
  );
}