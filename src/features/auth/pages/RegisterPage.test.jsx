import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import Swal from "sweetalert2";
import RegisterPage from "./RegisterPage";
import { renderWithProviders } from "../../../test-utils";
import authApi from "../api/authApi";

vi.mock("../api/authApi", () => ({
  default: { login: vi.fn(), register: vi.fn() },
}));

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn() },
}));

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/login" element={<p>halaman login</p>} />
    </Routes>,
    { route: "/auth/register" }
  );

const isiForm = async (password = "123456") => {
  await userEvent.type(screen.getByLabelText("Nama Lengkap"), "Amanda");
  await userEvent.type(screen.getByLabelText("Alamat Email"), "a@b.c");
  await userEvent.type(screen.getByLabelText("Kata Sandi"), password);
};

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Swal.fire.mockResolvedValue({ isConfirmed: true });
  });

  it("menampilkan form registrasi", () => {
    renderPage();

    expect(screen.getByLabelText("Nama Lengkap")).toBeInTheDocument();
    expect(screen.getByLabelText("Alamat Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Kata Sandi")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Daftar Sekarang" })
    ).toBeEnabled();
  });

  it("menolak kata sandi kurang dari 6 karakter", async () => {
    renderPage();

    await isiForm("123");
    await userEvent.click(screen.getByRole("button", { name: "Daftar Sekarang" }));

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "warning",
        title: "Kata sandi minimal 6 karakter",
      })
    );
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it("registrasi berhasil: tampil dialog, status direset, menuju login", async () => {
    authApi.register.mockResolvedValue("Berhasil melakukan pendaftaran");
    const { store } = renderPage();

    await isiForm();
    await userEvent.click(screen.getByRole("button", { name: "Daftar Sekarang" }));

    expect(await screen.findByText("halaman login")).toBeInTheDocument();
    expect(authApi.register).toHaveBeenCalledWith({
      name: "Amanda",
      email: "a@b.c",
      password: "123456",
    });
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "success", title: "Registrasi berhasil" })
    );
    expect(store.getState().auth.isAuthRegister).toBe(false);
  });

  it("menonaktifkan tombol selama proses registrasi berjalan", async () => {
    let selesai;
    authApi.register.mockReturnValue(
      new Promise((resolve) => {
        selesai = resolve;
      })
    );
    renderPage();

    await isiForm();
    await userEvent.click(screen.getByRole("button", { name: "Daftar Sekarang" }));

    expect(
      await screen.findByRole("button", { name: "Memproses..." })
    ).toBeDisabled();

    selesai("ok");
    expect(await screen.findByText("halaman login")).toBeInTheDocument();
  });

  it("registrasi gagal: menampilkan dialog error dan tetap di halaman", async () => {
    authApi.register.mockRejectedValue(new Error("Email sudah dipakai"));
    renderPage();

    await isiForm();
    await userEvent.click(screen.getByRole("button", { name: "Daftar Sekarang" }));

    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "error",
          title: "Registrasi gagal",
          text: "Email sudah dipakai",
        })
      )
    );
    expect(screen.queryByText("halaman login")).not.toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Daftar Sekarang" })
    ).toBeEnabled();
  });
});
