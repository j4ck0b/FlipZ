import React from 'react';
import ExchangeView from '../components/exchange/ExchangeView';

export default function BrickExchange() {
  return (
    <ExchangeView
      title="Brick Exchange"
      description="Trade LEGO sets and minifigures"
      icon="🧱"
      allowedCategories={['lego_minifigures']}
      gradient="from-red-600 to-orange-600"
    />
  );
}