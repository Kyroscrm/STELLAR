
import { Outlet } from 'react-router-dom';
import AdminHeader from '@/components/AdminHeader';
import AdminHeaderNav from '@/components/AdminHeaderNav';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <AdminHeader />
          <AdminHeaderNav />
        </div>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
