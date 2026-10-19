import React, { useState } from 'react';
import { Tags, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export const CategoriesPage = ({
  categories = [],
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onOpenCategoryModal
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setIsDeleting(true);
      await onDeleteCategory(categoryToDelete._id);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Tags className="w-6 h-6 text-indigo-600" />
            Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize your contacts with customizable labels and tags
          </p>
        </div>

        <button
          onClick={() => onOpenCategoryModal(null)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          New Category
        </button>
      </div>

      {/* Category List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            No categories defined yet. Click "New Category" to create one.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.color || '#4f46e5' }}
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{cat.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Users className="w-3 h-3 text-slate-400" />
                      {cat.contactCount || 0} contact{(cat.contactCount === 1) ? '' : 's'} assigned
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenCategoryModal(cat)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => confirmDelete(cat)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title={`Delete Category "${categoryToDelete?.name}"?`}
        message="Deleting this category will automatically reassign any existing contacts in it to 'General'. This cannot be undone."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default CategoriesPage;
