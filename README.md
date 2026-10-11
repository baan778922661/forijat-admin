# فُرِجَت — لوحة تحكم الإدارة (React + Vite + Tailwind)

لوحة تشغيلية للإدارة: مراجعة سندات الدفع، تنفيذ السحوبات اليومية، وإدارة قنوات الدفع ديناميكياً.

## التشغيل
```bash
cp .env.example .env   # عيّن VITE_API_URL إلى عنوان الـ Backend على Render
npm install
npm run dev            # http://localhost:5173
npm run build          # نسخة الإنتاج في dist/
```

> الدخول بحساب `admin` الذي أنشأه `seed/seed.js` في الـ Backend.

## الصفحات ↔ مسارات الـ API
| الصفحة | المسارات المستهلكة |
|---|---|
| تسجيل الدخول | `POST /auth/login` (يرفض غير admin) |
| التحقق من المدفوعات | `GET /admin/orders/payment-queue` · `POST /admin/orders/:id/approve` · `POST /admin/orders/:id/reject-payment` |
| السحوبات اليومية | `GET /admin/withdrawals?status=` · `POST /admin/withdrawals/:id/complete` (multipart: `receipt` + `referenceNumber`) · `POST /admin/withdrawals/:id/reject` |
| قنوات الدفع | `GET /payment-methods/all` · `POST /payment-methods` · `PATCH /payment-methods/:id` · `PATCH /payment-methods/:id/toggle` |

## ملاحظات
- `src/api/client.js` يحقن توكن JWT تلقائياً ويعيد التوجيه للدخول عند 401/403.
- اعتماد سند الكشف يشغّل `$geoNear` في الـ Backend ويعرض اسم الفني المُسند فوراً.
- السحوبات مجمّعة حسب القناة مع إجمالي كل دفعة لتسهيل التحويل البنكي الجماعي.
- الواجهة عربية RTL بالكامل (خط Tajawal).
