import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import PaymentsVerification from './pages/PaymentsVerification';
import OrdersMonitor from './pages/OrdersMonitor';
import Technicians from './pages/Technicians';
import LiveOtps from './pages/LiveOtps';
import UsersManagement from './pages/UsersManagement';
import DailyPayouts from './pages/DailyPayouts';
import PaymentMethods from './pages/PaymentMethods';

function Protected({ children }) {
  const { isAuthed } = useAuth();
  return isAuthed ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/payments" element={<PaymentsVerification />} />
        <Route path="/orders" element={<OrdersMonitor />} />
        <Route path="/technicians" element={<Technicians />} />
        <Route path="/otps" element={<LiveOtps />} />
        <Route path="/users" element={<UsersManagement />} />
        <Route path="/payouts" element={<DailyPayouts />} />
        <Route path="/methods" element={<PaymentMethods />} />
      </Route>
      <Route path="*" element={<Navigate to="/payments" replace />} />
    </Routes>
  );
}
