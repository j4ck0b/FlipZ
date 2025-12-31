import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageProvider';

export default function CardFilters({ filters, setFilters }) {
  const { t } = useLanguage();
  
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      condition: 'all',
      rarity: 'all',
      tradeOnly: false,
      priceRange: [0, 10000]
    });
  };

  const hasActiveFilters = filters.search || 
    filters.category !== 'all' || 
    filters.condition !== 'all' || 
    filters.rarity !== 'all' || 
    filters.tradeOnly;

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
      {/* Search */}
      <div className="relative flex-1 w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder={t('search')}
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10 bg-white border-slate-200 focus:border-violet-500 h-11"
        />
      </div>

      {/* Quick filters - visible on desktop */}
      <div className="hidden md:flex items-center gap-3">
        <Select value={filters.category} onValueChange={(v) => updateFilter('category', v)}>
          <SelectTrigger className="w-[160px] bg-white border-slate-200 h-11">
            <SelectValue placeholder={t('allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allCategories')}</SelectItem>
            <SelectItem value="pokemon">{t('pokemon')}</SelectItem>
            <SelectItem value="magic_the_gathering">{t('magicTheGathering')}</SelectItem>
            <SelectItem value="yugioh">{t('yugioh')}</SelectItem>
            <SelectItem value="sports">{t('sports')}</SelectItem>
            <SelectItem value="other">{t('other')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.condition} onValueChange={(v) => updateFilter('condition', v)}>
          <SelectTrigger className="w-[140px] bg-white border-slate-200 h-11">
            <SelectValue placeholder={t('condition')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allConditions')}</SelectItem>
            <SelectItem value="mint">{t('mint')}</SelectItem>
            <SelectItem value="near_mint">{t('nearMint')}</SelectItem>
            <SelectItem value="excellent">{t('excellent')}</SelectItem>
            <SelectItem value="good">{t('good')}</SelectItem>
            <SelectItem value="fair">{t('fair')}</SelectItem>
            <SelectItem value="poor">{t('poor')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.rarity} onValueChange={(v) => updateFilter('rarity', v)}>
          <SelectTrigger className="w-[130px] bg-white border-slate-200 h-11">
            <SelectValue placeholder={t('rarity')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allRarities')}</SelectItem>
            <SelectItem value="common">{t('common')}</SelectItem>
            <SelectItem value="uncommon">{t('uncommon')}</SelectItem>
            <SelectItem value="rare">{t('rare')}</SelectItem>
            <SelectItem value="ultra_rare">{t('ultraRare')}</SelectItem>
            <SelectItem value="legendary">{t('legendary')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile filters */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="md:hidden w-full h-11 border-slate-200">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {t('filters')}
            {hasActiveFilters && (
              <span className="ml-2 w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{t('filters')}</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label>{t('allCategories')}</Label>
              <Select value={filters.category} onValueChange={(v) => updateFilter('category', v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCategories')}</SelectItem>
                  <SelectItem value="pokemon">{t('pokemon')}</SelectItem>
                  <SelectItem value="magic_the_gathering">{t('magicTheGathering')}</SelectItem>
                  <SelectItem value="yugioh">{t('yugioh')}</SelectItem>
                  <SelectItem value="sports">{t('sports')}</SelectItem>
                  <SelectItem value="other">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('condition')}</Label>
              <Select value={filters.condition} onValueChange={(v) => updateFilter('condition', v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('condition')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allConditions')}</SelectItem>
                  <SelectItem value="mint">{t('mint')}</SelectItem>
                  <SelectItem value="near_mint">{t('nearMint')}</SelectItem>
                  <SelectItem value="excellent">{t('excellent')}</SelectItem>
                  <SelectItem value="good">{t('good')}</SelectItem>
                  <SelectItem value="fair">{t('fair')}</SelectItem>
                  <SelectItem value="poor">{t('poor')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('rarity')}</Label>
              <Select value={filters.rarity} onValueChange={(v) => updateFilter('rarity', v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('rarity')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allRarities')}</SelectItem>
                  <SelectItem value="common">{t('common')}</SelectItem>
                  <SelectItem value="uncommon">{t('uncommon')}</SelectItem>
                  <SelectItem value="rare">{t('rare')}</SelectItem>
                  <SelectItem value="ultra_rare">{t('ultraRare')}</SelectItem>
                  <SelectItem value="legendary">{t('legendary')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>{t('tradeOnly')}</Label>
              <Switch 
                checked={filters.tradeOnly}
                onCheckedChange={(v) => updateFilter('tradeOnly', v)}
              />
            </div>

            <Button onClick={clearFilters} variant="outline" className="w-full">
              <X className="w-4 h-4 mr-2" />
              {t('clearAllFilters')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Clear filters button */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={clearFilters}
          className="hidden md:flex text-slate-500 hover:text-slate-700"
        >
          <X className="w-4 h-4 mr-1" />
          {t('clear')}
        </Button>
      )}
    </div>
  );
}