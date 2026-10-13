import { useEffect, useState } from 'react';
import api from '../api/client';

const BADGE = {
  pending_documents: { label: 'بانتظار الوثائق', color: 'bg-slate-100 text-slate-700' },
  under_review: { label: 'قيد التدقيق', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'معتمد ✓', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'مرفوض ✗', color: 'bg-red-100 text-red-700' },
  pending: { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700' },
  verified: { label: 'موثق ✓', color: 'bg-emerald-100 text-emerald-700' },
};

export default function KycPortal() {
  const [techs, setTechs] = useState([]);
  const [filter, setFilter] = useState('');
  const [preview, setPreview] = useState(null);
  const load = async () => {
    try { const r = await api.get('/admin/technicians'); setTechs(r.data.technicians || r.data || []); }
    catch (_) { setTechs([]); }
  };
  useEffect(() => { load(); }, []);
  const act = async (id, action) => {
    const reason = action === 'reject' ? window.prompt('سبب الرفض (يصل كإشعار للفني):') : null;
    if (action === 'reject' && !reason) return;
    await api.post(`/admin/technicians/${id}/review`, { action, reason });
    alert(action === 'approve' ? 'تم اعتماد الفني ✓' : 'تم إرسال الرفض مع السبب');
    load();
  };
  const list = techs.filter(t => !filter || (t.technicianProfile?.verificationStatus) === filter);
  return (
    <div dir="rtl" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">🪪 مركز توثيق الفنيين (KYC)</h1>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="border rounded-lg p-2 text-sm">
          <option value="">كل الحالات</option>
          <option value="pending_documents">بانتظار الوثائق</option>
          <option value="under_review">قيد التدقيق</option>
          <option value="approved">المعتمدون</option>
          <option value="rejected">المرفوضون</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(t => {
          const tp = t.technicianProfile || {};
          const b = BADGE[tp.verificationStatus] || BADGE.pending_documents;
          const docs = tp.documents || {};
          return (
            <div key={t._id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center font-bold">{(t.name||'ف')[0]}</div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500" dir="ltr">+967 {t.phone}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${b.color}`}>{b.label}</span>
              </div>
              <div className="text-xs text-slate-500 space-y-1 mb-3">
                <p>التخصصات: {(tp.skills||[]).join(', ') || '—'}</p>
                <p>الهوية: {tp.nationalIdNumber || '—'}</p>
                <p>الطوارئ: {tp.emergencyPhone || '—'}</p>
              </div>
              <div className="flex gap-2 mb-3">
                {['nationalIdFront', 'nationalIdBack'].map(k => docs[k] ? (
                  <button key={k} onClick={() => setPreview(docs[k])}
                    className="flex-1 border rounded-lg p-2 text-xs hover:bg-slate-50">
                    {k === 'nationalIdFront' ? '🪪 وجه الهوية' : '🪪 ظهر الهوية'}
                  </button>
                ) : null)}
              </div>
              <div className="flex gap-2">
                <button onClick={() => act(t._id, 'approve')}
                  className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-xs font-bold">✅ اعتماد</button>
                <button onClick={() => act(t._id, 'reject')}
                  className="flex-1 bg-red-600 text-white rounded-lg py-2 text-xs font-bold">❌ رفض</button>
              </div>
              {tp.rejectionReason && <p className="mt-2 text-xs text-red-600">سبب الرفض: {tp.rejectionReason}</p>}
            </div>
          );
        })}
        {list.length === 0 && <p className="col-span-full text-center text-slate-400 py-10">لا توجد طلبات في هذه الحالة</p>}
      </div>
      {preview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setPreview(null)}>
          <img src={preview} alt="document" className="max-h-[90vh] max-w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}
