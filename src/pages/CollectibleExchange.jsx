import React from 'react';
import ExchangeView from '../components/exchange/ExchangeView';

export default function CollectibleExchange() {
  return (
    <ExchangeView
      title="Collectible Exchange"
      description="Trade retro games, vinyl, and sneakers"
      icon="🎮"
      allowedCategories={['retro_games', 'vinyl_records', 'sneakers']}
      subcategories={[
        { label: 'Retro Games', value: 'retro_games' },
        { label: 'Vinyl Records', value: 'vinyl_records' },
        { label: 'Sneakers', value: 'sneakers' }
      ]}
      gradient="from-green-600 to-emerald-600"
    />
  );
}