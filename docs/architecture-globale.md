# Architecture globale - Application LearningFaster

## 1) Objectif
Définir une base **simple, claire et maintenable** pour démarrer l'application avec :
- une page d'authentification,
- un dashboard,
- un affichage des derniers cours PDF ajoutés.

> Portée MVP (version initiale) : un seul compte administrateur.

---

## 2) Vue d'ensemble

### Front-end
- **React Native + Expo Router + TypeScript**
- Navigation principale :
  - `/login` : écran d'authentification
  - `/dashboard` : écran principal après connexion

### Back-end (phase MVP)
- **Service API léger** (Node.js/Express ou équivalent)
- Endpoints minimum :
  - `POST /auth/login`
  - `GET /courses/latest`

### Données
- Base relationnelle (SQLite/PostgreSQL) avec 2 tables principales :
  - `users`
  - `courses`

---

## 3) Authentification (simple)

## Compte administrateur MVP
- Username : `root`
- Mot de passe : `toor`

⚠️ En production, ce couple ne doit jamais rester en clair. Pour l'itération MVP, il sert uniquement de point d'entrée rapide.

### Flux de connexion
1. L'utilisateur ouvre `/login`.
2. Il saisit username/password.
3. L'app appelle `POST /auth/login`.
4. Si OK :
   - l'API renvoie un token de session,
   - l'app stocke le token (SecureStore),
   - redirection vers `/dashboard`.
5. Si KO : message d'erreur simple.

### Règle d'accès
- `/dashboard` est protégé : sans token valide, retour automatique vers `/login`.

---

## 4) Dashboard

Le dashboard contient :
1. **Header admin** : nom de l'utilisateur connecté (`root`).
2. **Bloc “Derniers cours PDF ajoutés”**.

### Bloc “Derniers cours PDF ajoutés”
- Source : endpoint `GET /courses/latest?limit=10`
- Tri : date d'ajout décroissante
- Éléments affichés par ligne :
  - titre du cours,
  - date d'ajout,
  - taille (optionnelle),
  - bouton “Ouvrir”.

### États UI attendus
- Loading
- Liste vide (“Aucun cours PDF pour le moment”)
- Erreur réseau (“Impossible de charger les cours”)

---

## 5) Modèle de données (MVP)

### Table `users`
- `id` (PK)
- `username` (unique)
- `password_hash`
- `role` (`admin`)
- `created_at`

### Table `courses`
- `id` (PK)
- `title`
- `pdf_url`
- `created_at`
- `created_by` (FK `users.id`, optionnel)

---

## 6) API contract (proposition)

### `POST /auth/login`
**Request**
```json
{
  "username": "root",
  "password": "toor"
}
```

**200 Response**
```json
{
  "accessToken": "jwt_or_session_token",
  "user": {
    "username": "root",
    "role": "admin"
  }
}
```

**401 Response**
```json
{
  "error": "INVALID_CREDENTIALS"
}
```

### `GET /courses/latest?limit=10`
**200 Response**
```json
[
  {
    "id": "c1",
    "title": "Introduction à l'algèbre",
    "pdfUrl": "https://.../algebre.pdf",
    "createdAt": "2026-03-20T10:00:00.000Z"
  }
]
```

---

## 7) Structure projet recommandée (front)

```text
app/
  login.tsx
  dashboard.tsx
  _layout.tsx

src/
  features/
    auth/
      api.ts
      store.ts
      types.ts
    courses/
      api.ts
      types.ts
  components/
    PdfCourseList.tsx
  lib/
    http.ts
    secure-storage.ts
```

---

## 8) Sécurité minimum
- Hash du mot de passe côté serveur (bcrypt/argon2).
- Token expirant (ex: 24h).
- Stockage du token via SecureStore.
- Validation d'input côté API.

---

## 9) Plan d'implémentation (ordre)
1. Créer la page `/login` (UI + validation basique).
2. Ajouter la route protégée `/dashboard`.
3. Implémenter `POST /auth/login`.
4. Stocker/restaurer le token.
5. Implémenter `GET /courses/latest`.
6. Afficher les derniers PDF dans le dashboard.
7. Ajouter les états loading/vide/erreur.

