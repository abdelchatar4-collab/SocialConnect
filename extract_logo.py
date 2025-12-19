# Copyright (C) 2025 ABDEL KADER CHATAR
# SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
#
# Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.

from PIL import Image
import os

# Chemins
input_path = "/Users/abdelchatar/.gemini/antigravity/brain/e08a08b8-9e09-4d0d-aeda-6303680521b7/uploaded_image_1764066018011.png"
output_path = "/Users/abdelchatar/Desktop/TEST/Test-gestion-usagers/public/socialconnect-logo-extracted.png"

try:
    img = Image.open(input_path)

    # Le logo est en haut à gauche.
    # On va faire une découpe approximative basée sur la capture d'écran.
    # On suppose que la capture est une fenêtre complète.
    # Le logo semble être dans les coordonnées (50, 40) à (300, 100) environ.
    # On va prendre un peu plus large et on pourra ajuster si besoin.

    # Crop box: (left, top, right, bottom)
    # Ajustement basé sur la capture d'écran fournie
    # La capture montre la barre d'adresse chrome, donc le contenu commence un peu plus bas.
    # Disons left=40, top=110, right=280, bottom=170 (approximation)

    # Essayons de capturer la zone "SC SocialConnect"
    # D'après l'image, c'est vraiment en haut à gauche de la zone blanche.

    # On va faire un crop assez large pour être sûr, l'utilisateur verra le résultat.
    crop_box = (50, 110, 350, 180)

    logo_img = img.crop(crop_box)
    logo_img.save(output_path)
    print(f"Logo extrait avec succès vers {output_path}")

except Exception as e:
    print(f"Erreur lors de l'extraction: {e}")
