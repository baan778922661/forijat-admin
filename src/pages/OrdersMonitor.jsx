import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, Loader2, RefreshCw } from 'lucide-react';
import { getOrders, getTechnicians, assignTechnician } from '../api/endpoints';
import StatusBadge from '../components/StatusBadge';

const CATEGORY_LABELS = { solar: 'طاقة شمسية', electricity: 'كهرباء', ac: 'تكييف', plumbing: 'سباكة' };
const STATUS_FILTERS = [
  ['', 'الكل'],
  ['pending_payment_proof', 'بانتظار السند'],
  ['payment_verifying', 'قيد المراجعة'],
  ['assigned', 'مُسند'],
  ['in_progress', 'قيد التنفيذ'],
  ['completed', 'مكتمل'],
  ['disputed', 'متنازع عليه'],
  ['cancelled', 'ملغي'],
];
const fmt = (n) => (n ?? 0).toLocaleString('ar-YE');

const setWarranty = async (id) => {
  const days = window.prompt('مدة الضمان بالأيام (مثال: 14، 30، 90):', '14');
  if (!days) return;
  await api.put(`/admin/orders/${id}/warranty`, { days: parseInt(days) });
  alert('تم اعتماد مدة الضمان ✓');
};

export default function OrdersMonitor() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [techs, setTechs] = useState([]);

  useEffect(() => {
    getTechnicians().then(({ data }) =>
      setTechs((data.technicians || []).filter((t) => t.isVerified && t.technicianProfile?.isAvailable !== false))
    ).catch(() => {});
  }, []);

  const handleAssign = async (orderId, technicianId) => {
    if (!technicianId) return;
    try {
      const { data } = await assignTechnician(orderId, technicianId);
      setOrders((prev) => prev.map((x) => (x._id === orderId ? { ...x, status: 'assigned', technicianId: { name: data.assigned?.name } } : x)));
    } catch (err) {
      alert(err.response?.data?.message || 'فشل الإسناد');
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getOrders(status || undefined);
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">مراقبة الطلبات</h2>
          <p className="text-sm text-slate-500 mt-1">جميع الطلبات المفتوحة والمكتملة مع العميل والفني والحالة المالية</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50">
          <RefreshCw size={15} /> تحديث
        </button>
      </header>

      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatus(key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${
              status === key ? 'bg-brand-600 text-white' : 'bg-white border hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="px-4 py-3 text-right font-bold">الطلب</th>
              <th className="px-4 py-3 text-right font-bold">العميل</th>
              <th className="px-4 py-3 text-right font-bold">الفني</th>
              <th className="px-4 py-3 text-right font-bold">المبلغ</th>
              <th className="px-4 py-3 text-right font-bold">الحالة</th>
              <th className="px-4 py-3 text-right font-bold">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="py-16 text-center text-slate-400">
                <Loader2 className="animate-spin inline ml-2" size={18} /> جارِ التحميل…
              </td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center text-slate-400">
                <ClipboardList className="mx-auto mb-2 text-slate-300" size={36} />
                لا توجد طلبات بهذا الفلتر
              </td></tr>
            ) : orders.map((o) => {
              const total = (o.financials?.inspectionFee || 0) + (o.financials?.additionalLaborFee || 0);
              return (
                <tr key={o._id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-bold">{CATEGORY_LABELS[o.serviceCategory] || o.serviceCategory}</p>
                    <p className="text-xs text-slate-400" dir="ltr">#{o._id.slice(-6)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.clientId?.name || '—'}</p>
                    <p className="text-xs text-slate-400" dir="ltr">{o.clientId?.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    {o.technicianId ? (
                      <>
                        <p className="font-medium">{o.technicianId.name}</p>
                        <p className="text-xs text-slate-400" dir="ltr">{o.technicianId.phone}</p>
                      </>
                    ) : ['searching_technician', 'payment_verifying'].includes(o.status) ? (
                      <select defaultValue="" onChange={(e) => handleAssign(o._id, e.target.value)}
                        className="text-xs border rounded-lg px-2 py-1.5 bg-purple-50 border-purple-200 max-w-36">
                        <option value="" disabled>إسناد يدوي…</option>
                        {techs.map((t) => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                    ) : <span className="text-xs text-slate-400">لم يُسند بعد</span>}
                  </td>
                  <td className="px-4 py-3 font-bold">{fmt(total)} ر.ي</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(o.createdAt).toLocaleDateString('ar-YE')}
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
