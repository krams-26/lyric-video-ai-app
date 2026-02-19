# LyricVideo AI - Project TODO

## Backend Infrastructure
- [x] Schéma de base de données (projects, lyrics, processingJobs)
- [x] Migrations Drizzle appliquées
- [x] Fonctions de requête DB (getUserProjects, getProjectById, createProject, etc.)
- [x] Service de gestion des files d'attente (jobQueue.ts)
- [x] Service d'intégration Whisper pour transcription
- [x] Service d'intégration Wondera pour transformation de style
- [x] Service de rendu vidéo (videoRenderer.ts)
- [x] Procédures tRPC pour les projets (create, list, getById, update, getLyrics, updateLyrics, renderVideo)

## Frontend Pages & Components
- [x] Page d'accueil (Home.tsx) avec landing page et navigation
- [x] Page d'upload audio (Upload.tsx) avec validation
- [x] Page de liste des projets (Projects.tsx)
- [x] Page d'édition des projets (EditProject.tsx)
- [x] Composant AudioUploader avec drag-and-drop
- [x] Composant LyricsViewer avec synchronisation
- [x] Routage complet dans App.tsx

## Testing
- [x] Tests unitaires pour Whisper Service
- [x] Tests unitaires pour formatLyricsText
- [x] Tous les tests passent (5/5)

## Corrections de Bugs (Phase 2)
- [x] Récupération correcte de l'ID de projet après insertion
- [x] Utilisation du bon ID de projet pour les jobs en file d'attente
- [x] Démarrage du worker de traitement des jobs en arrière-plan
- [x] Implémentation complète de la mise à jour des paroles

## À Faire (Phase Finale)
- [ ] Intégration S3 pour l'upload de fichiers audio
- [ ] Intégration API Wondera réelle (actuellement simulée)
- [ ] Intégration API Whisper réelle (actuellement simulée)
- [ ] Moteur de rendu vidéo réel (FFmpeg ou Remotion)
- [ ] Gestion des erreurs et retry logic
- [ ] Optimisation des performances
- [ ] Documentation API
- [ ] Tests d'intégration complets
- [ ] Déploiement et publication

## Notes de Développement
- Les services Wondera et Whisper sont actuellement des placeholders avec simulations
- Le moteur de rendu vidéo est un placeholder - nécessite FFmpeg ou Remotion pour la production
- La file d'attente est gérée en mémoire - nécessite une solution persistante en production
- L'authentification OAuth est configurée et fonctionnelle
- Le design utilise un thème sombre avec accents violets
