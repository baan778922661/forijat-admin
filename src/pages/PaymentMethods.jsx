import { useCallback, useEffect, useState } from 'react';
import { CreditCard, Landmark, Loader2, Pencil, Plus, Power, RefreshCw, Wallet, X } from 'lucide-react';
import {
  createPaymentMethod,
  getAllPaymentMethods,
  togglePaymentMethod,
  updatePaymentMethod,
} from '../api/endpoints';

const TYPE_META = {
  wallet: { label: 'محفظة إلكترونية', icon: Wallet },
  bank: { label: 'حساب بنكي', icon: Landmark },
  money_transfer: { label: 'شبكة صرافة', icon: CreditCard },
};

const EMPTY_FORM = {
  type: 'wallet',
  name: '',
  logoUrl: '',
  accountDetails: { accountNumber: '', accountName: '', extraNote: '' },
  isActive: true,
};

export default function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', data }
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAllPaymentMethods();
      setMethods(data.methods || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openCreate = () => { setForm(EMPTY_FORM); setModal({ mode: 'create' }); };
  const openEdit = (m) => {
    setForm({
      type: m.type,
      name: m.name,
      logoUrl: m.logoUrl || '',
      accountDetails: {
        accountNumber: m.accountDetails?.accountNumber || '',
        accountName: m.accountDetails?.accountName || '',
        extraNote: m.accountDetails?.extraNote || '',
      },
      isActive: m.isActive,
    });
    setModal({ mode: 'edit', id: m._id });
  };

  const submit = async () => {
    if (!form.name.trim()) return flash('اسم القناة مطلوب');
    setBusy(true);
    try {
      if (modal.mode === 'create') await createPaymentMethod(form);
      else await updatePaymentMethod(modal.id, form);
      flash(modal.mode === 'create' ? 'تمت إضافة القناة ✓' : 'تم تحديث القناة ✓');
      setModal(null);
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'فشل الحفظ');
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = async (m) => {
    try {
      await togglePaymentMethod(m._id);
      flash(m.isActive ? 'تم تعطيل القناة' : 'تم تفعيل القناة');
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'فشل التبديل');
    }
  };

  const setDetail = (k, v) => setForm((f) => ({ ...f, accountDetails: { ...f.accountDetails, [k]: v } }));

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold">إدارة قنوات الدفع</h2>
          <p className="text-sm text-slate-500 mt-1">
            القنوات الفعّالة تظهر فوراً لتطبيقي العميل والفني — الإضافة والتعديل حصراً من هنا
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50">
            <RefreshCw size={15} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-4 py-2 text-sm font-bold"
          >
            <Plus size={16} /> قناة جديدة
          </button>
        </div>
      </header>

      {toast && (
        <div className="mb-4 bg-brand-50 border border-brand-100 text-brand-700 rounded-xl px-4 py-3 text-sm font-medium">{toast}</div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400"><Loader2 className="animate-spin inline ml-2" size={18} /> جارِ التحميل…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {methods.map((m) => {
            const Meta = TYPE_META[m.type] || TYPE_META.wallet;
            return (
              <div key={m._id} className={`bg-white rounded-2xl shadow-sm p-5 border-r-4 ${m.isActive ? 'border-emerald-500' : 'border-slate-300 opacity-70'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {m.logoUrl ? (
                      <img src={m.logoUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                        <Meta.icon size={18} className="text-brand-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold">{m.name}</h3>
                      <p className="text-xs text-slate-400">{Meta.label}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${m.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {m.isActive ? 'فعّالة' : 'معطلة'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 mb-4 bg-slate-50 rounded-xl p-3">
                  {m.accountDetails?.accountName && <p><b>الاسم:</b> {m.accountDetails.accountName}</p>}
                  {m.accountDetails?.accountNumber && <p><b>الحساب:</b> <span dir="ltr">{m.accountDetails.accountNumber}</span></p>}
                  {m.accountDetails?.extraNote && <p className="text-slate-400">{m.accountDetails.extraNote}</p>}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(m)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold py-2.5 rounded-lg"
                  >
                    <Pencil size={13} /> تعديل
                  </button>
                  <button
                    onClick={() => handleToggle(m)}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-lg ${
                      m.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    <Power size={13} /> {m.isActive ? 'تعطيل' : 'تفعيل'}
                  </button>
                </div>
              </div>
            );
          })}
          {methods.length === 0 && (
            <p className="col-span-full text-center text-slate-400 py-16">لا توجد قنوات — أضف أول قناة دفع</p>
          )}
        </div>
      )}

      {/* ===== Create / Edit modal ===== */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => !busy && setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-lg">{modal.mode === 'create' ? 'قناة دفع جديدة' : 'تعديل القناة'}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {Object.entries(TYPE_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setForm((f) => ({ ...f, type: key }))}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-bold transition-colors ${
                    form.type === key ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <meta.icon size={18} />
                  {meta.label}
                </button>
              ))}
            </div>

            <div className="space-y-3 mb-5">
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="اسم القناة * (مثال: محفظة جوالي)"
                className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                value={form.logoUrl}
                onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                placeholder="رابط الشعار (اختياري)"
                dir="ltr"
                className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                value={form.accountDetails.accountName}
                onChange={(e) => setDetail('accountName', e.target.value)}
                placeholder="اسم صاحب الحساب"
                className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                value={form.accountDetails.accountNumber}
                onChange={(e) => setDetail('accountNumber', e.target.value)}
                placeholder="رقم الحساب / المحفظة"
                dir="ltr"
                className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
              <textarea
                value={form.accountDetails.extraNote}
                onChange={(e) => setDetail('extraNote', e.target.value)}
                placeholder="ملاحظة تظهر للعميل/الفني (اختياري)"
                rows={2}
                className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            <button
              onClick={submit}
              disabled={busy}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              {modal.mode === 'create' ? 'إضافة القناة' : 'حفظ التعديلات'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
