import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Eye, ImageOff, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { approvePayment, getPaymentQueue, rejectPayment } from '../api/endpoints';
import StatusBadge from '../components/StatusBadge';
import ProofModal from '../components/ProofModal';

const CATEGORY_LABELS = { solar: 'طاقة شمسية', electricity: 'كهرباء', ac: 'تكييف', plumbing: 'سباكة' };
const fmt = (n) => (n ?? 0).toLocaleString('ar-YE');

export default function PaymentsVerification() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [proof, setProof] = useState(null); // { url, title }
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getPaymentQueue();
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleApprove = async (order) => {
    setBusyId(order._id);
    try {
      const { data } = await approvePayment(order._id);
      flash(data.assigned ? `تم الاعتماد وإسناد الفني: ${data.assigned.name}` : 'تم اعتماد الدفع');
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'فشل الاعتماد');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (order) => {
    const reason = window.prompt('سبب رفض السند (سيُعاد الطلب للعميل لإعادة الرفع):');
    if (reason === null) return;
    setBusyId(order._id);
    try {
      await rejectPayment(order._id, reason);
      flash('تم رفض السند وإعادة الطلب للعميل');
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'فشل الرفض');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold">التحقق من مدفوعات العملاء</h2>
          <p className="text-sm text-slate-500 mt-1">
            الطلبات في حالة «قيد مراجعة السند» — الاعتماد يحوّل الطلب للضمان المالي ويرسل أقرب فني مؤهل
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          <RefreshCw size={15} /> تحديث
        </button>
      </header>

      {toast && (
        <div className="mb-4 bg-brand-50 border border-brand-100 text-brand-700 rounded-xl px-4 py-3 text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="px-4 py-3 text-right font-bold">العميل</th>
              <th className="px-4 py-3 text-right font-bold">التخصص</th>
              <th className="px-4 py-3 text-right font-bold">نوع السند</th>
              <th className="px-4 py-3 text-right font-bold">المبلغ</th>
              <th className="px-4 py-3 text-right font-bold">الحالة</th>
              <th className="px-4 py-3 text-right font-bold">السند</th>
              <th className="px-4 py-3 text-right font-bold">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="py-16 text-center text-slate-400">
                <Loader2 className="animate-spin inline ml-2" size={18} /> جارِ التحميل…
              </td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-slate-400">
                لا توجد سندات بانتظار المراجعة ✓
              </td></tr>
            ) : orders.map((o) => {
              const isLabor = !!o.financials?.laborPaymentProofUrl && !!o.technicianId;
              const proofUrl = isLabor ? o.financials.laborPaymentProofUrl : o.financials?.inspectionPaymentProofUrl;
              const amount = isLabor ? o.financials.additionalLaborFee : o.financials?.inspectionFee;
              return (
                <tr key={o._id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-bold">{o.clientId?.name || '—'}</p>
                    <p className="text-xs text-slate-400" dir="ltr">{o.clientId?.phone}</p>
                  </td>
                  <td className="px-4 py-3">{CATEGORY_LABELS[o.serviceCategory] || o.serviceCategory}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold ${isLabor ? 'text-purple-600' : 'text-blue-600'}`}>
                      {isLabor ? 'أجر يد إضافي' : 'رسوم كشف'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold">{fmt(amount)} ر.ي</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3">
                    {proofUrl ? (
                      <button
                        onClick={() => setProof({ url: proofUrl, title: `سند الطلب #${o._id.slice(-6)}` })}
                        className="flex items-center gap-1.5 text-brand-600 hover:underline text-xs font-bold"
                      >
                        <Eye size={14} /> عرض السند
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <ImageOff size={14} /> لا يوجد
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        disabled={busyId === o._id}
                        onClick={() => handleApprove(o)}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-50"
                      >
                        {busyId === o._id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                        اعتماد
                      </button>
                      <button
                        disabled={busyId === o._id}
                        onClick={() => handleReject(o)}
                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-50"
                      >
                        <XCircle size={13} /> رفض
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ProofModal url={proof?.url} title={proof?.title} onClose={() => setProof(null)} />
    </div>
  );
}
