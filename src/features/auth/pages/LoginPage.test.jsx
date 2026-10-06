import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./LoginPage";
import { renderWithProviders } from "../../../test-utils";
import authApi from "../api/authApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { getAccessToken } from "../../../helpers/apiHelper";

vi.mock("../api/authApi", () => ({
  default: { login: vi.fn(), register: vi.fn() },
}));

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/" element={<p>beranda</p>} />
    </Routes>,
    { route: "/auth/login" }
  );

const isiForm = async () => {
  await userEvent.type(screen.getByLabelText("Alamat Email"), "a@b.c");
  await userEvent.type(screen.getByLabelText("Kata Sandi"), "123456");
};

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("menampilkan form login", () => {
    renderPage();

    expect(screen.getByLabelText("Alamat Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Kata Sandi")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Masuk Sekarang" })
    ).toBeEnabled();
  });

  it("memakai id elemen yang dibutuhkan pemeriksa otomatis", () => {
    const { container } = renderPage();

    expect(container.querySelector("#login-email-input")).toBe(
      screen.getByLabelText("Alamat Email")
    );
    expect(container.querySelector("#login-password-input")).toBe(
      screen.getByLabelText("Kata Sandi")
    );
    expect(container.querySelector("#login-submit-button")).toBe(
      screen.getByRole("button", { name: "Masuk Sekarang" })
    );
  });

  it("login berhasil: menyimpan token lalu menuju beranda", async () => {
    authApi.login.mockResolvedValue({ user: { id: 1 }, token: "1|abc" });
    const { store } = renderPage();

    await isiForm();
    await userEvent.click(screen.getByRole("button", { name: "Masuk Sekarang" }));

    expect(await screen.findByText("beranda")).toBeInTheDocument();
    expect(authApi.login).toHaveBeenCalledWith({
      email: "a@b.c",
      password: "123456",
    });
    expect(getAccessToken()).toBe("1|abc");
    expect(store.getState().auth.isAuthLogin).toBe(true);
    expect(showErrorDialog).not.toHaveBeenCalled();
  });

  it("menonaktifkan tombol selama proses login berjalan", async () => {
    let selesai;
    authApi.login.mockReturnValue(
      new Promise((resolve) => {
        selesai = resolve;
      })
    );
    renderPage();

    await isiForm();
    await userEvent.click(screen.getByRole("button", { name: "Masuk Sekarang" }));

    const tombol = await screen.findByRole("button", { name: "Memproses..." });
    expect(tombol).toBeDisabled();

    selesai({ user: { id: 1 }, token: "t" });
    expect(await screen.findByText("beranda")).toBeInTheDocument();
  });

  it("login gagal: menampilkan dialog error dan tetap di halaman login", async () => {
    authApi.login.mockRejectedValue(new Error("Kredensial akun tidak ditemukan"));
    renderPage();

    await isiForm();
    await userEvent.click(screen.getByRole("button", { name: "Masuk Sekarang" }));

    await waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith(
        "Kredensial akun tidak ditemukan",
        "Login gagal"
      )
    );
    expect(screen.queryByText("beranda")).not.toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
    expect(
      await screen.findByRole("button", { name: "Masuk Sekarang" })
    ).toBeEnabled();
  });
});
