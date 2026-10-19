import React from 'react';
import {
  X,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Star,
  Edit2,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ContactDetailModal = ({
  contact,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite
}) => {
  const { success } = useToast();

  if (!isOpen || !contact) return null;

  const initials = `${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`.toUpperCase() || '?';
  const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    success(`${label} copied to clipboard`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 transition-all">
        {/* Top actions & close */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
            {contact.category || 'General'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(contact)}
              className={`p-2 rounded-xl transition-colors ${
                contact.isFavorite
                  ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                  : 'text-slate-400 hover:text-amber-500 hover:bg-slate-50'
              }`}
              title={contact.isFavorite ? 'Remove favorite' : 'Mark as favorite'}
            >
              <Star className={`w-4 h-4 ${contact.isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="flex flex-col items-center text-center my-6">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-indigo-100 mb-3">
            {initials}
          </div>
          <h3 className="text-xl font-bold text-slate-900">{fullName}</h3>
          {(contact.jobTitle || contact.company) && (
            <p className="text-sm text-slate-500 mt-0.5">
              {contact.jobTitle}
              {contact.jobTitle && contact.company && ' at '}
              <span className="font-medium text-slate-700">{contact.company}</span>
            </p>
          )}

          {/* Quick Contact Buttons */}
          <div className="flex items-center gap-3 mt-4">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Call
              </a>
            )}
          </div>
        </div>

        {/* Detailed Fields */}
        <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-sm">
          {contact.email && (
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-800">{contact.email}</span>
              </div>
              <button
                onClick={() => copyToClipboard(contact.email, 'Email')}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                title="Copy Email"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {contact.phone && (
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-800">{contact.phone}</span>
              </div>
              <button
                onClick={() => copyToClipboard(contact.phone, 'Phone number')}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                title="Copy Phone"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {contact.address && (
            <div className="flex items-start gap-2.5 text-slate-600 py-1">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="text-slate-700">{contact.address}</span>
            </div>
          )}

          {contact.notes && (
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Notes
              </span>
              <p className="text-slate-700 text-xs whitespace-pre-wrap leading-relaxed">
                {contact.notes}
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Created: {formatDate(contact.createdAt)}
            </span>
            {contact.updatedAt && (
              <span>Updated: {formatDate(contact.updatedAt)}</span>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
          <button
            onClick={() => {
              onClose();
              onDelete(contact);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(contact);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailModal;
