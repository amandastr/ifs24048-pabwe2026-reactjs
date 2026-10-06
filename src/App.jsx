import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import AuthLayout from "./features/auth/layouts/AuthLayout";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import LostFoundLayout from "./features/lost-founds/layouts/LostFoundLayout";
import HomePage from "./features/lost-founds/pages/HomePage";

// Halaman login dan register dimuat langsung agar form sudah ada saat halaman tampil.
// Halaman dashboard lainnya dimuat saat dibutuhkan (lazy).
const DetailPage = lazy(() => import("./features/lost-founds/pages/DetailPage"));
const StatsPage = lazy(() => import("./features/lost-founds/pages/StatsPage"));
const UsersPage = lazy(() => import("./features/users/pages/UsersPage"));
const ProfilePage = lazy(() => import("./features/users/pages/ProfilePage"));

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Auth routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Protected dashboard routes */}
        <Route path="/" element={<LostFoundLayout />}>
          <Route index element={<HomePage />} />
          <Route path="lost-founds/:id" element={<DetailPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
