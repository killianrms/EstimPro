# Configuration de l'API Google Places

## 🔑 Obtenir une clé API Google Places

1. **Accédez à Google Cloud Console** : https://console.cloud.google.com/
2. **Créez un projet** ou sélectionnez un projet existant
3. **Activez l'API Places** :
   - Allez dans "Bibliothèque API"
   - Recherchez "Places API"
   - Cliquez sur "Activer"
4. **Créez une clé API** :
   - Allez dans "Identifiants"
   - Cliquez sur "Créer des identifiants"
   - Sélectionnez "Clé API"
5. **Configurez les restrictions** (recommandé) :
   - Restriction HTTP : ajoutez votre domaine
   - Restriction API : sélectionnez "Places API"

## 🔧 Configuration dans le projet

1. **Remplacez la clé API dans index.html** :
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=VOTRE_CLE_API&libraries=places&callback=initAutocomplete"></script>
   ```

2. **Testez l'autocomplétion** :
   - Tapez une adresse dans le champ
   - Vérifiez que les suggestions apparaissent
   - Sélectionnez une suggestion

## 💰 Tarification

- **Autocomplete per session** : 0,017 $ par session
- **Geocoding** : 0,005 $ par requête
- **Quota gratuit** : 200 $ de crédit mensuel

## 🔒 Sécurité

- Restreignez votre clé API à votre domaine
- Surveillez l'utilisation dans Google Cloud Console
- Activez la facturation pour éviter les interruptions

## 🧪 Test sans API

Si vous n'avez pas de clé API, l'application fonctionnera toujours avec la validation d'adresse de base (sans autocomplétion Google).