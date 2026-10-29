# Bridge LFU — Gestion des licences et des équipements

Application web de suivi du parc informatique des clients d'un prestataire IT : licences logicielles, matériel, garanties et obsolescence. L'objectif est d'anticiper les échéances (licence qui expire, matériel en fin de vente ou bientôt obsolète) au lieu de les subir.

> **Prototype.** Le tableau de bord et la gestion des clients sont terminés. Les pages équipements, licences, notifications et rapports sont à venir.

## Fonctionnalités

### Disponibles
- **Tableau de bord** : nombre de clients, licences et équipements actifs, alertes critiques, éléments qui nécessitent une action
- **Graphiques** : statut des licences et des équipements, répartition du matériel par type, évolution des expirations de licences (Recharts)
- **Clients** : liste avec recherche, fiche détaillée, création et modification
- **Authentification** Supabase : inscription, connexion, réinitialisation du mot de passe, attente de vérification du compte
- **Rôles** : administrateur, technicien et client (un client ne voit que son propre parc)

### Prévues
- Gestion des **licences** (éditeur, version, clé, date d'expiration, coût) et des **équipements** (numéro de série, garantie, fin de vente, obsolescence), avec pièces jointes
- **Notifications** in-app et par e-mail, avec un délai d'alerte réglable par utilisateur
- **Rapports** exportables en PDF : licences expirées, matériel obsolète, parc par client
- Protection des routes côté serveur (`middleware.ts`, actuellement désactivé)

## Modèle de données

La base Supabase (PostgreSQL) est décrite par les types générés dans [`src/types/database.ts`](src/types/database.ts) :

| Élément | Contenu |
|---|---|
| Tables | `clients`, `licenses`, `equipment`, leurs pièces jointes, `profiles`, `notifications`, `notification_settings`, `activity_logs` |
| Vues | alertes du tableau de bord, licences et équipements avec leur client, durée des licences |
| Fonctions SQL | calcul automatique du statut des licences et du matériel, alertes de fin de vente, rapports par client, statistiques |

Statuts du matériel : `actif`, `en_maintenance`, `bientot_obsolete`, `obsolete`, `retire`.

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Backend | Supabase (PostgreSQL, authentification) |
| Données | TanStack Query, TanStack Table |
| Formulaires | React Hook Form, Zod |
| Interface | Tailwind CSS 4, shadcn/ui (Radix UI), Lucide |
| Graphiques | Recharts |

## Installation

Prérequis : Node.js 20+ et un projet Supabase.

```bash
git clone https://github.com/BelCodeur2005/bridge-lfu.git
cd bridge-lfu
npm install
```

Créer un fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://<projet>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé anon>
```

Puis lancer le serveur de développement :

```bash
npm run dev
```

L'application est disponible sur `http://localhost:3000`.
