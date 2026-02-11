import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { base44 } from '@/api/base44Client';
import { Upload, Loader2, ImageIcon, X } from "lucide-react";
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
    image_urls: []
  });

  useEffect(() => {
    if (editListing) {
      const images = editListing.image_urls || (editListing.image_url ? [editListing.image_url] : []);
      setFormData({
        title: editListing.title || '',
        description: editListing.description || '',
        category: editListing.category || 'pokemon',
        condition: editListing.condition || 'near_mint',
        rarity: editListing.rarity || 'common',
        looking_for: editListing.looking_for || '',
        image_urls: images
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: defaultCategory || 'pokemon',
        condition: 'near_mint',
        rarity: 'common',
        looking_for: '',
        image_urls: []
      });
    }
  }, [editListing, open, defaultCategory]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const currentImages = formData.image_urls.length;
    const maxImages = 10;
    
    if (currentImages >= maxImages) {
      toast.error(`Maximum ${maxImages} photos allowed`);
      return;
    }
    
    const remainingSlots = maxImages - currentImages;
    const filesToUpload = files.slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} photo(s) can be added (max ${maxImages} total)`);
    }
    
    setUploading(true);
    const uploadedUrls = [];
    
    for (const file of filesToUpload) {
      // Upload original
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      
      // Compress the image
      const compressResult = await base44.functions.invoke('compressImage', { 
        imageUrl: uploadResult.file_url 
      });
      
      // Use compressed version
      uploadedUrls.push(compressResult.data.compressedUrl);
    }
    
    setFormData(prev => ({ 
      ...prev, 
      image_urls: [...prev.image_urls, ...uploadedUrls] 
    }));
    setUploading(false);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await base44.auth.me();
      if (!user?.id) {
        throw new Error('You must be logged in to create a listing.');
      }

      const collectorName = user.user_metadata?.full_name
        || user.user_metadata?.name
        || user.email?.split('@')[0]
        || 'Collector';

      const data = {
        ...formData,
        looking_for: formData.looking_for || 'Open to offers',
        collector_name: collectorName,
        status: 'available',
        created_by: user.id,
        created_by_id: user.id
      };

      if (editListing) {
        await base44.entities.CardListing.update(editListing.id, data);
        toast.success(t('listingUpdated'));
      } else {
        await base44.entities.CardListing.create(data);
        toast.success(
          <div className="flex flex-col gap-1">
            <div className="font-semibold">🎉 {t('cardListed')}</div>
            <div className="text-sm opacity-90">Your item is now live on the marketplace!</div>
          </div>,
          { duration: 4000 }
        );
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving listing:', error);
      toast.error(error?.message || 'Could not save listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto panel-elevated text-slate-100">
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
            <Label>
              {t('cardImage')} ({formData.image_urls.length}/10)
            </Label>
            
            {/* Image Grid */}
            {formData.image_urls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {formData.image_urls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-slate-900/70 group">
                    <img 
                      src={url} 
                      alt={`Product ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
                        Main
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload Button */}
            {formData.image_urls.length < 10 && (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-600/60 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-slate-900/40 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                    <span className="text-sm text-slate-200">{t('clickToUpload')}</span>
                    <span className="text-xs text-slate-400 mt-1">Max 10 photos</span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t('itemName')} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('itemNamePlaceholder')}
              className="input-contrast"
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
                <SelectTrigger className="input-contrast">
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
                  <SelectItem value="figures">Figures</SelectItem>
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
                <SelectTrigger className="input-contrast">
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
              <SelectTrigger className="input-contrast">
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
              className="input-contrast"
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
              className="input-contrast"
            />
            <p className="text-xs text-slate-400">{t('forReferenceOnly')}</p>
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
              className="input-contrast"
              required
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-slate-500/60 text-slate-200 hover:bg-slate-800/60">
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editListing ? t('updateListing') : t('listItem')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
