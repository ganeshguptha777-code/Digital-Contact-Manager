import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Star,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  LayoutGrid,
  List,
  FolderPlus
} from 'lucide-react';
import api from '../services/api';
import ContactCard from '../components/ContactCard';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { ContactCardSkeleton } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export const ContactsPage = ({
  favoritesOnly = false,
  searchTerm = '',
  setSearchTerm,
  onOpenNewContact,
  onViewContact,
  onEditContact,
  onDeleteContact,
  categories = []
}) => {
  const { success, error: toastError } = useToast();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    pages: 1
  });

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        sortBy,
        sortOrder
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      if (favoritesOnly) {
        params.isFavorite = true;
      }

      const res = await api.get('/contacts', { params });
      if (res.data.success) {
        setContacts(res.data.contacts);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toastError(err.message || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, searchTerm, selectedCategory, favoritesOnly, toastError]);

  // Refetch when filters or search term changes
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Reset to page 1 on search or category filter change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, favoritesOnly]);

  const handleToggleFavorite = async (contact) => {
    try {
      // Optimistic UI update
      setContacts((prev) =>
        prev.map((c) =>
          c._id === contact._id ? { ...c, isFavorite: !c.isFavorite } : c
        )
      );

      const res = await api.patch(`/contacts/${contact._id}/favorite`);
      if (res.data.success) {
        success(res.data.message);
        if (favoritesOnly && !res.data.contact.isFavorite) {
          // Remove from list if viewing favorites only
          setContacts((prev) => prev.filter((c) => c._id !== contact._id));
        }
      }
    } catch (err) {
      toastError(err.message || 'Could not update favorite status');
      // Rollback
      fetchContacts();
    }
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === 'name-asc') {
      setSortBy('name');
      setSortOrder('asc');
    } else if (val === 'name-desc') {
      setSortBy('name');
      setSortOrder('desc');
    } else if (val === 'created-desc') {
      setSortBy('createdAt');
      setSortOrder('desc');
    } else if (val === 'created-asc') {
      setSortBy('createdAt');
      setSortOrder('asc');
    } else if (val === 'company-asc') {
      setSortBy('company');
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            {favoritesOnly ? (
              <>
                <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
                Favorite Contacts
              </>
            ) : (
              <>
                <Users className="w-6 h-6 text-indigo-600" />
                All Contacts
              </>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {pagination.total} contact{pagination.total === 1 ? '' : 's'}{' '}
            {favoritesOnly ? 'marked as favorites' : 'in your address book'}
          </p>
        </div>

        <button
          onClick={onOpenNewContact}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Contact
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Filter Pills / Dropdown */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c._id || c.name}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === c.name
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Right controls: Sorting and View Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Dropdown */}
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                onChange={handleSortChange}
                defaultValue="created-desc"
                className="pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              >
                <option value="created-desc">Date Added (Newest)</option>
                <option value="created-asc">Date Added (Oldest)</option>
                <option value="name-asc">Name (A – Z)</option>
                <option value="name-desc">Name (Z – A)</option>
                <option value="company-asc">Company Name</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/60">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts List / Grid View */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <ContactCardSkeleton key={i} />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={favoritesOnly ? Star : Users}
          title={
            favoritesOnly
              ? 'No favorite contacts yet'
              : searchTerm
              ? 'No matching contacts found'
              : 'Your contact list is empty'
          }
          description={
            favoritesOnly
              ? 'Click the star icon on any contact to mark them as a favorite for quick access.'
              : searchTerm
              ? `No contacts matched "${searchTerm}". Try a different keyword or clear your search.`
              : 'Add contacts manually or import your existing contacts via CSV.'
          }
          actionLabel={searchTerm ? 'Clear Search' : 'Add Contact'}
          onAction={searchTerm ? () => setSearchTerm('') : onOpenNewContact}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {contacts.map((contact) => (
            <ContactCard
              key={contact._id}
              contact={contact}
              onView={onViewContact}
              onEdit={onEditContact}
              onDelete={onDeleteContact}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        /* List Mode View */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {contacts.map((contact) => {
              const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
              const initials = `${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`.toUpperCase() || '?';

              return (
                <div
                  key={contact._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-3"
                >
                  <div
                    onClick={() => onViewContact(contact)}
                    className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors truncate">
                        {fullName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {contact.jobTitle && contact.company
                          ? `${contact.jobTitle} • ${contact.company}`
                          : contact.jobTitle || contact.company || contact.email || 'Contact'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-600">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {contact.category || 'General'}
                    </span>

                    <button
                      onClick={() => handleToggleFavorite(contact)}
                      className={`p-1.5 rounded-lg ${
                        contact.isFavorite
                          ? 'text-amber-500 bg-amber-50'
                          : 'text-slate-300 hover:text-amber-500'
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${contact.isFavorite ? 'fill-amber-400' : ''}`}
                      />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onViewContact(contact)}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEditContact(contact)}
                        className="px-2.5 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteContact(contact)}
                        className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

export default ContactsPage;
