import pandas as pd
import sys
import json
import os
import datetime

def clean_value(val):
    if pd.isna(val):
        return None
    if isinstance(val, str):
        return val.strip()
    return val

def format_date(val):
    if pd.isna(val):
        return None
    if isinstance(val, datetime.datetime):
        return val.isoformat()
    # Handle string dates if any? For now assumption is datetime objects
    return str(val)

def process_mediation_file(input_path, output_path):
    print(f"🔄 Traitement du fichier : {input_path}")

    # CHARGEMENT AVEC HEADER=1 (2ème ligne)
    try:
        df = pd.read_excel(input_path, header=1)
    except Exception as e:
        print(f"❌ Erreur de lecture : {e}")
        sys.exit(1)

    users = []

    for _, row in df.iterrows():
        # Ignorer les lignes sans NOM (souvent des totaux ou lignes vides)
        if pd.isna(row.get('Nom')) and pd.isna(row.get('Prénom')):
            continue

        user = {}

        # 1. Champs de base
        user['nom'] = clean_value(row.get('Nom'))
        user['prenom'] = clean_value(row.get('Prénom'))
        user['genre'] = clean_value(row.get('Genre'))
        user['telephone'] = clean_value(row.get('N°de téléphone'))
        user['email'] = clean_value(row.get('Adresse mail'))
        user['nationalite'] = None # Pas dans le fichier
        user['trancheAge'] = clean_value(row.get("Tranche d'âge"))

        # 2. Dates
        user['dateOuverture'] = format_date(row.get("Date d'ouverture "))
        user['dateCloture'] = format_date(row.get("Date de clôture"))
        # Date de réception -> Peut servir si ouverture est vide ?
        if not user['dateOuverture']:
            user['dateOuverture'] = format_date(row.get("Date de reception "))

        # 3. Adresse (Concatenation)
        rue = clean_value(row.get('Adresse'))
        numero = clean_value(row.get('N°'))

        if rue:
            full_address_str = rue
            if numero:
                # Si le numéro est déjà dans la rue (ex: "Rue X 12"), on évite de le remettre ?
                # Sauf que "Adresse" semble être juste la rue ici.
                # On passe un objet adresse structuré car l'API d'import supporte userData.adresse = { rue, numero ... }
                # MAIS l'API d'import actuelle regarde userData.adresse pour créer une entité Adresse.
                # C'est mieux d'envoyer la structure.
                user['adresse'] = {
                    'rue': rue,
                    'numero': str(numero) if numero else None,
                    'ville': 'Anderlecht', # Hypothèse raisonnable pour PASQ/Médiation ? Ou laisser null.
                    'codePostal': '1070'
                }
            else:
                 user['adresse'] = { 'rue': rue, 'ville': 'Anderlecht', 'codePostal': '1070' }

        # 4. Gestionnaire (Titulaire)
        # L'API s'attend à "gestionnaire" (nom ou ID). Le script TS fait déjà le matching fuzzy.
        user['gestionnaire'] = clean_value(row.get('Titulaire '))

        # 5. Secteur
        user['secteur'] = clean_value(row.get('Secteur'))

        # 6. Champs spécifiques / Remarques
        # On peut mettre Type de conflit, issue, statut dans les remarques ou champs JSON ?
        type_conflit = clean_value(row.get('Type de conflit'))
        issue = clean_value(row.get('Issue'))
        statut = clean_value(row.get('Statut'))

        remarques = []
        if type_conflit: remarques.append(f"Conflit: {type_conflit}")
        if issue: remarques.append(f"Issue: {issue}")
        if statut: remarques.append(f"Statut Import: {statut}")

        if remarques:
            user['remarques'] = " | ".join(remarques)

        # 7. Année (Fixée à 2025 comme demandé par le nom du fichier)
        user['annee'] = 2025

        users.append(user)

    print(f"✅ Conversion terminée : {len(users)} usagers extraits.")

    # Export JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(users, f, ensure_ascii=False, indent=2)

    print(f"💾 Fichier JSON sauvegardé : {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_mediation_import.py <input_xlsx> <output_json>")
        sys.exit(1)

    process_mediation_file(sys.argv[1], sys.argv[2])
