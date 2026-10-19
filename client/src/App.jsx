import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';
import CategoriesPage from './pages/CategoriesPage';
import ImportExportPage from './pages/ImportExportPage';
import SettingsPage from './pages/SettingsPage';
import ContactModal from './components/ContactModal';
import ContactDetailModal from './components/ContactDetailModal';
import CategoryModal from './components/CategoryModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import api from './services/api';

const MainApp = () => {
  const { isAuthenticated, loading } = useAuth();
  const { success, error: toastError } = useToast();

  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [activePage, setActivePage] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  // Modals state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const [deleteContactModalOpen, setDeleteContactModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [isDeletingContact, setIsDeletingContact] = useState(false);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  // Refresh trigger counter to signal children components to reload
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch categories when authenticated
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.warn('Could not load categories:', err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated, refreshKey]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Unauthenticated Flow
  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onNavigateToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onNavigateToRegister={() => setAuthView('register')} />;
  }

  // Contact Handlers
  const handleOpenNewContact = () => {
    setEditingContact(null);
    setContactModalOpen(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setContactModalOpen(true);
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setDetailModalOpen(true);
  };

  const handleDeleteContactPrompt = (contact) => {
    setContactToDelete(contact);
    setDeleteContactModalOpen(true);
  };

  const handleConfirmDeleteContact = async () => {
    if (!contactToDelete) return;
    try {
      setIsDeletingContact(true);
      const res = await api.delete(`/contacts/${contactToDelete._id}`);
      if (res.data.success) {
        success('Contact deleted successfully');
        setDeleteContactModalOpen(false);
        setContactToDelete(null);
        if (detailModalOpen && selectedContact?._id === contactToDelete._id) {
          setDetailModalOpen(false);
        }
        setRefreshKey((k) => k + 1);
      }
    } catch (err) {
      toastError(err.message || 'Failed to delete contact');
    } finally {
      setIsDeletingContact(false);
    }
  };

  const handleSubmitContact = async (formData) => {
    try {
      setIsSubmittingContact(true);
      if (editingContact?._id) {
        const res = await api.put(`/contacts/${editingContact._id}`, formData);
        if (res.data.success) {
          success('Contact updated successfully');
          setContactModalOpen(false);
          setEditingContact(null);
          if (selectedContact?._id === editingContact._id) {
            setSelectedContact(res.data.contact);
          }
          setRefreshKey((k) => k + 1);
        }
      } else {
        const res = await api.post('/contacts', formData);
        if (res.data.success) {
          success('Contact created successfully');
          setContactModalOpen(false);
          setRefreshKey((k) => k + 1);
        }
      }
    } catch (err) {
      toastError(err.message || 'Failed to save contact');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // Category Handlers
  const handleOpenCategoryModal = (category = null) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleSubmitCategory = async ({ name, color }) => {
    try {
      setIsSubmittingCategory(true);
      if (editingCategory?._id) {
        const res = await api.put(`/categories/${editingCategory._id}`, { name, color });
        if (res.data.success) {
          success('Category updated successfully');
          setCategoryModalOpen(false);
          setEditingCategory(null);
          fetchCategories();
          setRefreshKey((k) => k + 1);
        }
      } else {
        const res = await api.post('/categories', { name, color });
        if (res.data.success) {
          success('Category created successfully');
          setCategoryModalOpen(false);
          fetchCategories();
          setRefreshKey((k) => k + 1);
        }
      }
    } catch (err) {
      toastError(err.message || 'Failed to save category');
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const res = await api.delete(`/categories/${categoryId}`);
      if (res.data.success) {
        success(res.data.message || 'Category deleted');
        fetchCategories();
        setRefreshKey((k) => k + 1);
      }
    } catch (err) {
      toastError(err.message || 'Failed to delete category');
    }
  };

  return (
    <DashboardLayout
      activePage={activePage}
      setActivePage={setActivePage}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      onOpenNewContact={handleOpenNewContact}
    >
      {/* Route Views */}
      {activePage === 'dashboard' && (
        <DashboardPage
          key={refreshKey}
          onNavigate={(page) => setActivePage(page)}
          onOpenNewContact={handleOpenNewContact}
          onViewContact={handleViewContact}
        />
      )}

      {activePage === 'contacts' && (
        <ContactsPage
          key={refreshKey}
          favoritesOnly={false}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categories={categories}
          onOpenNewContact={handleOpenNewContact}
          onViewContact={handleViewContact}
          onEditContact={handleEditContact}
          onDeleteContact={handleDeleteContactPrompt}
        />
      )}

      {activePage === 'favorites' && (
        <ContactsPage
          key={refreshKey}
          favoritesOnly={true}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categories={categories}
          onOpenNewContact={handleOpenNewContact}
          onViewContact={handleViewContact}
          onEditContact={handleEditContact}
          onDeleteContact={handleDeleteContactPrompt}
        />
      )}

      {activePage === 'categories' && (
        <CategoriesPage
          key={refreshKey}
          categories={categories}
          onOpenCategoryModal={handleOpenCategoryModal}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      {activePage === 'import-export' && <ImportExportPage key={refreshKey} />}

      {activePage === 'settings' && <SettingsPage />}

      {/* Shared Modals */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onSubmit={handleSubmitContact}
        initialData={editingContact}
        categories={categories}
        isLoading={isSubmittingContact}
      />

      <ContactDetailModal
        contact={selectedContact}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onEdit={(contact) => {
          setDetailModalOpen(false);
          handleEditContact(contact);
        }}
        onDelete={(contact) => {
          setDetailModalOpen(false);
          handleDeleteContactPrompt(contact);
        }}
        onToggleFavorite={async (contact) => {
          try {
            const res = await api.patch(`/contacts/${contact._id}/favorite`);
            if (res.data.success) {
              setSelectedContact(res.data.contact);
              setRefreshKey((k) => k + 1);
              success(res.data.message);
            }
          } catch (e) {
            toastError(e.message || 'Error updating favorite');
          }
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteContactModalOpen}
        title="Delete Contact"
        message={`Are you sure you want to permanently delete "${contactToDelete?.firstName} ${contactToDelete?.lastName || ''}"? This action cannot be reversed.`}
        isDeleting={isDeletingContact}
        onConfirm={handleConfirmDeleteContact}
        onClose={() => setDeleteContactModalOpen(false)}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSubmit={handleSubmitCategory}
        initialData={editingCategory}
        isLoading={isSubmittingCategory}
      />
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
