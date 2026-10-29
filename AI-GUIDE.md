# LexAI — Assistant IA dans le navigateur

LexAI comporte un véritable modèle de langage local (Qwen 2.5 via WebLLM), une conversation et la rédaction d'analyses à partir des références du dossier. Les réponses ne sont pas prédéfinies.

## Utilisation sans Python ni installation

1. Extraire tout le ZIP et ouvrir `dist/index.html` dans Chrome ou Edge, ou utiliser le site publié.
2. Ouvrir **Assistant IA**, cliquer **Charger l'IA** et attendre **IA prête**. Le premier chargement télécharge environ 400 Mo pour le modèle léger, jusqu'à 1 Go pour le 1,5B.
3. Cliquer **Exemple : préavis de 30 jours**, puis **Envoyer**. Le modèle rédige sa réponse à partir du contrat fictif.
4. Pour vos documents : ouvrir **Espace d'analyse**, importer une référence ou coller son texte, puis renseigner la question et les faits.
5. Choisir **Analyse rédigée par l'IA**, puis **Créer une ébauche**. Le texte généré et les références sont affichés ensemble.
6. Vérifier le contenu, puis **Approuver · démo**, saisir la justification et exporter en texte ou JSON. L'export contient l'analyse IA, le modèle utilisé, les sources et les revues.

Le navigateur doit disposer de WebGPU et d'une carte graphique compatible. Un message explicite signale une incompatibilité. Aucun compte API ni service payant n'est requis. Le téléchargement commence uniquement après le clic sur **Charger l'IA**. Le navigateur peut conserver les poids en cache ; un effacement du cache ou un changement de modèle peut nécessiter un nouveau téléchargement. La mémoire graphique requise est d'environ 1 à 2 Go selon le modèle.

Le modèle 0,5B est sélectionné par défaut pour un premier essai léger. Le 1,5B est optionnel et plus exigeant ; sa qualité et sa rapidité dépendent de la machine. Ce sont des modèles généralistes de petite taille, sans spécialisation juridique validée.

## Documents et conversation

- La case **Utiliser le dossier actuel** joint les références et faits du dossier à la conversation. Décochez-la pour une discussion générale.
- Les références sont recherchées par mots-clés ; au plus trois passages sont utilisés. Un long document n'est pas analysé intégralement.
- Les messages, faits et documents restent dans la mémoire du navigateur. Seuls le moteur et les fichiers du modèle sont téléchargés depuis MLC/Hugging Face. Aucun prompt n'est envoyé à une API distante par cette application.
- Les réponses du chat sont des brouillons. Le circuit d'approbation et l'export s'appliquent aux analyses créées depuis le dossier.
- L'historique de session disparaît à la fermeture ou au rechargement. Exportez vos résultats approuvés.
- Pour corriger : **Demander une correction**, compléter la saisie, puis **Reprendre avec les saisies actuelles**. Le modèle doit être chargé pour une nouvelle version IA.
- L'app vérifie les numéros de citation si le modèle en produit. Un numéro inconnu bloque l'approbation. Si la réponse ne contient pas de citation, cela est indiqué et les passages fournis au modèle restent consultables. Le réviseur doit vérifier qu'ils justifient la réponse avant approbation ; ce lien n'est pas prouvé automatiquement.
- **Recherche d'extraits uniquement** conserve l'ancien fonctionnement sans chargement du modèle.

## PDF

TXT/MD et texte collé fonctionnent dans la copie locale. L'import PDF nécessite le site HTTPS ou un serveur HTTP local. Par double-clic sur `index.html`, copiez plutôt le texte du PDF. Les PDF scannés nécessitent un OCR préalable. Limites : 10 Mo et 200 000 caractères.

## Portée académique

L'approbation est une simulation de rôle pour un opérateur unique. Il n'y a pas d'authentification métier, de séparation des clients, de surveillance réglementaire automatique, de vérification de l'actualité des lois ni de connexion KPMG. La confidentialité de l'hébergement privé ne remplace pas ces contrôles métier.

Une réponse IA peut être incorrecte, même avec une citation valide. L'expert doit vérifier les faits, les sources et l'interprétation. Les documents sont traités comme des données dans le prompt ; cela ne garantit pas une résistance parfaite aux injections de prompt.

## Développeurs

- `dist/index.html` : interface, recherche documentaire, dossiers de session, revue et exports.
- `dist/assistant.js` : chargement du modèle, chat, génération, contrôles de citations et exports IA.
- `dist/vendor/webllm.bundle.js` : WebLLM 0.2.85 empaqueté, chargé sur demande ; forme classique compatible avec l'ouverture locale.
- `dist/vendor/webllm.mjs` : source ESM épinglée de jsDelivr ; le bundle classique expose ses exports dans `globalThis.LexAIWebLLM`.
- `dist/vendor/WEBLLM-LICENSE.txt` : licence du moteur.
- `dist/vendor/pdf.mjs`, `pdf.worker.mjs`, `PDFJS-LICENSE` : extraction PDF.

Modèles : Qwen2.5-0.5B-Instruct et Qwen2.5-1.5B-Instruct quantifiés q4f32_1-MLC (variante choisie pour éviter une erreur de pilote constatée avec f16). Ils sont sélectionnés parmi les configurations de la version épinglée de WebLLM. Les poids ne sont pas inclus dans le ZIP.

Documentation : https://webllm.mlc.ai/docs/user/get_started.html

Modèle léger : https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f32_1-MLC

Cette livraison modifie l'application web. Les anciens exécutables Windows distribués séparément restent l'ancienne démonstration ; utilisez cette version web pour l'assistant IA.
