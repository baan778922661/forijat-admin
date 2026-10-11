const MAP = {
  pending_payment_proof: { label: 'بانتظار سند الدفع', cls: 'bg-amber-100 text-amber-700' },
  payment_verifying: { label: 'قيد مراجعة السند', cls: 'bg-blue-100 text-blue-700' },
  searching_technician: { label: 'معتمد — بحث عن فني', cls: 'bg-purple-100 text-purple-700' },
  assigned: { label: 'تم إسناد فني', cls: 'bg-indigo-100 text-indigo-700' },
  in_progress: { label: 'قيد التنفيذ', cls: 'bg-cyan-100 text-cyan-700' },
  price_update_pending: { label: 'بانتظار موافقة أجر اليد', cls: 'bg-purple-100 text-purple-700' },
  completed: { label: 'مكتمل', cls: 'bg-emerald-100 text-emerald-700' },
  disputed: { label: 'متنازع عليه', cls: 'bg-red-100 text-red-700' },
  cancelled: { label: 'ملغي', cls: 'bg-slate-200 text-slate-600' },
  pending: { label: 'معلق', cls: 'bg-amber-100 text-amber-700' },
  rejected: { label: 'مرفوض', cls: 'bg-red-100 text-red-700' },
};

export default function StatusBadge({ status }) {
  const s = MAP[status] || { label: status, cls: 'bg-slate-200 text-slate-600' };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
}
