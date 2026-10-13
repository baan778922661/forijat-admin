import { useEffect, useState } from 'react';
import api from '../api/client';

const PURPOSES = {
  register: { label: 'تسجيل جديد', color: 'bg-emerald-100 text-emerald-700' },
  forgot_password: { label: 'استعادة كلمة المرور', color: 'bg-amber-100 text-amber-700' },
  reset_password: { label: 'استعادة كلمة المرور', color: 'bg-amber-100 text-amber-700' },
};

export default function LiveOtps() {
  const [otps, setOtps] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/admin/otps');
      setOtps(res.data.otps || res.data || []);
    } catch (_) {} finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const copy = (o) => {
    const isReset = o.purpose !== 'register';
    const msg = isReset
      ? `فُرِجَت — رمز استعادة كلمة المرور: ${o.code}\nصالح 10 دقائق. إن لم تطلبه تجاهل الرسالة.`
      : `فُرِجَت — رمز توثيق حسابك: ${o.code}\nصالح 10 دقائق. لا تشاركه مع أحد.`;
    navigator.clipboard?.writeText(msg);
    alert('تم نسخ الرسالة الجاهزة للإرسال ✓');
  };

  const wa = (o) => {
    const isReset = o.purpose !== 'register';
    const msg = isReset
      ? `فُرِجَت — رمز استعادة كلمة المرور: ${o.code} (صالح 10 دقائق)`
      : `فُرِجَت — رمز توثيق حسابك: ${o.code} (صالح 10 دقائق)`;
    window.open(`https://wa.me/967${o.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div dir="rtl" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">أكواد التحقق المباشرة 🔐</h1>
        <button onClick={load} className="px-3 py-1.5 text-sm rounded-lg bg-slate-100">تحديث</button>
      </div>
      {loading ? <p>جارِ التحميل…</p> : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 text-right">الاسم</th>
                <th className="p-3 text-right">الهاتف</th>
                <th className="p-3 text-right">نوع الحساب</th>
                <th className="p-3 text-right">الرمز</th>
                <th className="p-3 text-right">الغرض</th>
                <th className="p-3 text-right">القناة</th>
                <th className="p-3 text-right">الوقت</th>
                <th className="p-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {otps.map((o) => {
                const p = PURPOSES[o.purpose] || PURPOSES.register;
                return (
                  <tr key={o._id} className="border-t">
                    <td className="p-3">{o.userName || o.name || '—'}</td>
                    <td className="p-3" dir="ltr">+967 {o.phone}</td>
                    <td className="p-3">{o.role === 'technician' ? 'فني' : 'عميل'}</td>
                    <td className="p-3 font-mono font-bold text-lg tracking-widest">{o.code}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.color}`}>{p.label}</span>
                    </td>
                    <td className="p-3">{o.channel === 'whatsapp' ? 'واتساب' : 'SMS'}</td>
                    <td className="p-3 text-xs text-slate-400">
                      {new Date(o.createdAt).toLocaleTimeString('ar-YE')}
                    </td>
                    <td className="p-3 space-x-2 space-x-reverse">
                      <button onClick={() => copy(o)}
                        className="px-2 py-1 text-xs rounded-lg bg-slate-800 text-white">نسخ الرسالة</button>
                      <button onClick={() => wa(o)}
                        className="px-2 py-1 text-xs rounded-lg bg-green-600 text-white">واتساب ↗</button>
                    </td>
                  </tr>
                );
              })}
              {otps.length === 0 && (
                <tr><td colSpan="8" className="p-6 text-center text-slate-400">لا أكواد نشطة حالياً</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
