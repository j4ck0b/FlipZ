import React from 'react';
import ExchangeView from '../components/exchange/ExchangeView';

export default function DiecastExchange() {
  return (
    <ExchangeView
      title="Giełda Modeli Aut & Diecast"
      description="Hot Wheels RLC, modele 1:18, 1:43 i rzadkie okazy diecast"
      allowedCategories={['hot_wheels', 'diecast', 'model_cars']}
    />
  );
}