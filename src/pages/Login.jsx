import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock, Phone, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone.trim(), password);
      navigate('/payments', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-700 to-brand-500 p-4">
      <form onSubmit={submit} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-50 p-4 rounded-2xl mb-3">
            <Wrench className="text-brand-600" size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">فُرِجَت</h1>
          <p className="text-sm text-slate-500">دخول لوحة تحكم الإدارة</p>
        </div>

        <label className="block mb-4">
          <span className="text-sm font-medium text-slate-600">رقم الهاتف</span>
          <div className="mt-1 flex items-center gap-2 border rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500">
            <Phone size={16} className="text-slate-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="flex-1 outline-none text-sm"
              placeholder="77xxxxxxx"
              dir="ltr"
            />
          </div>
        </label>

        <label className="block mb-5">
          <span className="text-sm font-medium text-slate-600">كلمة المرور</span>
          <div className="mt-1 flex items-center gap-2 border rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500">
            <Lock size={16} className="text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="flex-1 outline-none text-sm"
              placeholder="••••••••"
            />
          </div>
        </label>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          دخول
        </button>
      </form>
    </div>
  );
}
