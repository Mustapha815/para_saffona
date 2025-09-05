
import React from 'react';
import { Routes, Route } from 'react-router-dom';


import Home from './pages/Home';
import Login from '../Auth/Login';
import Register from '../Auth/Register';
import VerfiyGmail from '../Auth/VerfiyGmail';
import VerifyCode from '../Auth/VerifyCode';
import ResetPassword from '../Auth/ResetPassword';
import ShoppingCart from './Layout/ShoppingCart';
import FavoritesPage from './Layout/FavoritesPage';
import AccountPage from './pages/AccountPage';
import ChangePassword from '../Auth/changepassword';
import FilteredProductsByBrand from './Layout/FilterByBrand';

const ClientApp = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
       <Route path="/login" element={<Login />} />
       <Route path="/register" element={<Register />} />
       <Route path="/verify-gmail" element={<VerfiyGmail/>} />
       <Route path="/verify-code" element={<VerifyCode />} />
       <Route path='/reset-password' element={<ResetPassword/>} />
       <Route path='/shopping-cart' element={<ShoppingCart/>} />
       <Route path='/favorites' element={<FavoritesPage/>} />
       <Route path='/account-profile' element={<AccountPage/>} />
       <Route path='/change-password' element={<ChangePassword/>} />
       <Route path='/brands/:brandId' element={<FilteredProductsByBrand/>} />
       {/* <Route path="/brands/:brandSlug" element={<BrandProductsPage />} /> */}




        {/* Add more client routes here */}
      </Routes>
    </div>
  );
};

export default ClientApp;
