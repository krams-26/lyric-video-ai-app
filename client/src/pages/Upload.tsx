import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import AudioUploader from '@/components/AudioUploader';

const MUSIC_STYLES = ['Orchestra', 'Jazz', 'Rock', 'EDM', 'Lo-fi', 'Classical'] as const;
const BACKGROUND_THEMES = ['dark', 'light', 'gradient', 'abstract'] as const;
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [musicStyle, setMusicStyle] = useState<typeof MUSIC_STYLES[number]>('Orchestra');
  const [backgroundTheme, setBackgroundTheme] = useState<typeof BACKGROUND_THEMES[number]>('dark');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();

  const createProject = trpc.projects.create.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Format de fichier non supporté. Utilisez MP3, WAV, ou M4A.');
      setFile(null);
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`Fichier trop volumineux. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      setFile(null);
      return;
    }

    setError('');
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Veuillez sélectionner un fichier audio');
      return;
    }

    if (!title.trim()) {
      setError('Veuillez entrer un titre pour votre projet');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Upload file to S3 and get URL
      const audioUrl = 'https://example.com/audio.mp3'; // Placeholder

      await createProject.mutateAsync({
        title,
        audioUrl,
        musicStyle,
        backgroundTheme,
      });

      navigate('/projects');
    } catch (err) {
      setError('Erreur lors de la création du projet. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">LyricVideo AI</h1>
          </div>
          <p className="text-gray-300">Transformez votre musique et générez des vidéos de paroles synchronisées</p>
        </div>

        {/* Main Card */}
        <Card className="bg-slate-800 border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-3">
              <Label className="text-white">Fichier Audio</Label>
              <AudioUploader onFileSelect={setFile} selectedFile={file} isLoading={isLoading} />
            </div>

            {/* Project Title */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-white">Titre du Projet</Label>
              <Input
                id="title"
                placeholder="Ex: Ma chanson transformée"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-gray-500"
                disabled={isLoading}
              />
            </div>

            {/* Music Style */}
            <div className="space-y-3">
              <Label className="text-white">Style Musical</Label>
              <Select value={musicStyle} onValueChange={(value: any) => setMusicStyle(value)} disabled={isLoading}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {MUSIC_STYLES.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Background Theme */}
            <div className="space-y-3">
              <Label className="text-white">Thème d'Arrière-plan</Label>
              <Select value={backgroundTheme} onValueChange={(value: any) => setBackgroundTheme(value)} disabled={isLoading}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {BACKGROUND_THEMES.map((theme) => (
                    <SelectItem key={theme} value={theme}>
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3"
              disabled={isLoading || !file}
            >
              {isLoading ? 'Traitement...' : 'Créer le Projet'}
            </Button>
          </form>
        </Card>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">1</div>
            <p className="text-gray-300">Uploadez votre chanson</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">2</div>
            <p className="text-gray-300">Transformez le style</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">3</div>
            <p className="text-gray-300">Générez la vidéo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
