import { X } from 'lucide-react';

/** Full-screen viewer for Cloudinary payment-proof images. */
export default function ProofModal({ url, title, onClose }) {
  if (!url) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-bold">{title || 'سند التحويل'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-auto p-4 bg-slate-50 flex items-center justify-center">
          <img src={url} alt="سند التحويل" className="max-w-full rounded-lg shadow" />
        </div>
        <div className="px-5 py-3 border-t text-left">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-brand-600 hover:underline"
            dir="ltr"
          >
            فتح الصورة الأصلية ↗
          </a>
        </div>
      </div>
    </div>
  );
}
