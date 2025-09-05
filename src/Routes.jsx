import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LanguageProvider } from './contexts/LanguageContext';
import AdminApp from './components/Admin/AdminApp';
import ClientApp from './components/Client/ClientApp';
import { logout, me } from './api/auth';
import ErrorPage from './components/Admin/helpers/ErrorPage';

function AppRoutes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isLogged = localStorage.getItem('islogged') === 'true';

  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: me,
    enabled: isLogged,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    onError: (err) => {
      if (err.response?.status !== 401) console.error(err);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.setItem('islogged', 'false');
      queryClient.clear();
      navigate('/');
      console.log('Logged out successfully');
    },
    onError: () => {
      localStorage.setItem('islogged', 'false');
      queryClient.clear();
      navigate('/');
    },
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'islogged') {
        const loggedIn = localStorage.getItem('islogged') === 'true';
        if (!loggedIn) {
          logoutMutation.mutate();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [logoutMutation]);

  if (isLoading) return <p>Loading...</p>;

  if (isError) {
    localStorage.setItem('islogged', 'false');
  }

  return (
    <LanguageProvider>
      <Routes>
        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={userData?.role_id === 1 ? <AdminApp /> : <Navigate to="/" replace />}
        />

        {/* Client routes */}
        <Route path="/*" element={<ClientApp />} />
         <Route path="*" element={<ErrorPage />} />
      </Routes>
    </LanguageProvider>
  );
}

export default AppRoutes;
