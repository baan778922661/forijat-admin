import { useCallback, useEffect, useState } from 'react';
import { Copy, KeyRound, Loader2, MessageCircle, RefreshCw } from 'lucide-react';
import { getLiveOtps } from '../api/endpoints';

/** شاشة أكواد التحقق الحية — تحديث كل 15 ثانية + زر واتساب مباشر برسالة معبأة */
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

  const buildMessage = (o) => {
    const name = o.userName || o.user?.name || 'عزيزنا المستخدم';
    return `مرحباً بك في منصة فُرِجَت. رمز التحقق الخاص بك لتفعيل الحساب هو: ${o.code}. يرجى عدم مشاركة هذا الرمز مع أي شخص حفاظاً على أمان حسابك.`;
  };

  const copyMessage = (o) => {
    navigator.clipboard?.writeText(buildMessage(o));
    setCopied(o._id);
    setTimeout(() => setCopied(''), 1500);
  };

  const waLink = (o) => `https://wa.me/967${o.phone}?text=${encodeURIComponent(buildMessage(o))}`;

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold">أكواد التحقق الحية</h2>
          <p className="text-sm text-slate-500 mt-1">تتحدث كل 15 ثانية — أرسل الرمز للمستخدم بضغطة عبر زر واتساب الأخضر</p>
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
              <th className="px-4 py-3 text-right font-bold">الاسم / الصفة</th>
              <th className="px-4 py-3 text-right font-bold">الرمز</th>
              <th className="px-4 py-3 text-right font-bold">الغرض</th>
              <th className="px-4 py-3 text-right font-bold">القناة</th>
              <th className="px-4 py-3 text-right font-bold">المتبقي</th>
              <th className="px-4 py-3 text-right font-bold">إجراءات</th>
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
                    <p className="font-medium">{o.userName || o.user?.name || '—'}</p>
                    <p className="text-xs text-slate-400">{o.role === 'technician' ? 'فني' : o.role === 'client' ? 'عميل' : 'غير مسجل'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-extrabold text-lg tracking-widest text-brand-700" dir="ltr">{o.code}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">{o.purpose === 'reset_password' ? 'استعادة كلمة مرور' : 'تسجيل'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${o.deliveryMethod === 'whatsapp' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                      {o.deliveryMethod === 'whatsapp' ? 'واتساب' : 'SMS'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold ${remain < 120 ? 'text-red-600' : 'text-slate-600'}`} dir="ltr">{mm}:{ss}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => copyMessage(o)}
                        className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg"
                        title="نسخ الرسالة الجاهزة كاملة (للـ SMS أو اللصق)">
                        <Copy size={12} /> {copied === o._id ? 'تم ✓' : 'نسخ الرسالة'}
                      </button>
                      {o.deliveryMethod === 'whatsapp' && (
                        <a href={waLink(o)} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                          <MessageCircle size={12} /> إرسال واتساب
                        </a>
                      )}
                    </div>
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
