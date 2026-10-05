import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import AuthLayout from "./features/auth/layouts/AuthLayout";
import LostFoundLayout from "./features/lost-founds/layouts/LostFoundLayout";
import HomePage from "./features/lost-founds/pages/HomePage";

const LoginPage = lazy(() => import("./features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("./features/auth/pages/RegisterPage"));
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