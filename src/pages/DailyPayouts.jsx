import { useCallback, useEffect, useState } from 'react';
import { Banknote, CheckCircle2, Loader2, RefreshCw, Upload, X, XCircle } from 'lucide-react';
import { completeWithdrawal, getWithdrawals, rejectWithdrawal } from '../api/endpoints';

const fmt = (n) => (n ?? 0).toLocaleString('ar-YE');
const TYPE_LABELS = { wallet: 'محفظة إلكترونية', bank: 'حساب بنكي', money_transfer: 'شبكة صرافة' };

export default function DailyPayouts() {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [modal, setModal] = useState(null); // transaction being fulfilled
  const [refNumber, setRefNumber] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getWithdrawals(status);
      setGrouped(data.grouped || {});
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const groups = Object.entries(grouped);
  const totalPending = groups.flatMap(([, g]) => g.items).reduce((s, t) => s + t.amount, 0);

  const openModal = (tx) => { setModal(tx); setRefNumber(''); setReceipt(null); };

  const submitComplete = async () => {
    if (!refNumber.trim()) return flash('أدخل رقم الإشعار/السند');
    setBusy(true);
    try {
      await completeWithdrawal(modal._id, { referenceNumber: refNumber.trim(), receiptFile: receipt });
      flash('تم تنفيذ السحب وخصمه من رصيد الفني المقفل ✓');
      setModal(null);
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'فشل تنفيذ السحب');
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (tx) => {
    if (!window.confirm(`رفض سحب ${fmt(tx.amount)} ر.ي للفني ${tx.technicianId?.name}؟ سيعود المبلغ لرصيده المتاح.`)) return;
    try {
      await rejectWithdrawal(tx._id);
      flash('تم رفض الطلب وإعادة المبلغ للرصيد المتاح');
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'فشل الرفض');
    }
  };

  return (
    <div>
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">السحوبات اليومية للفنيين</h2>
          <p className="text-sm text-slate-500 mt-1">
            مجمّعة حسب قناة الدفع لتنفيذها كدفعات — الإجمالي المعلق: <b className="text-brand-600">{fmt(totalPending)} ر.ي</b>
          </p>
        </div>
        <div className="flex gap-2">
          {['pending', 'completed', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-bold ${
                status === s ? 'bg-brand-600 text-white' : 'bg-white border hover:bg-slate-50'
              }`}
            >
              {s === 'pending' ? 'معلقة' : s === 'completed' ? 'منفذة' : 'مرفوضة'}
            </button>
          ))}
          <button onClick={load} className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50">
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      {toast && (
        <div className="mb-4 bg-brand-50 border border-brand-100 text-brand-700 rounded-xl px-4 py-3 text-sm font-medium">{toast}</div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400"><Loader2 className="animate-spin inline ml-2" size={18} /> جارِ التحميل…</div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-20 text-center text-slate-400">
          <Banknote className="mx-auto mb-3 text-slate-300" size={40} />
          لا توجد طلبات سحب {status === 'pending' ? 'معلقة' : ''} حالياً
        </div>
      ) : (
        groups.map(([key, group]) => (
          <section key={key} className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b">
              {group.method?.logoUrl && <img src={group.method.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />}
              <div>
                <h3 className="font-extrabold">{group.method?.name || 'قناة غير محددة'}</h3>
                <p className="text-xs text-slate-500">{TYPE_LABELS[group.method?.type] || ''} — {group.items.length} طلب</p>
              </div>
              <span className="mr-auto font-extrabold text-brand-600">
                {fmt(group.items.reduce((s, t) => s + t.amount, 0))} ر.ي
              </span>
            </div>
            <table className="w-full text-sm">
              <thead className="text-slate-400 text-xs">
                <tr>
                  <th className="px-5 py-2.5 text-right font-bold">الفني</th>
                  <th className="px-5 py-2.5 text-right font-bold">بيانات الاستلام</th>
                  <th className="px-5 py-2.5 text-right font-bold">المبلغ</th>
                  <th className="px-5 py-2.5 text-right font-bold">التاريخ</th>
                  {status === 'pending' && <th className="px-5 py-2.5 text-right font-bold">إجراءات</th>}
                  {status !== 'pending' && <th className="px-5 py-2.5 text-right font-bold">الإشعار</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {group.items.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <p className="font-bold">{tx.technicianId?.name || '—'}</p>
                      <p className="text-xs text-slate-400" dir="ltr">{tx.technicianId?.phone}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600">
                      {Object.entries(tx.payoutDetails?.recipientInfo || {}).map(([k, v]) => (
                        <div key={k}><b>{k}:</b> <span dir="ltr">{String(v)}</span></div>
                      ))}
                    </td>
                    <td className="px-5 py-3 font-extrabold">{fmt(tx.amount)} ر.ي</td>
                    <td className="px-5 py-3 text-xs text-slate-400">
                      {new Date(tx.createdAt).toLocaleString('ar-YE')}
                    </td>
                    {status === 'pending' ? (
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(tx)}
                            className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-3 py-2 rounded-lg"
                          >
                            <CheckCircle2 size={13} /> تنفيذ السحب
                          </button>
                          <button
                            onClick={() => handleReject(tx)}
                            className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2 rounded-lg"
                          >
                            <XCircle size={13} />
                          </button>
                        </div>
                      </td>
                    ) : (
                      <td className="px-5 py-3 text-xs" dir="ltr">
                        {tx.payoutDetails?.referenceNumber || '—'}
                        {tx.payoutDetails?.receiptImageUrl && (
                          <a href={tx.payoutDetails.receiptImageUrl} target="_blank" rel="noreferrer" className="block text-brand-600 hover:underline">الإيصال ↗</a>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))
      )}

      {/* ===== Fulfill withdrawal modal ===== */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => !busy && setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-lg">تنفيذ سحب — {modal.technicianId?.name}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>

            <div className="bg-brand-50 rounded-xl px-4 py-3 mb-5 text-center">
              <p className="text-xs text-brand-700 mb-1">المبلغ المطلوب تحويله</p>
              <p className="text-2xl font-extrabold text-brand-700">{fmt(modal.amount)} ر.ي</p>
            </div>

            <label className="block mb-4">
              <span className="text-sm font-medium text-slate-600">رقم الإشعار / السند *</span>
              <input
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="مثال: TRX-20261007-001"
                dir="ltr"
              />
            </label>

            <label className="block mb-6">
              <span className="text-sm font-medium text-slate-600">صورة إيصال التحويل</span>
              <div className="mt-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-brand-400 relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="mx-auto text-slate-400 mb-1" size={20} />
                <p className="text-xs text-slate-500">{receipt ? receipt.name : 'اضغط لاختيار صورة الإيصال'}</p>
              </div>
            </label>

            <button
              onClick={submitComplete}
              disabled={busy}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              تأكيد التحويل وإقفال السحب
            </button>
            <p className="text-[11px] text-slate-400 mt-3 text-center">
              سيُخصم المبلغ نهائياً من الرصيد المقفل للفني ويصله إشعار بالإتمام
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
