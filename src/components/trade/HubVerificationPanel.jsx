import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { Upload, X, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function HubVerificationPanel({ open, onClose, tradeOffer, packageType, onSuccess }) {
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('passed');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isSenderPackage = packageType === 'sender';
  const escrowMode = tradeOffer.escrow_mode || 'light';

  const verificationRequirements = {
    eco: [
      'Confirm all declared items are physically present',
      'Count matches the expected number',
      'Take clear photos of contents'
    ],
    light: [
      'Verify all declared items are present',
      'Check items match descriptions (type, completeness)',
      'Look for obvious inconsistencies',
      'Document with detailed photos'
    ],
    full: [
      'Complete presence verification',
      'Full condition assessment',
      'Authenticity check when applicable',
      'Professional grading notes',
      'Comprehensive photo documentation'
    ]
  };

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

  const handleSubmit = async () => {
    if (photos.length === 0) {
      toast.error('Please upload verification photos');
      return;
    }

    setSubmitting(true);
    try {
      const updates = {
        [isSenderPackage ? 'hub_photos_sender_package' : 'hub_photos_owner_package']: photos,
        [isSenderPackage ? 'hub_verification_sender' : 'hub_verification_owner']: status,
        [isSenderPackage ? 'hub_notes_sender' : 'hub_notes_owner']: notes
      };

      // Check if both packages are now verified
      const otherPackageVerified = isSenderPackage 
        ? tradeOffer.hub_verification_owner === 'passed'
        : tradeOffer.hub_verification_sender === 'passed';

      if (status === 'passed' && otherPackageVerified) {
        updates.progress_step = 'shipping_to_users';
      } else if (status === 'failed') {
        updates.status = 'failed';
        updates.progress_step = 'failed';
      }

      await base44.entities.TradeOffer.update(tradeOffer.id, updates);
      toast.success('Verification completed');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save verification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hub Verification - {isSenderPackage ? 'Sender' : 'Owner'} Package</DialogTitle>
          <Badge variant="outline" className="mt-2 w-fit">
            Escrow {escrowMode.charAt(0).toUpperCase() + escrowMode.slice(1)}
          </Badge>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Requirements */}
          <Card className="p-4 bg-slate-50">
            <h4 className="font-semibold text-slate-900 mb-3">Verification Requirements</h4>
            <ul className="space-y-2">
              {verificationRequirements[escrowMode].map((req, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* User's Original Photos */}
          {(isSenderPackage ? tradeOffer.sender_package_photos : tradeOffer.owner_package_photos)?.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">User's Photos</h4>
              <div className="grid grid-cols-4 gap-2">
                {(isSenderPackage ? tradeOffer.sender_package_photos : tradeOffer.owner_package_photos).map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`User photo ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Verification Photos Upload */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Verification Photos</h4>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
              <input
                type="file"
                id="verification-upload"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <label htmlFor="verification-upload" className="cursor-pointer">
                {uploading ? (
                  <Loader2 className="w-10 h-10 mx-auto text-slate-400 animate-spin mb-2" />
                ) : (
                  <Upload className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                )}
                <p className="text-sm text-slate-600 font-medium">
                  {uploading ? 'Uploading...' : 'Click to upload inspection photos'}
                </p>
              </label>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Verification ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-900 mb-2">
              Verification Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter detailed verification notes..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Status Selection */}
          <div>
            <label className="block font-semibold text-slate-900 mb-2">
              Verification Result
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={status === 'passed' ? 'default' : 'outline'}
                onClick={() => setStatus('passed')}
                className={status === 'passed' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Pass
              </Button>
              <Button
                variant={status === 'failed' ? 'default' : 'outline'}
                onClick={() => setStatus('failed')}
                className={status === 'failed' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Fail
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={submitting || photos.length === 0}
            className="flex-1 bg-violet-600 hover:bg-violet-700"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Verification'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}