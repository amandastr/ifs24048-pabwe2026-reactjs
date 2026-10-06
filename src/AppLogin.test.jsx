import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import App from "./App";
import { renderWithProviders } from "./test-utils";

// Tanpa mock halaman: memastikan rantai AuthLayout -> LoginPage benar-benar
// termuat di alamat /auth/login (regresi: AuthLayout rusak membuat halaman kosong).
describe("halaman /auth/login (tanpa mock)", () => {
  it("memuat form login lengkap dengan id elemen yang dibutuhkan", async () => {
    const { container } = renderWithProviders(<App />, { route: "/auth/login" });

    expect(
      await screen.findByRole("button", { name: "Masuk Sekarang" })
    ).toBeInTheDocument();
    expect(container.querySelector("#login-email-input")).not.toBeNull();
    expect(container.querySelector("#login-password-input")).not.toBeNull();
    expect(container.querySelector("#login-submit-button")).not.toBeNull();
    expect(container.querySelectorAll("main")).toHaveLength(1);
  });

  it("memuat form registrasi di alamat /auth/register", async () => {
    renderWithProviders(<App />, { route: "/auth/register" });

    expect(
      await screen.findByRole("button", { name: "Daftar Sekarang" })
    ).toBeInTheDocument();
  });
});
