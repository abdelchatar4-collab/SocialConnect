/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/features/dashboard';
import { User } from '@/types/user';
import { Card, CardContent, Loading, Badge } from '@/components/ui';
import { useAdmin } from '@/contexts/AdminContext';
import {
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { selectedYear } = useAdmin();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch users filtered by selected year
        const usersResponse = await fetch(`/api/users?take=5000&annee=${selectedYear}`);
        if (!usersResponse.ok) {
          throw new Error(`Error fetching all users: ${usersResponse.statusText}`);
        }
        const usersResult = await usersResponse.json();
        // Handle both old (array) and new ({ users, metadata }) response formats
        const usersData: User[] = Array.isArray(usersResult) ? usersResult : (usersResult.users || []);
        setUsers(usersData);

        // Fetch the list of recent users (top 10) - also filter by year
        const recentUsersResponse = await fetch(`/api/users/recent?limit=10&annee=${selectedYear}`);
        if (!recentUsersResponse.ok) {
          throw new Error(`Error fetching recent users: ${recentUsersResponse.statusText}`);
        }
        const recentUsersData: User[] = await recentUsersResponse.json();
        setRecentUsers(recentUsersData);

      } catch (err: unknown) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Chargement du tableau de bord..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <XCircleIcon className="h-5 w-5" />
              <span>Erreur lors du chargement des données: {error.message}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Dashboard Layout */}
      <DashboardLayout users={users} />

      {/* Recent Activity Section */}
      <div className="container mx-auto px-6 pb-8 max-w-7xl -mt-4">
        <RecentActivityTable recentUsers={recentUsers} />
      </div>
    </div>
  );
}

// Recent Activity Table Component
interface RecentActivityTableProps {
  recentUsers: User[];
}

const RecentActivityTable: React.FC<RecentActivityTableProps> = ({ recentUsers }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/30">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-teal-600" />
              Activités Récentes
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Les 10 derniers dossiers créés ou modifiés
            </p>
          </div>
          <Link
            href="/users"
            className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center transition-colors bg-teal-50 px-3 py-1.5 rounded-full hover:bg-teal-100"
          >
            Voir tout
            <EyeIcon className="h-4 w-4 ml-1.5" />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usager</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Gestionnaire</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date d'ouverture</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Antenne</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">État</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {recentUsers.map((user) => (
              <tr key={user.id} className="hover:bg-teal-50/20 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700 flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                        {`${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`.toUpperCase() || 'NN'}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {`${user.nom || ''} ${user.prenom || ''}`.trim() || 'Nom non renseigné'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.secteur || 'Secteur non défini'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.gestionnaire && typeof user.gestionnaire === 'object'
                      ? `${user.gestionnaire.prenom || ''} ${user.gestionnaire.nom || ''}`.trim()
                      : user.gestionnaire || 'Non assigné'
                    }
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {user.dateOuverture ? String(user.dateOuverture) : 'Non définie'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.antenne || 'Non assignée'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={
                      user.etat?.toLowerCase() === 'actif' ? 'success' :
                        user.etat?.toLowerCase() === 'clôturé' ? 'destructive' :
                          user.etat?.toLowerCase() === 'suspendu' ? 'warning' :
                            'default'
                    }
                    size="sm"
                  >
                    {user.etat || 'Non défini'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      href={`/users/${user.id}`}
                      className="text-teal-600 hover:text-teal-900 transition-colors flex items-center"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Voir
                    </Link>
                    <Link
                      href={`/users/${user.id}/edit`}
                      className="text-amber-600 hover:text-amber-900 transition-colors flex items-center"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Modifier
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="p-6 border-t border-gray-100 bg-gray-50/30">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Actions rapides</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/users/new"
            className="flex items-center justify-center px-6 py-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-700 font-medium hover:bg-teal-100 transition-colors"
          >
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Nouvel usager
          </Link>
          <Link
            href="/rapports"
            className="flex items-center justify-center px-6 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Générer rapport
          </Link>
          <Link
            href="/users"
            className="flex items-center justify-center px-6 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Liste complète
          </Link>
        </div>
      </div>
    </div>
  );
};
