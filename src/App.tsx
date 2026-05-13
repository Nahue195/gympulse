import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';

// Lazy load pages for code splitting
const Auth = lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })));
const Training = lazy(() => import('./pages/Training').then(m => ({ default: m.Training })));
const Routines = lazy(() => import('./pages/Routines').then(m => ({ default: m.Routines })));
const PublicRoutines = lazy(() => import('./pages/PublicRoutines').then(m => ({ default: m.PublicRoutines })));
const Statistics = lazy(() => import('./pages/Statistics').then(m => ({ default: m.Statistics })));
const Measures = lazy(() => import('./pages/Measures').then(m => ({ default: m.Measures })));
const Community = lazy(() => import('./pages/Community').then(m => ({ default: m.Community })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const UserProfile = lazy(() => import('./pages/UserProfile').then(m => ({ default: m.UserProfile })));
const Messages = lazy(() => import('./pages/Messages').then(m => ({ default: m.Messages })));
// Loading spinner for lazy loaded components
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-3 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Training />} />
          <Route path="rutinas" element={<Routines />} />
          <Route path="rutinas/explorar" element={<PublicRoutines />} />
          <Route path="estadisticas" element={<Statistics />} />
          <Route path="medidas" element={<Measures />} />
          <Route path="comunidad" element={<Community />} />
          <Route path="mensajes" element={<Messages />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="usuario/:username" element={<UserProfile />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
