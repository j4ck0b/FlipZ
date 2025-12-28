import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { Camera, Loader2, CheckCircle2, Upload } from "lucide-react";
import { toast } from "sonner";

export default function HubInspectionSimulator({ open, onClose, tradeOffer, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  React.useEffect(() => {
    if (open && photos.length === 0) {
      // Auto-populate with random placeholder images
      const randomPhotos = [
        'https://images.unsplash.com/photo-1611082800515-000da5b5a7ba?w=400',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        'https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=400',
        'https://images.unsplash.com/photo-1542838309-af0e443e222b?w=400'
      ];
      setPhotos(randomPhotos);
    }
  }, [open]);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    
    const uploadedUrls = [];
    for (const file of files) {
      const result = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(result.file_url);
    }
    
    setPhotos([...photos, ...uploadedUrls]);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      toast.error('Please upload at least one inspection photo');
      return;
    }

    setSubmitting(true);
    
    // Determine which package photos to update based on current user
    const isSender = currentUser?.email === tradeOffer.sender_email;
    const photoField = isSender ? 'hub_photos_sender_package' : 'hub_photos_owner_package';
    const verificationField = isSender ? 'hub_verification_sender' : 'hub_verification_owner';
    const notesField = isSender ? 'hub_notes_sender' : 'hub_notes_owner';
    
    const updates = {
      [photoField]: photos,
      [verificationField]: 'passed',
      [notesField]: 'Package verified and in good condition'
    };
    
    // Check if both packages have been inspected
    const otherPhotoField = isSender ? 'hub_photos_owner_package' : 'hub_photos_sender_package';
    if (tradeOffer[otherPhotoField] && tradeOffer[otherPhotoField].length > 0) {
      updates.progress_step = 'hub_verification';
    }
    
    await base44.entities.TradeOffer.update(tradeOffer.id, updates);
    
    setSubmitting(false);
    toast.success('Hub inspection completed!');
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Hub Inspection</DialogTitle>
          <p className="text-sm text-slate-600">Simulate hub verification process</p>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800">
                🔍 This simulates the hub inspection process. Upload photos to verify the trade items.
              </p>
            </CardContent>
          </Card>

          {/* Upload Area */}
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-2" />
                  <span className="text-sm text-slate-500">Uploading...</span>
                </>
              ) : (
                <>
                  <Camera className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600 font-medium">Upload Inspection Photos</span>
                  <span className="text-xs text-slate-500">Click to select images</span>
                </>
              )}
            </label>

            {/* Uploaded Photos */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                    <img src={url} alt={`Inspection ${idx + 1}`} className="w-full h-full object-cover" />
                    <Badge className="absolute top-2 right-2 bg-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={submitting} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || photos.length === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete Inspection
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}