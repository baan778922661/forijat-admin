import api from './client';

/** Thin wrappers matching the backend routes exactly. */

// Auth
export const login = (phone, password) => api.post('/auth/login', { phone, password });

// Payments verification queue
export const getPaymentQueue = () => api.get('/admin/orders/payment-queue');
export const approvePayment = (orderId) => api.post(`/admin/orders/${orderId}/approve`);
export const rejectPayment = (orderId, reason) =>
  api.post(`/admin/orders/${orderId}/reject-payment`, { reason });

// Daily payouts
export const getWithdrawals = (status = 'pending') =>
  api.get('/admin/withdrawals', { params: { status } });
export const completeWithdrawal = (txId, { referenceNumber, receiptFile }) => {
  const fd = new FormData();
  fd.append('referenceNumber', referenceNumber);
  if (receiptFile) fd.append('receipt', receiptFile);
  return api.post(`/admin/withdrawals/${txId}/complete`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const rejectWithdrawal = (txId) => api.post(`/admin/withdrawals/${txId}/reject`);

// Orders monitoring & technicians management
export const getOrders = (status) => api.get('/admin/orders', { params: status ? { status } : {} });
export const getTechnicians = () => api.get('/admin/technicians');
export const toggleTechnicianVerify = (id) => api.patch(`/admin/technicians/${id}/verify`);

// Payment methods management
export const getAllPaymentMethods = () => api.get('/payment-methods/all');
export const createPaymentMethod = (data) => api.post('/payment-methods', data);
export const updatePaymentMethod = (id, data) => api.patch(`/payment-methods/${id}`, data);
export const togglePaymentMethod = (id) => api.patch(`/payment-methods/${id}/toggle`);
