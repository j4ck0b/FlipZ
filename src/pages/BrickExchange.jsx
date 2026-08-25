import React from 'react';
import ExchangeView from '../components/exchange/ExchangeView';

export default function BrickExchange() {
  return (
    <ExchangeView
      title="Giełda LEGO & Klocków"
      description="Wymieniaj zestawy LEGO, unikatowe figurki i rzadkie sety z weryfikacją Hub"
      allowedCategories={['lego', 'lego_bricks', 'lego_minifigures']}
    />
  );
}