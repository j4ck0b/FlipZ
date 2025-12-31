import React from 'react';
import ExchangeView from '../components/exchange/ExchangeView';
import { useLanguage } from '../components/LanguageProvider';

export default function CardExchange() {
  const { t } = useLanguage();
  
  return (
    <ExchangeView
      title={t('cardExchangeTitle')}
      description={t('cardExchangeDesc')}
      icon="🃏"
      allowedCategories={['pokemon', 'magic_the_gathering', 'yugioh', 'sports']}
      subcategories={[
        { label: t('pokemon'), value: 'pokemon' },
        { label: t('magicTheGathering'), value: 'magic_the_gathering' },
        { label: t('yugioh'), value: 'yugioh' },
        { label: t('sports'), value: 'sports' }
      ]}
      gradient="from-violet-600 to-indigo-600"
    />
  );
}