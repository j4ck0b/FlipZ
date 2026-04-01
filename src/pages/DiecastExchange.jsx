import React from 'react';
import ExchangeView from '../components/exchange/ExchangeView';

export default function DiecastExchange() {
  return (
    <ExchangeView
      title="Diecast Exchange"
      description="Trade Hot Wheels and collectible cars"
      icon="🚗"
      allowedCategories={['hot_wheels']}
      gradient="from-blue-600 to-cyan-600"
    />
  );
}