import { useEffect, useState } from 'react';
import api from '../api/client';

export default function SupportSettings() {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api.get('/admin/settings').then(r => setS(r.data.settings)).catch(() => setS({ supportContacts: {}, defaultInspectionFee: 2000, warrantyRules: [] }));
  }, []);
  if (!s) return <p className="p-6">جارِ التحميل…</p>;
  const upd = (path, v) => {
    const copy = JSON.parse(JSON.stringify(s));
    const keys = path.split('.'); let cur = copy;
    for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]] = cur[keys[i]] || {};
    cur[keys[keys.length - 1]] = v;
    setS(copy);
  };
  const save = async () => {
    setSaving(true);
    try { await api.put('/admin/settings', s); alert('تم حفظ الإعدادات بنجاح ✓'); }
    catch (_) { alert('تعذر حفظ الإعدادات'); }
    finally { setSaving(false); }
  };
  const sc = s.supportContacts || {};
  return (
    <div dir="rtl" className="p-6 max-w-3xl">
      <h1 className="text-xl font-bold mb-5">⚙️ إعدادات الدعم والقنوات</h1>
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-sm text-slate-500">قنوات التواصل (تُحدَّث فوراً داخل التطبيقين)</h2>
        {[['whatsapp', '📱 رقم الواتساب'], ['telegram', '✈️ معرّف التليجرام'], ['hotline', '📞 الخط الساخن'], ['email', '✉️ البريد الإلكتروني']].map(([k, l]) => (
          <div key={k}>
            <label className="text-xs text-slate-500">{l}</label>
            <input className="w-full border rounded-lg p-2 mt-1" dir="ltr"
              value={sc[k] || ''} onChange={e => upd(`supportContacts.${k}`, e.target.value)} />
          </div>
        ))}
        <div>
          <label className="text-xs text-slate-500">رسوم الكشف الافتراضية (ر.ي)</label>
          <input type="number" className="w-full border rounded-lg p-2 mt-1"
            value={s.defaultInspectionFee || 2000} onChange={e => upd('defaultInspectionFee', parseInt(e.target.value) || 0)} />
        </div>
      </div>
      <h2 className="font-bold mt-6 mb-2">🛡️ مدد الضمان الافتراضية حسب الخدمة</h2>
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
        {['solar', 'electricity', 'ac', 'plumbing'].map(cat => {
          const rule = (s.warrantyRules || []).find(r => r.category === cat) || { category: cat, defaultWarrantyDays: 14 };
          return (
            <div key={cat} className="flex items-center gap-3">
              <span className="w-32">{{solar:'طاقة شمسية',electricity:'كهرباء',ac:'تكييف',plumbing:'سباكة'}[cat]}</span>
              <input type="number" className="border rounded-lg p-2 w-28" value={rule.defaultWarrantyDays}
                onChange={e => {
                  const days = parseInt(e.target.value) || 0;
                  const rules = (s.warrantyRules || []).filter(r => r.category !== cat);
                  rules.push({ category: cat, defaultWarrantyDays: days });
                  upd('warrantyRules', rules);
                }} />
              <span className="text-xs text-slate-400">يوماً</span>
            </div>
          );
        })}
      </div>
      <button onClick={save} disabled={saving}
        className="mt-6 bg-slate-900 text-white px-6 py-2.5 rounded-xl disabled:opacity-50">
        {saving ? 'جارِ الحفظ…' : '💾 حفظ الإعدادات'}
      </button>
    </div>
  );
}
