import React from 'react';
import ExchangeView from '../components/exchange/ExchangeView';

export default function CollectibleExchange() {
  return (
    <ExchangeView
      title="Giełda Memorabiliów & Kolekcji"
      description="Retro gaming, autografy, monety i unikatowe przedmioty kolekcjonerskie"
      allowedCategories={['collectibles', 'retro_games', 'trading_cards', 'memorabilia']}
    />
  );
}