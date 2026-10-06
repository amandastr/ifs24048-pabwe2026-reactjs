import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { renderWithProviders } from "../../../test-utils";
import { getInitialState } from "../states/reducer";

const renderLayout = (route, isAuthLogin = false) =>
  renderWithProviders(
    <Routes>
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<p>isi login</p>} />
        <Route path="register" element={<p>isi register</p>} />
      </Route>
      <Route path="/" element={<p>beranda</p>} />
    </Routes>,
    {
      route,
      preloadedState: { auth: { ...getInitialState(), isAuthLogin } },
    }
  );

describe("AuthLayout", () => {
  it("menampilkan judul, slogan, dan konten halaman anak", () => {
    renderLayout("/auth/login");

    expect(
      screen.getByRole("heading", { level: 1, name: "Delcom Lost & Founds" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Laporkan dan temukan barang hilang dengan mudah")
    ).toBeInTheDocument();
    expect(screen.getByText("isi login")).toBeInTheDocument();
  });

  it("memiliki tepat satu landmark main (aksesibilitas)", () => {
    renderLayout("/auth/login");

    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("menandai tab aktif pada alamat login", () => {
    renderLayout("/auth/login");

    expect(screen.getByRole("link", { name: "Masuk" })).toHaveClass("bg-white");
    expect(screen.getByRole("link", { name: "Daftar" })).not.toHaveClass(
      "bg-white"
    );
  });

  it("menandai tab aktif pada alamat register", () => {
    renderLayout("/auth/register");

    expect(screen.getByText("isi register")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Daftar" })).toHaveClass("bg-white");
    expect(screen.getByRole("link", { name: "Masuk" })).not.toHaveClass(
      "bg-white"
    );
  });

  it("mengalihkan pengguna yang sudah login ke beranda", () => {
    renderLayout("/auth/login", true);

    expect(screen.getByText("beranda")).toBeInTheDocument();
    expect(screen.queryByText("isi login")).not.toBeInTheDocument();
  });
});
