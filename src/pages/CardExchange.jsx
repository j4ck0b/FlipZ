import React from 'react';
import ExchangeView from '../components/exchange/ExchangeView';

export default function CardExchange() {
  return (
    <ExchangeView
      title="Card Exchange"
      description="Trade collectible cards with collectors worldwide"
      icon="🃏"
      allowedCategories={['pokemon', 'magic_the_gathering', 'yugioh', 'sports']}
      subcategories={[
        { label: 'Pokémon', value: 'pokemon' },
        { label: 'Magic: The Gathering', value: 'magic_the_gathering' },
        { label: 'Yu-Gi-Oh!', value: 'yugioh' },
        { label: 'Sports Cards', value: 'sports' }
      ]}
      gradient="from-violet-600 to-indigo-600"
    />
  );
}