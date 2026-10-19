import React, { useState, useEffect } from 'react';
import {
  Users,
  Star,
  Tags,
  Plus,
  ArrowUpDown,
  Clock,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const DashboardPage = ({
  onNavigate,
  onOpenNewContact,
  onViewContact
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
        <p className="font-semibold">Unable to load dashboard data</p>
        <p className="text-xs mt-1">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    totalContacts = 0,
    totalFavorites = 0,
    totalCategories = 0,
    categoryBreakdown = [],
    recentContacts = []
  } = stats || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-indigo-100 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Contact Management System</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'User'}!
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            You currently have <strong className="text-white font-bold">{totalContacts}</strong>{' '}
            contacts organized across{' '}
            <strong className="text-white font-bold">{categoryBreakdown.length}</strong> categories.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={onOpenNewContact}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs sm:text-sm font-semibold shadow transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add New Contact
            </button>
            <button
              onClick={() => onNavigate('import-export')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500/30 hover:bg-indigo-500/40 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-semibold backdrop-blur-sm transition-all"
            >
              <ArrowUpDown className="w-4 h-4" />
              Import CSV
            </button>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 -mb-12 w-48 h-48 rounded-full bg-purple-400/20 blur-xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Contacts */}
        <div
          onClick={() => onNavigate('contacts')}
          className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Contacts
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-800">{totalContacts}</span>
            <span className="text-xs text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Total Favorites */}
        <div
          onClick={() => onNavigate('favorites')}
          className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Starred Favorites
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-800">{totalFavorites}</span>
            <span className="text-xs text-amber-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center">
              View starred <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Categories Count */}
        <div
          onClick={() => onNavigate('categories')}
          className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Categories
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Tags className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-800">{totalCategories}</span>
            <span className="text-xs text-purple-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center">
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Category Distribution & Recent Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (1 col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Tags className="w-4 h-4 text-indigo-600" />
                Category Distribution
              </h3>
              <button
                onClick={() => onNavigate('categories')}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                View all
              </button>
            </div>

            {categoryBreakdown.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No categories with contacts yet.
              </div>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown.map((item) => {
                  const percentage =
                    totalContacts > 0 ? Math.round((item.count / totalContacts) * 100) : 0;

                  return (
                    <div key={item.category} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700">{item.category}</span>
                        <span className="text-slate-400 font-semibold">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: item.color || '#4f46e5'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6">
            <button
              onClick={() => onNavigate('categories')}
              className="w-full text-center py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              + Create or Edit Categories
            </button>
          </div>
        </div>

        {/* Recently Added Contacts (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Recently Added Contacts
            </h3>
            <button
              onClick={() => onNavigate('contacts')}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              View all contacts
            </button>
          </div>

          {recentContacts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <p>No contacts added yet.</p>
              <button
                onClick={onOpenNewContact}
                className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Add your first contact
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentContacts.map((contact) => {
                const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
                const initials = `${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`.toUpperCase() || '?';

                return (
                  <div
                    key={contact._id}
                    onClick={() => onViewContact(contact)}
                    className="flex items-center justify-between py-3.5 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                          {fullName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {contact.email || contact.phone || 'No direct contact info'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {contact.category || 'General'}
                      </span>
                      {contact.isFavorite && (
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
