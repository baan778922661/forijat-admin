import { useCallback, useEffect, useState } from 'react';
import { Copy, KeyRound, Loader2, RefreshCw } from 'lucide-react';
import { getLiveOtps } from '../api/endpoints';

/** شاشة أكواد التحقق الحية — تتحدث تلقائياً كل 15 ثانية */
export default function LiveOtps() {
  const [otps, setOtps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    try {
      const { data } = await getLiveOtps();
      setOtps(data.otps || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t1 = setInterval(load, 15000);
    const t2 = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, [load]);

  const copy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold">أكواد التحقق الحية</h2>
          <p className="text-sm text-slate-500 mt-1">أحدث طلبات OTP غير المنتهية — تتحدث تلقائياً كل 15 ثانية (قناة مؤقتة حتى ربط SMS)</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50">
          <RefreshCw size={15} /> تحديث
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="px-4 py-3 text-right font-bold">الهاتف</th>
              <th className="px-4 py-3 text-right font-bold">الاسم / نوع الحساب</th>
              <th className="px-4 py-3 text-right font-bold">الرمز</th>
              <th className="px-4 py-3 text-right font-bold">الغرض</th>
              <th className="px-4 py-3 text-right font-bold">الوقت المتبقي</th>
              <th className="px-4 py-3 text-right font-bold">نسخ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="py-16 text-center text-slate-400">
                <Loader2 className="animate-spin inline ml-2" size={18} /> جارِ التحميل…
              </td></tr>
            ) : otps.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-slate-400">
                <KeyRound className="mx-auto mb-2 text-slate-300" size={36} />
                لا أكواد نشطة حالياً
              </td></tr>
            ) : otps.map((o) => {
              const remain = Math.max(0, Math.floor((new Date(o.expiresAt) - now) / 1000));
              const mm = String(Math.floor(remain / 60));
              const ss = String(remain % 60).padStart(2, '0');
              return (
                <tr key={o._id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-bold" dir="ltr">{o.phone}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.user?.name || '—'}</p>
                    <p className="text-xs text-slate-400">{o.user?.role === 'technician' ? 'فني' : o.user?.role === 'client' ? 'عميل' : 'غير مسجل'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-extrabold text-lg tracking-widest text-brand-700" dir="ltr">{o.code}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">{o.purpose === 'reset_password' ? 'استعادة كلمة مرور' : 'تسجيل'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold ${remain < 120 ? 'text-red-600' : 'text-slate-600'}`} dir="ltr">{mm}:{ss}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => copy(o.code)}
                      className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg">
                      <Copy size={12} /> {copied === o.code ? 'تم ✓' : 'نسخ'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
