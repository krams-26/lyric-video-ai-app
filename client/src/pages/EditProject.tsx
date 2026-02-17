import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Download, ArrowLeft } from 'lucide-react';
import { useLocation, useRoute } from 'wouter';
import { trpc } from '@/lib/trpc';
import LyricsViewer from '@/components/LyricsViewer';

interface LyricLine {
  text: string;
  startTime: number;
  endTime: number;
}

export default function EditProject() {
  const [match, params] = useRoute('/projects/:id/edit');
  const [, navigate] = useLocation();
  const projectId = params?.id ? parseInt(params.id) : 0;

  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [lyricsText, setLyricsText] = useState('');
  const [backgroundTheme, setBackgroundTheme] = useState('dark');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { data: project } = trpc.projects.getById.useQuery({ projectId });
  const { data: projectLyrics } = trpc.projects.getLyrics.useQuery({ projectId });
  const updateLyrics = trpc.projects.updateLyrics.useMutation();
  const renderVideo = trpc.projects.renderVideo.useMutation();

  useEffect(() => {
    if (projectLyrics) {
      setLyrics(projectLyrics.lyricsJson);
      setLyricsText(projectLyrics.content);
    }
  }, [projectLyrics]);

  const handleSaveLyrics = async () => {
    setIsLoading(true);
    try {
      await updateLyrics.mutateAsync({
        projectId,
        content: lyricsText,
        lyricsJson: lyrics,
      });
      alert('Paroles mises à jour avec succès!');
    } catch (error) {
      alert('Erreur lors de la sauvegarde des paroles');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenderVideo = async () => {
    setIsLoading(true);
    try {
      await renderVideo.mutateAsync({ projectId });
      alert('Rendu vidéo lancé! Cela peut prendre quelques minutes.');
    } catch (error) {
      alert('Erreur lors du rendu vidéo');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getCurrentLyric = () => {
    return lyrics.find((line) => currentTime >= line.startTime && currentTime < line.endTime);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 flex items-center justify-center">
        <p className="text-gray-300">Chargement du projet...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/projects')}
            variant="outline"
            size="sm"
            className="border-slate-600 text-gray-300 hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-white">{project.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lyrics Editor */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <Label className="text-white mb-3 block">Paroles</Label>
              <Textarea
                value={lyricsText}
                onChange={(e) => setLyricsText(e.target.value)}
                placeholder="Entrez ou modifiez les paroles ici..."
                className="bg-slate-700 border-slate-600 text-white placeholder-gray-500 min-h-64"
              />
              <Button
                onClick={handleSaveLyrics}
                disabled={isLoading}
                className="mt-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white w-full"
              >
                Enregistrer les Paroles
              </Button>
            </Card>

              {/* Preview */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <Label className="text-white mb-3 block">Prévisualisation</Label>
              <div className="bg-slate-900 rounded-lg p-4">
                <LyricsViewer lyrics={lyrics} currentTime={currentTime} />
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-4 mt-6">
                <Button
                  onClick={handlePlayPause}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentTime}
                    onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <span className="text-gray-400 text-sm">{currentTime.toFixed(1)}s</span>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-white font-semibold mb-4">Informations</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400">Style Musical</p>
                  <p className="text-white font-medium">{project.musicStyle}</p>
                </div>
                <div>
                  <p className="text-gray-400">Statut</p>
                  <p className="text-white font-medium capitalize">{project.status}</p>
                </div>
                <div>
                  <p className="text-gray-400">Créé le</p>
                  <p className="text-white font-medium">{new Date(project.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </Card>

            {/* Theme Selection */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <Label className="text-white mb-3 block">Thème d'Arrière-plan</Label>
              <Select value={backgroundTheme} onValueChange={setBackgroundTheme}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="dark">Sombre</SelectItem>
                  <SelectItem value="light">Clair</SelectItem>
                  <SelectItem value="gradient">Dégradé</SelectItem>
                  <SelectItem value="abstract">Abstrait</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            {/* Render Video */}
            <Button
              onClick={handleRenderVideo}
              disabled={isLoading || project.status !== 'completed'}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Générer la Vidéo
            </Button>

            {project.videoUrl && (
              <Button
                onClick={() => project.videoUrl && window.open(project.videoUrl, '_blank')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Télécharger la Vidéo
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
