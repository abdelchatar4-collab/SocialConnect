#!/bin/bash

# Copyright (C) 2025 ABDEL KADER CHATAR
# SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
#
# Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.


# Script de nettoyage Docker pour macOS
# Auteur: Assistant IA
# Usage: ./clean-docker.sh [--dry-run] [--force]

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage avec couleurs
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction pour afficher l'aide
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --dry-run    Affiche ce qui serait supprimé sans le faire"
    echo "  --force      Supprime tout sans demander confirmation"
    echo "  --help       Affiche cette aide"
    echo ""
    echo "Ce script nettoie:"
    echo "  • Images Docker inutilisées"
    echo "  • Conteneurs arrêtés"
    echo "  • Volumes non utilisés"
    echo "  • Réseaux non utilisés"
    echo "  • Cache de build"
}

# Fonction pour afficher l'espace disque utilisé par Docker
show_docker_space() {
    print_info "Espace disque utilisé par Docker :"
    docker system df -v 2>/dev/null || {
        print_error "Impossible d'obtenir les informations d'espace Docker"
        return 1
    }
    echo ""
}

# Fonction pour vérifier si Docker est en cours d'exécution
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop."
        exit 1
    fi
}

# Fonction de nettoyage avec dry-run
clean_docker() {
    local dry_run=$1
    local force=$2

    if [ "$dry_run" = true ]; then
        print_info "Mode dry-run activé - aucune suppression ne sera effectuée"
        echo ""
    fi

    # Affichage de l'espace avant nettoyage
    print_info "État AVANT nettoyage :"
    show_docker_space

    if [ "$dry_run" = true ]; then
        print_info "Conteneurs qui seraient supprimés :"
        docker container ls -a --filter "status=exited" --filter "status=created" 2>/dev/null || true
        echo ""

        print_info "Images qui seraient supprimées :"
        docker images --filter "dangling=true" 2>/dev/null || true
        echo ""

        print_info "Volumes qui seraient supprimés :"
        docker volume ls --filter "dangling=true" 2>/dev/null || true
        echo ""

        print_info "Réseaux qui seraient supprimés :"
        docker network ls --filter "dangling=true" 2>/dev/null || true
        echo ""

        return 0
    fi

    # Demander confirmation si pas en mode force
    if [ "$force" != true ]; then
        echo ""
        print_warning "Cette opération va supprimer :"
        echo "  • Tous les conteneurs arrêtés"
        echo "  • Toutes les images non utilisées"
        echo "  • Tous les volumes non utilisés"
        echo "  • Tous les réseaux non utilisés"
        echo "  • Tout le cache de build"
        echo ""
        read -p "Êtes-vous sûr de vouloir continuer ? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Opération annulée."
            exit 0
        fi
    fi

    print_info "Début du nettoyage Docker..."
    echo ""

    # 1. Supprimer les conteneurs arrêtés
    print_info "Suppression des conteneurs arrêtés..."
    docker container prune -f 2>/dev/null && print_success "Conteneurs arrêtés supprimés" || print_warning "Aucun conteneur arrêté à supprimer"

    # 2. Supprimer les images non utilisées
    print_info "Suppression des images non utilisées..."
    docker image prune -a -f 2>/dev/null && print_success "Images non utilisées supprimées" || print_warning "Aucune image non utilisée à supprimer"

    # 3. Supprimer les volumes non utilisés
    print_info "Suppression des volumes non utilisés..."
    docker volume prune -f 2>/dev/null && print_success "Volumes non utilisés supprimés" || print_warning "Aucun volume non utilisé à supprimer"

    # 4. Supprimer les réseaux non utilisés
    print_info "Suppression des réseaux non utilisés..."
    docker network prune -f 2>/dev/null && print_success "Réseaux non utilisés supprimés" || print_warning "Aucun réseau non utilisé à supprimer"

    # 5. Supprimer le cache de build
    print_info "Suppression du cache de build..."
    docker builder prune -a -f 2>/dev/null && print_success "Cache de build supprimé" || print_warning "Aucun cache de build à supprimer"

    echo ""
    print_success "Nettoyage Docker terminé !"
    echo ""

    # Affichage de l'espace après nettoyage
    print_info "État APRÈS nettoyage :"
    show_docker_space
}

# Fonction pour calculer l'espace libéré
show_space_saved() {
    print_info "Calcul de l'espace libéré..."
    # Cette fonction pourrait être améliorée pour calculer précisément l'espace libéré
    echo "Utilisez 'docker system df' pour voir l'espace actuel utilisé par Docker."
}

# Fonction principale
main() {
    local dry_run=false
    local force=false

    # Traitement des arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                dry_run=true
                shift
                ;;
            --force)
                force=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Option inconnue: $1"
                show_help
                exit 1
                ;;
        esac
    done

    print_info "🐳 Script de nettoyage Docker pour macOS"
    echo ""

    # Vérifier que Docker est en cours d'exécution
    check_docker

    # Effectuer le nettoyage
    clean_docker $dry_run $force

    if [ "$dry_run" != true ]; then
        echo ""
        print_success "🎉 Nettoyage terminé avec succès !"
        print_info "💡 Conseil : Redémarrez Docker Desktop si vous voulez libérer complètement l'espace disque."
    fi
}

# Exécution du script
main "$@"
