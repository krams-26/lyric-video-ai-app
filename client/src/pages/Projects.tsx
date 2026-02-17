import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Music, Clock, Download, Edit2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

export default function Projects() {
  const [, navigate] = useLocation();
  const { data: projects, isLoading } = trpc.projects.list.useQuery();

  const handleNewProject = () => {
    navigate('/upload');
  };

  const handleEditProject = (projectId: number) => {
    navigate(`/projects/${projectId}/edit`);
  };

  const handleDownloadVideo = (videoUrl: string) => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Mes Projets</h1>
          </div>
          <Button
            onClick={handleNewProject}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau Projet
          </Button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-300">Chargement des projets...</p>
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-300 mb-6">Aucun projet pour le moment</p>
            <Button
              onClick={handleNewProject}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              Créer votre premier projet
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="bg-slate-800 border-slate-700 overflow-hidden hover:border-purple-500 transition"
              >
                {/* Project Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
                  <h3 className="text-white font-semibold truncate">{project.title}</h3>
                  <p className="text-purple-200 text-sm">{project.musicStyle}</p>
                </div>

                {/* Project Content */}
                <div className="p-4 space-y-4">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        project.status === 'completed'
                          ? 'bg-green-500'
                          : project.status === 'processing'
                          ? 'bg-yellow-500'
                          : project.status === 'failed'
                          ? 'bg-red-500'
                          : 'bg-gray-500'
                      }`}
                    />
                    <span className="text-gray-300 text-sm capitalize">{project.status}</span>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(project.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleEditProject(project.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Éditer
                    </Button>
                    {project.videoUrl && (
                      <Button
                        onClick={() => handleDownloadVideo(project.videoUrl!)}
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
