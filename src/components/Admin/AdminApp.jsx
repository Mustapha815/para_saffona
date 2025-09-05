import { Routes, Route } from 'react-router-dom';
import AdminHeader from '../Admin/Layout/AdminHeader';
import AdminSidebar from '../Admin/Layout/AdminSidebar';
import Dashboard from './Layout/Dashboard';
import ProductList from './Layout/ProductList';
import CategoriesManagement from './Layout/CategoriesManagement';
import CompaniesManagement from './Layout/Companies';
import AdminOrdersDashboard from './Layout/AdminOrdersDashboard';
import CustomersComponent from './Layout/CustomersComponent';
import PackManagement from './Layout/PackManagement';
import AdminProfile from './Layout/AdminProfile';
import Notifications from './Layout/Notifications';

const AdminApp = () => {
  
  return (
    <>
   
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/20 `}>
      <AdminHeader />
      <div className={`flex `}>
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
             <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/categories" element={<CategoriesManagement/>} />
            <Route path="/companies" element={<CompaniesManagement/>} />
            <Route path="/orders-dashboard" element={<AdminOrdersDashboard/>} />
            <Route path="/customers" element={<CustomersComponent/>} />
            <Route path="/pack-management" element={<PackManagement />} />
            <Route path="/admin-profile" element={<AdminProfile />} />
            <Route path="/notifications" element={<Notifications />} />

            {/* Future routes for customers, reports, settings can be added here */}
          </Routes>
        </main>
      </div>
    </div>
    </>
  );
};

export default AdminApp;
