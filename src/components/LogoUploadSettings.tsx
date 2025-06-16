
import React, { useCallback, useState } from 'react';
import { useLogoSettings } from '@/hooks/useLogoSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const LogoUploadSettings: React.FC = () => {
  const { settings, loading, updateSettings, uploadLogo } = useLogoSettings();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      await uploadLogo(file);
    } finally {
      setUploading(false);
    }
  }, [uploadLogo]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
    e.target.value = '';
  }, [handleFileUpload]);

  const removeLogo = async () => {
    await updateSettings({ logo_url: null });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Logo Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Logo Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload Area */}
        <div className="space-y-4">
          <Label>Company Logo</Label>
          
          {settings?.logo_url ? (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={settings.logo_url} 
                  alt="Company Logo" 
                  className="h-20 w-auto border rounded shadow-sm"
                  style={{ maxWidth: `${settings.logo_width}px`, maxHeight: `${settings.logo_height}px` }}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2"
                  onClick={removeLogo}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => document.getElementById('logo-upload')?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Replace Logo
              </Button>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your logo here, or click to select
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG up to 5MB
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => document.getElementById('logo-upload')?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Select Logo'}
              </Button>
            </div>
          )}
          
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Logo Position Settings */}
        {settings?.logo_url && (
          <>
            <div className="space-y-3">
              <Label>Logo Position</Label>
              <RadioGroup
                value={settings.logo_position}
                onValueChange={(value) => updateSettings({ logo_position: value as any })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="top-center" id="top-center" />
                  <Label htmlFor="top-center">Top Center (Header Style)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="watermark" id="watermark" />
                  <Label htmlFor="watermark">Background Watermark</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both">Both Positions</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Logo Size Settings */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Logo Width: {settings.logo_width}px</Label>
                <Slider
                  value={[settings.logo_width]}
                  onValueChange={([value]) => updateSettings({ logo_width: value })}
                  min={50}
                  max={300}
                  step={10}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Logo Height: {settings.logo_height}px</Label>
                <Slider
                  value={[settings.logo_height]}
                  onValueChange={([value]) => updateSettings({ logo_height: value })}
                  min={25}
                  max={150}
                  step={5}
                />
              </div>
            </div>

            {/* Watermark Opacity */}
            {(settings.logo_position === 'watermark' || settings.logo_position === 'both') && (
              <div className="space-y-2">
                <Label>Watermark Opacity: {(settings.watermark_opacity * 100).toFixed(0)}%</Label>
                <Slider
                  value={[settings.watermark_opacity]}
                  onValueChange={([value]) => updateSettings({ watermark_opacity: value })}
                  min={0.01}
                  max={0.3}
                  step={0.01}
                />
              </div>
            )}

            {/* Display Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-drafts">Show on Draft Estimates</Label>
                <Switch
                  id="show-drafts"
                  checked={settings.show_on_drafts}
                  onCheckedChange={(checked) => updateSettings({ show_on_drafts: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-approved">Show on Approved Estimates</Label>
                <Switch
                  id="show-approved"
                  checked={settings.show_on_approved}
                  onCheckedChange={(checked) => updateSettings({ show_on_approved: checked })}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LogoUploadSettings;
