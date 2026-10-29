# Validation — 28 octobre 2026

- Edge / WebGPU : chargement réel de Qwen2.5-0.5B-Instruct-q4f32_1-MLC.
- HTTP local : réponse générée à partir du contrat (30 jours), création d'analyse, revue simulée et export du texte IA réussis.
- Ouverture directe de dist/index.html : modèle chargé, réponse adaptée à une référence modifiée à 45 jours.
- Régression du parcours d'extraits : modules, références, correction, approbation, export, historique, import PDF sur HTTP et affichage mobile vérifiés.
- Inspection visuelle du résultat réalisée.

Ces tests valident le fonctionnement du prototype, pas la qualité juridique. Le modèle 1,5B est optionnel et n'a pas été validé dans ce parcours final. L'import PDF nécessite HTTP/HTTPS ; en ouverture directe, coller son texte. Les réponses sans appel de citation sont signalées et demandent une vérification manuelle des passages fournis.
