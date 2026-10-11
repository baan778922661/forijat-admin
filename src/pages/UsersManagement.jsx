import { useCallback, useEffect, useState } from 'react';
import { Ban, Loader2, Pencil, RefreshCw, RotateCcw, Search, Trash2, Users, X } from 'lucide-react';
import { deleteUser, getUsers, toggleBanUser, updateUser } from '../api/endpoints';

/** إدارة الحسابات: بحث وفلاتر + تعديل + حظر/تفعيل + حذف */
export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [city, setCity] = useState('');
  const [toast, setToast] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getUsers({ ...(q && { q }), ...(role && { role }), ...(city && { city }) });
      setUsers(data.users || []);
    } finally {
      setLoading(false);
    }
  }, [q, role, city]);

  useEffect(() => { load(); }, [role, city]); // eslint-disable-line
  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const openEdit = (u) => {
    setForm({
      name: u.name || '', phone: u.phone || '', city: u.city || '',
      district: u.district || '', neighborhood: u.neighborhood || '',
      detailedAddress: u.detailedAddress || '',
      skills: (u.technicianProfile?.skills || []).join(', '),
    });
    setEditUser(u);
  };

  const saveEdit = async () => {
    setBusy(true);
    try {
      await updateUser(editUser._id, {
        name: form.name, phone: form.phone, city: form.city,
        district: form.district, neighborhood: form.neighborhood,
        detailedAddress: form.detailedAddress,
        ...(editUser.role === 'technician' && {
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      flash('تم حفظ التعديلات ✓');
      setEditUser(null);
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'فشل الحفظ');
    } finally {
      setBusy(false);
    }
  };

  const handleBan = async (u) => {
    const reason = u.isActive !== false ? window.prompt(`سبب حظر ${u.name}:`) : '';
    if (reason === null) return;
    try {
      await toggleBanUser(u._id, reason);
      flash(u.isActive !== false ? `تم حظر ${u.name}` : `تم تفعيل ${u.name} ✓`);
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'فشل الإجراء');
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`حذف ${u.name} نهائياً؟ لا يمكن التراجع.`)) return;
    try {
      await deleteUser(u._id);
      flash('تم حذف المستخدم');
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'فشل الحذف');
    }
  };

  const F = (k, label, ltr) => (
    <label className="block" key={k}>
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <input value={form[k] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
        dir={ltr ? 'ltr' : undefined}
        className="mt-1 w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
    </label>
  );

  return (
    <div>
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">إدارة الحسابات</h2>
          <p className="text-sm text-slate-500 mt-1">بحث وتعديل وحظر وحذف — صلاحية كاملة على العملاء والفنيين</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50">
          <RefreshCw size={15} />
        </button>
      </header>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white border rounded-xl px-3 flex-1 min-w-52">
          <Search size={15} className="text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="بحث بالاسم أو الهاتف ثم Enter" className="flex-1 py-2 text-sm outline-none" />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-white border rounded-xl px-3 py-2 text-sm">
          <option value="">كل الأدوار</option><option value="client">عملاء</option><option value="technician">فنيون</option>
        </select>
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="المحافظة"
          className="bg-white border rounded-xl px-3 py-2 text-sm w-32 outline-none" />
      </div>

      {toast && <div className="mb-4 bg-brand-50 border border-brand-100 text-brand-700 rounded-xl px-4 py-3 text-sm font-medium">{toast}</div>}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="px-4 py-3 text-right font-bold">المستخدم</th>
              <th className="px-4 py-3 text-right font-bold">الدور</th>
              <th className="px-4 py-3 text-right font-bold">المنطقة</th>
              <th className="px-4 py-3 text-right font-bold">الحالة</th>
              <th className="px-4 py-3 text-right font-bold">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="py-16 text-center text-slate-400"><Loader2 className="animate-spin inline ml-2" size={18} /> جارِ التحميل…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="py-16 text-center text-slate-400"><Users className="mx-auto mb-2 text-slate-300" size={36} /> لا نتائج</td></tr>
            ) : users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <p className="font-bold">{u.name}</p>
                  <p className="text-xs text-slate-400" dir="ltr">{u.phone}</p>
                </td>
                <td className="px-4 py-3 text-xs">{u.role === 'technician' ? 'فني' : u.role === 'client' ? 'عميل' : 'مدير'}</td>
                <td className="px-4 py-3 text-xs">{[u.city, u.district].filter(Boolean).join(' — ') || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${u.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                    {u.isActive !== false ? 'نشط' : 'محظور'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(u)} title="تعديل"
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg"><Pencil size={14} /></button>
                    <button onClick={() => handleBan(u)} title={u.isActive !== false ? 'حظر' : 'تفعيل'}
                      className={`p-2 rounded-lg ${u.isActive !== false ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                      {u.isActive !== false ? <Ban size={14} /> : <RotateCcw size={14} />}
                    </button>
                    <button onClick={() => handleDelete(u)} title="حذف"
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => !busy && setEditUser(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold">تعديل — {editUser.name}</h3>
              <button onClick={() => setEditUser(null)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-3 mb-5">
              {F('name', 'الاسم')}{F('phone', 'الهاتف', true)}{F('city', 'المحافظة')}
              {F('district', 'المديرية')}{F('neighborhood', 'الحي')}{F('detailedAddress', 'العنوان التفصيلي')}
              {editUser.role === 'technician' && F('skills', 'المهارات (مفصولة بفاصلة)', true)}
            </div>
            <button onClick={saveEdit} disabled={busy}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
              {busy && <Loader2 size={15} className="animate-spin" />} حفظ التعديلات
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
