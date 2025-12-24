import pandas as pd
import sys
import os

def analyze_excel(file_path):
    print(f"--- ANALYSE DU FICHIER : {os.path.basename(file_path)} ---")

    try:
        # Read the Excel file with header on the second row (index 1)
        df = pd.read_excel(file_path, header=1)

        print(f"\n✅ Fichier chargé avec succès : {len(df)} lignes trouvées.")

        # 1. Colonnes
        print("\n📋 1. COLONNES DÉTECTÉES :")
        for i, col in enumerate(df.columns):
            print(f"   [{i}] {col} (Type: {df[col].dtype})")

        # 2. Échantillon de données (Première ligne non-vide)
        print("\n👀 2. ÉCHANTILLON (Première ligne de données) :")
        if not df.empty:
            first_row = df.iloc[0]
            for col in df.columns:
                print(f"   - {col}: {first_row[col]}")
        else:
            print("   (Aucune donnée trouvée)")

        # 3. Analyse des Dates (Heuristique simple)
        print("\n📅 3. ANALYSE DES DATES POTENTIELLES :")
        date_keywords = ['date', 'naissance', 'dn', 'd.n', 'creation', 'cloture', 'debut', 'fin']
        potential_dates = [col for col in df.columns if any(kw in col.lower() for kw in date_keywords)]

        if potential_dates:
            for col in potential_dates:
                sample = df[col].dropna().head(5).tolist()
                print(f"   - Colonne '{col}' semble être une date. Échantillon : {sample}")
        else:
            print("   Aucune colonne avec un mot-clé 'date' évident n'a été trouvée.")

    except Exception as e:
        print(f"\n❌ ERREUR CRITIQUE : Impossible de lire le fichier.\n{e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_import_test.py <path_to_excel>")
        sys.exit(1)

    file_path = sys.argv[1]
    analyze_excel(file_path)
