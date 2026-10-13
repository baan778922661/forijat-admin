import { useEffect, useState } from 'react';
import api from '../api/client';

const Card = ({ title, value, icon, tone }) => (
  <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${tone}`}>{icon}</div>
    <div>
      <p className="text-xs text-slate-400">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

export default function FinanceDashboard() {
  const [d, setD] = useState(null);
  useEffect(() => {
    api.get('/admin/finance/summary').then((r) => setD(r.data)).catch(() => setD({}));
  }, []);
  if (!d) return <p className="p-6">جارِ التحميل…</p>;
  const fmt = (n) => `${(n || 0).toLocaleString('ar-YE')} ر.ي`;
  return (
    <div dir="rtl" className="p-6">
      <h1 className="text-xl font-bold mb-5">التحليلات المالية 💰</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card title="أرباح اليوم (عمولات)" value={fmt(d.today)} icon="📈" tone="bg-emerald-50" />
        <Card title="أرباح آخر 7 أيام" value={fmt(d.week)} icon="🗓️" tone="bg-sky-50" />
        <Card title="عمولات رسوم الكشف" value={fmt(d.inspectionCommission)} icon="🔍" tone="bg-violet-50" />
        <Card title="مبالغ معلقة في الضمان (Escrow)" value={fmt(d.escrowHeld)} icon="🛡️" tone="bg-amber-50" />
      </div>
      <p className="mt-4 text-xs text-slate-400">إجمالي الطلبات المكتملة: {d.completedCount ?? 0}</p>
    </div>
  );
}
