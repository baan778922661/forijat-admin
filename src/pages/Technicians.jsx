import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, Eye, FileBadge, IdCard, Loader2, RefreshCw, Star, UserCheck, XCircle } from 'lucide-react';
import { getTechnicians, toggleTechnicianVerify, rejectTechnician } from '../api/endpoints';
import ProofModal from '../components/ProofModal';

const SKILL_LABELS = { solar: 'طاقة شمسية', electricity: 'كهرباء', ac: 'تكييف', plumbing: 'سباكة' };

export default function Technicians() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState('');
  const [doc, setDoc] = useState(null); // { url, title } — معاينة الوثيقة

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getTechnicians();
      setTechnicians(data.technicians || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleVerify = async (t) => {
    setBusyId(t._id);
    try {
      await toggleTechnicianVerify(t._id);
      flash(`تم توثيق ${t.name} — يمكنه استقبال الطلبات الآن ✓`);
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'فشل التوثيق');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (t) => {
    const reason = window.prompt(`سبب رفض توثيق ${t.name} (سيظهر له في تطبيقه ليصححه):`);
    if (reason === null) return;
    setBusyId(t._id);
    try {
      await rejectTechnician(t._id, reason);
      flash('تم تسجيل الرفض وإشعار الفني بالسبب');
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'فشل الرفض');
    } finally {
      setBusyId(null);
    }
  };

  const vStatus = (t) => t.technicianProfile?.verificationStatus || (t.isVerified ? 'verified' : 'pending');

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold">إدارة الفنيين</h2>
          <p className="text-sm text-slate-500 mt-1">عاين الوثائق قبل التوثيق — التوثيق شرط استقبال الطلبات</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50">
          <RefreshCw size={15} /> تحديث
        </button>
      </header>

      {toast && (
        <div className="mb-4 bg-brand-50 border border-brand-100 text-brand-700 rounded-xl px-4 py-3 text-sm font-medium">{toast}</div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400"><Loader2 className="animate-spin inline ml-2" size={18} /> جارِ التحميل…</div>
      ) : technicians.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-20 text-center text-slate-400">
          <UserCheck className="mx-auto mb-3 text-slate-300" size={40} />
          لا يوجد فنيون مسجلون بعد
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {technicians.map((t) => {
            const tp = t.technicianProfile || {};
            const vs = vStatus(t);
            return (
              <div key={t._id} className={`bg-white rounded-2xl shadow-sm p-5 border-r-4 ${
                vs === 'verified' ? 'border-emerald-500' : vs === 'rejected' ? 'border-red-400' : 'border-amber-400'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold">{t.name}</h3>
                    <p className="text-xs text-slate-400" dir="ltr">{t.phone}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    vs === 'verified' ? 'bg-emerald-100 text-emerald-700'
                    : vs === 'rejected' ? 'bg-red-100 text-red-600'
                    : 'bg-amber-100 text-amber-700'}`}>
                    {vs === 'verified' ? 'موثّق ✔' : vs === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(tp.skills || []).map((s) => (
                    <span key={s} className="text-[10px] bg-brand-50 text-brand-700 font-bold px-2 py-1 rounded-full">
                      {SKILL_LABELS[s] || s}
                    </span>
                  ))}
                </div>

                {/* معاينة الوثائق قبل التوثيق */}
                <div className="flex gap-2 mb-3">
                  {tp.idCardUrl ? (
                    <button onClick={() => setDoc({ url: tp.idCardUrl, title: `هوية ${t.name}` })}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold py-2 rounded-lg">
                      <IdCard size={14} /> <Eye size={12} /> الهوية
                    </button>
                  ) : (
                    <span className="flex-1 text-center text-[10px] text-slate-400 py-2 bg-slate-50 rounded-lg">لا هوية</span>
                  )}
                  {tp.certificateUrl ? (
                    <button onClick={() => setDoc({ url: tp.certificateUrl, title: `شهادة ${t.name}` })}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold py-2 rounded-lg">
                      <FileBadge size={14} /> <Eye size={12} /> الشهادة
                    </button>
                  ) : (
                    <span className="flex-1 text-center text-[10px] text-slate-400 py-2 bg-slate-50 rounded-lg">لا شهادة</span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Star size={13} className="text-amber-400" />
                    {(tp.ratingAverage ?? 5).toFixed(1)} ({tp.ratingCount ?? 0})
                  </span>
                  <span className={tp.isAvailable ? 'text-emerald-600' : 'text-slate-400'}>
                    {tp.isAvailable ? '● متصل' : '○ غير متصل'}
                  </span>
                </div>

                {vs !== 'verified' ? (
                  <div className="flex gap-2">
                    <button disabled={busyId === t._id} onClick={() => handleVerify(t)}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg disabled:opacity-50">
                      {busyId === t._id ? <Loader2 size={13} className="animate-spin" /> : <BadgeCheck size={14} />}
                      توثيق وتفعيل
                    </button>
                    <button disabled={busyId === t._id} onClick={() => handleReject(t)}
                      className="flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2.5 rounded-lg disabled:opacity-50">
                      <XCircle size={14} /> رفض بالسبب
                    </button>
                  </div>
                ) : (
                  <button disabled={busyId === t._id} onClick={() => handleReject(t)}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2.5 rounded-lg disabled:opacity-50">
                    <XCircle size={14} /> إلغاء التوثيق بسبب
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ProofModal url={doc?.url} title={doc?.title} onClose={() => setDoc(null)} />
    </div>
  );
}
