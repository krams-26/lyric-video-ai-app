import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Music, Zap, Sparkles, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-gray-300">Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navigation */}
        <nav className="border-b border-slate-700 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold text-white">LyricVideo AI</span>
            </div>
            <a href={getLoginUrl()} className="text-purple-400 hover:text-purple-300 transition">
              Se connecter
            </a>
          </div>
        </nav>

        {/* Hero */}
        <div className="max-w-6xl mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Transformez votre musique en videos de paroles
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Uploadez votre chanson, choisissez un style musical et generez des videos de paroles synchronisees en quelques clics.
            </p>
            <a
              href={getLoginUrl()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Commencer maintenant
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
              <Zap className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Rapide</h3>
              <p className="text-gray-400">Transformez votre musique en quelques minutes avec notre pipeline IA optimise.</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
              <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Personnalisable</h3>
              <p className="text-gray-400">Choisissez parmi 6 styles musicaux et 4 themes d'arriere-plan differents.</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
              <Music className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Professionnel</h3>
              <p className="text-gray-400">Exportez en haute qualite 1080p MP4 pret pour YouTube et les reseaux sociaux.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Bienvenue!</h1>
          <p className="text-gray-300 mb-8">Commencez par creer un nouveau projet ou consultez vos projets existants.</p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate('/upload')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              Creer un nouveau projet
            </Button>
            <Button
              onClick={() => navigate('/projects')}
              variant="outline"
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Voir mes projets
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
