import React from 'react';
import { Star, Mail, Phone, Building2, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';

const AVATAR_COLORS = [
  'bg-indigo-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-cyan-500'
];

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export const ContactCard = ({
  contact,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite
}) => {
  const initials = `${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`.toUpperCase() || '?';
  const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
  const avatarBg = getAvatarColor(fullName);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between p-5 overflow-hidden">
      {/* Top Banner accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300" />

      {/* Header with Avatar, Name, Favorite Star */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl ${avatarBg} text-white font-semibold text-base flex items-center justify-center shrink-0 shadow-sm`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h4
                onClick={() => onView(contact)}
                className="text-base font-semibold text-slate-800 hover:text-indigo-600 transition-colors truncate cursor-pointer"
                title={fullName}
              >
                {fullName}
              </h4>
              <p className="text-xs text-slate-500 truncate">
                {contact.jobTitle && contact.company
                  ? `${contact.jobTitle} • ${contact.company}`
                  : contact.jobTitle || contact.company || 'Contact'}
              </p>
            </div>
          </div>

          {/* Favorite Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(contact);
            }}
            className={`p-2 rounded-xl transition-all ${
              contact.isFavorite
                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                : 'text-slate-300 hover:text-amber-400 hover:bg-slate-50'
            }`}
            title={contact.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
          >
            <Star
              className={`w-4 h-4 transition-transform ${
                contact.isFavorite ? 'fill-amber-400 scale-110' : ''
              }`}
            />
          </button>
        </div>

        {/* Contact Info Lines */}
        <div className="space-y-1.5 my-3 text-xs text-slate-600">
          {contact.email ? (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 truncate transition-colors py-0.5"
              title={contact.email}
            >
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{contact.email}</span>
            </a>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 italic py-0.5">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>No email provided</span>
            </div>
          )}

          {contact.phone ? (
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 truncate transition-colors py-0.5"
              title={contact.phone}
            >
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{contact.phone}</span>
            </a>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 italic py-0.5">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>No phone number</span>
            </div>
          )}

          {contact.company && !contact.jobTitle && (
            <div className="flex items-center gap-2 text-slate-500 truncate py-0.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{contact.company}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Category Badge & Action Buttons */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {contact.category || 'General'}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(contact)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(contact)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit Contact"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
