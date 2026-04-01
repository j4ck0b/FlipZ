import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { flipzApi } from '@/api/apiClient';
import { Upload, Loader2, Camera, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

const CATEGORIES = [
  { id: "pokemon", label: "Pokémon" },
  { id: "magic_the_gathering", label: "Magic: The Gathering" },
  { id: "yugioh", label: "Yu-Gi-Oh!" },
  { id: "sports", label: "Sports" },
  { id: "other", label: "Other" }
];

export default function EditProfileModal({ open, onClose, user, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    profile_picture: '',
    bio: '',
    location: '',
    interested_in: [],
    looking_for: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        profile_picture: user.profile_picture || '',
        bio: user.bio || '',
        location: user.location || '',
        interested_in: user.interested_in || [],
        looking_for: user.looking_for || ''
      });
    }
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const result = await flipzApi.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, profile_picture: result.file_url }));
    setUploading(false);
  };

  const handleInterestToggle = (categoryId) => {
    setFormData(prev => {
      const interested = [...prev.interested_in];
      const index = interested.indexOf(categoryId);
      if (index > -1) {
        interested.splice(index, 1);
      } else {
        interested.push(categoryId);
      }
      return { ...prev, interested_in: interested };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Update profile in the profiles table via supabase directly
    const me = await flipzApi.auth.me();
    if (me?.id) {
      const { supabase } = await import('@/api/apiClient');
      const { error } = await supabase.from('profiles').upsert({ id: me.id, ...formData });
      if (error) throw error;
    }
    
    toast.success('Profile updated successfully!');
    setLoading(false);
    onSuccess();
    onClose();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Profile</DialogTitle>
          <DialogDescription>Update your public profile information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Display Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Your name as it appears to others"
              required
            />
          </div>

          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={formData.profile_picture} />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-2xl">
                  {getInitials(user?.full_name)}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors shadow-lg">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploading ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </label>
            </div>
            {formData.profile_picture && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, profile_picture: '' }))}
              >
                <X className="w-4 h-4 mr-1" />
                Remove Photo
              </Button>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell others about yourself and your collection..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-slate-500 text-right">
              {formData.bio.length}/500
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., New York, USA"
            />
          </div>

          {/* Interested Categories */}
          <div className="space-y-3">
            <Label>Interested In</Label>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={formData.interested_in.includes(category.id)}
                    onCheckedChange={() => handleInterestToggle(category.id)}
                  />
                  <label
                    htmlFor={category.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Looking For */}
          <div className="space-y-2">
            <Label htmlFor="looking_for">What I'm Looking For</Label>
            <Textarea
              id="looking_for"
              value={formData.looking_for}
              onChange={(e) => setFormData(prev => ({ ...prev, looking_for: e.target.value }))}
              placeholder="Describe specific cards or sets you're hunting for..."
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-slate-900 hover:bg-slate-800">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}