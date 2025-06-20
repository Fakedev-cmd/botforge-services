
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/contexts/TranslationContext';
import { Upload } from 'lucide-react';

interface AvatarUploaderProps {
  onUpload: (filePath: string) => void;
}

const AvatarUploader = ({ onUpload }: AvatarUploaderProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [uploading, setUploading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
      toast({
        title: t('profile.avatar.uploadSuccessTitle'),
        description: t('profile.avatar.uploadSuccessDesc'),
      });
    } catch (error: any) {
      toast({
        title: t('profile.avatar.uploadErrorTitle'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="space-y-4">
        <Input type="file" onChange={handleFileChange} accept="image/*" disabled={uploading} className="file:text-foreground" />
        <Button onClick={handleUpload} disabled={uploading || !file} className="w-full">
            {uploading ? t('profile.avatar.uploading') : <><Upload className="mr-2 h-4 w-4" /> {t('profile.avatar.uploadButton')}</>}
        </Button>
    </div>
  );
};

export default AvatarUploader;
