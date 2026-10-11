import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, BadgeX, Loader2, RefreshCw, Star, UserCheck } from 'lucide-react';
import { getTechnicians, toggleTechnicianVerify } from '../api/endpoints';

const SKILL_LABELS = { solar: 'طاقة شمسية', electricity: 'كهرباء', ac: 'تكييف', plumbing: 'سباكة' };

export default function Technicians() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState('');

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

  const handleToggle = async (t) => {
    setBusyId(t._id);
    try {
      await toggleTechnicianVerify(t._id);
      flash(t.isVerified ? `تم تعطيل توثيق ${t.name}` : `تم توثيق ${t.name} — يمكنه استقبال الطلبات الآن ✓`);
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'فشل التحديث');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold">إدارة الفنيين</h2>
          <p className="text-sm text-slate-500 mt-1">
            التوثيق (isVerified) شرط لظهور الفني في نتائج الإسناد الجغرافي
          </p>
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
          {technicians.map((t) => (
            <div key={t._id} className={`bg-white rounded-2xl shadow-sm p-5 border-r-4 ${t.isVerified ? 'border-emerald-500' : 'border-amber-400'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-extrabold">{t.name}</h3>
                  <p className="text-xs text-slate-400" dir="ltr">{t.phone}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${t.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {t.isVerified ? 'موثّق' : 'بانتظار التوثيق'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {(t.technicianProfile?.skills || []).map((s) => (
                  <span key={s} className="text-[10px] bg-brand-50 text-brand-700 font-bold px-2 py-1 rounded-full">
                    {SKILL_LABELS[s] || s}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <Star size={13} className="text-amber-400" />
                  {(t.technicianProfile?.ratingAverage ?? 5).toFixed(1)} ({t.technicianProfile?.ratingCount ?? 0})
                </span>
                <span className={t.technicianProfile?.isAvailable ? 'text-emerald-600' : 'text-slate-400'}>
                  {t.technicianProfile?.isAvailable ? '● متصل' : '○ غير متصل'}
                </span>
              </div>

              <button
                disabled={busyId === t._id}
                onClick={() => handleToggle(t)}
                className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-lg disabled:opacity-50 ${
                  t.isVerified
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {busyId === t._id ? <Loader2 size={13} className="animate-spin" /> : t.isVerified ? <BadgeX size={14} /> : <BadgeCheck size={14} />}
                {t.isVerified ? 'إلغاء التوثيق' : 'توثيق وتفعيل'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
