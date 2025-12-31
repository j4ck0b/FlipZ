import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { base44 } from '@/api/base44Client';
import { Upload, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from '../LanguageProvider';

export default function ListingModal({ open, onClose, onSuccess, editListing = null, defaultCategory = null }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'pokemon',
    condition: 'near_mint',
    rarity: 'common',
    looking_for: '',
    image_url: ''
  });

  useEffect(() => {
    if (editListing) {
      setFormData({
        title: editListing.title || '',
        description: editListing.description || '',
        category: editListing.category || 'pokemon',
        condition: editListing.condition || 'near_mint',
        rarity: editListing.rarity || 'common',
        looking_for: editListing.looking_for || '',
        image_url: editListing.image_url || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: defaultCategory || 'pokemon',
        condition: 'near_mint',
        rarity: 'common',
        looking_for: '',
        image_url: ''
      });
    }
  }, [editListing, open, defaultCategory]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const result = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, image_url: result.file_url }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const user = await base44.auth.me();
    
    // Check if user has a display name set
    if (!user.full_name) {
      toast.error(t('setDisplayNameFirst'));
      setLoading(false);
      return;
    }
    
    const data = {
      ...formData,
      looking_for: formData.looking_for || 'Open to offers',
      collector_name: user.full_name,
      status: 'available'
    };

    if (editListing) {
      await base44.entities.CardListing.update(editListing.id, data);
      toast.success(t('listingUpdated'));
    } else {
      await base44.entities.CardListing.create(data);
      toast.success(t('cardListed'));
    }
    
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editListing ? t('editListing') : t('listItemForTrade')}
          </DialogTitle>
          <DialogDescription>
            {editListing ? t('updateListingDetails') : t('fillDetailsToList')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>{t('cardImage')}</Label>
            <div className="relative">
              {formData.image_url ? (
                <div className="relative aspect-[3/4] max-h-48 w-auto mx-auto rounded-xl overflow-hidden bg-slate-100">
                  <img 
                    src={formData.image_url} 
                    alt="Card" 
                    className="w-full h-full object-contain"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                  >
                    {t('remove')}
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-500">{t('clickToUpload')}</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t('itemName')} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('itemNamePlaceholder')}
              required
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('category')} *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pokemon">Pokémon</SelectItem>
                  <SelectItem value="magic_the_gathering">Magic: The Gathering</SelectItem>
                  <SelectItem value="yugioh">Yu-Gi-Oh!</SelectItem>
                  <SelectItem value="sports">Sports Cards</SelectItem>
                  <SelectItem value="lego_minifigures">LEGO</SelectItem>
                  <SelectItem value="funko_pop">Funko Pop</SelectItem>
                  <SelectItem value="anime_figures">Anime Figures</SelectItem>
                  <SelectItem value="designer_toys">Designer Toys</SelectItem>
                  <SelectItem value="hot_wheels">Hot Wheels</SelectItem>
                  <SelectItem value="retro_games">Retro Games</SelectItem>
                  <SelectItem value="vinyl_records">Vinyl Records</SelectItem>
                  <SelectItem value="sneakers">Sneakers</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('condition')} *</Label>
              <Select 
                value={formData.condition} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, condition: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mint">Mint</SelectItem>
                  <SelectItem value="near_mint">Near Mint</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rarity */}
          <div className="space-y-2">
            <Label>{t('rarity')}</Label>
            <Select 
              value={formData.rarity} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, rarity: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="uncommon">Uncommon</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="ultra_rare">Ultra Rare</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('descriptionPlaceholder')}
              rows={3}
            />
          </div>

          {/* Estimated Value */}
          <div className="space-y-2">
            <Label htmlFor="estimated_value">{t('estimatedValue')}</Label>
            <Input
              id="estimated_value"
              value={formData.estimated_value || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_value: e.target.value }))}
              placeholder={t('estimatedValuePlaceholder')}
            />
            <p className="text-xs text-slate-500">{t('forReferenceOnly')}</p>
          </div>

          {/* Looking For */}
          <div className="space-y-2">
            <Label htmlFor="looking_for">{t('whatLookingFor')} *</Label>
            <Textarea
              id="looking_for"
              value={formData.looking_for}
              onChange={(e) => setFormData(prev => ({ ...prev, looking_for: e.target.value }))}
              placeholder={t('whatLookingForPlaceholder')}
              rows={3}
              required
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-slate-900 hover:bg-slate-800">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editListing ? t('updateListing') : t('listItem')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}