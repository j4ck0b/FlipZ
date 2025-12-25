import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { base44 } from '@/api/base44Client';
import { Upload, X, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function PackagePhotoUpload({ open, onClose, tradeOffer, userRole, onSuccess }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => base44.integrations.Core.UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const newPhotos = results.map(r => r.file_url);
      setPhotos([...photos, ...newPhotos]);
      toast.success(`${files.length} photo(s) uploaded`);
    } catch (error) {
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }

    try {
      const field = userRole === 'sender' ? 'sender_package_photos' : 'owner_package_photos';
      await base44.entities.TradeOffer.update(tradeOffer.id, {
        [field]: photos,
        progress_step: 'shipping_to_hub'
      });
      toast.success('Package photos uploaded successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save photos');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Upload Package Photos
          </DialogTitle>
          <p className="text-sm text-slate-600 mt-2">
            Take photos of your packaged items before shipping. Include all items clearly visible.
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-violet-400 transition-colors">
            <input
              type="file"
              id="photo-upload"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              {uploading ? (
                <Loader2 className="w-12 h-12 mx-auto text-slate-400 animate-spin mb-3" />
              ) : (
                <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              )}
              <p className="text-slate-600 font-medium">
                {uploading ? 'Uploading...' : 'Click to upload photos'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                PNG, JPG up to 10MB each
              </p>
            </label>
          </div>

          {/* Photo Grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <AnimatePresence>
                {photos.map((photo, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group"
                  >
                    <Card className="overflow-hidden">
                      <img
                        src={photo}
                        alt={`Package ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                    </Card>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tips:</strong> Include photos from multiple angles showing all items clearly. 
              These photos help protect both parties in case of disputes.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={photos.length === 0}
            className="flex-1 bg-violet-600 hover:bg-violet-700"
          >
            Confirm & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}