import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "./ProfilePage";
import { renderWithProviders } from "../../../test-utils";
import userApi from "../api/userApi";
import {
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "../../../helpers/toolsHelper";

vi.mock("../api/userApi", () => ({
  default: {
    getProfile: vi.fn(),
    getUsers: vi.fn(),
    getUserById: vi.fn(),
    updateProfile: vi.fn(),
    updatePhoto: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showWarningDialog: vi.fn(),
}));

const profile = { id: 1, name: "Amanda", email: "a@b.c", photo: null };
const file = new File(["x"], "foto.png", { type: "image/png" });

const ambilInputFoto = () => screen.getByLabelText("Unggah foto profil");

const isiPassword = async (lama, baru, konfirmasi) => {
  await userEvent.type(screen.getByLabelText("Kata sandi lama"), lama);
  await userEvent.type(screen.getByLabelText("Kata sandi baru"), baru);
  await userEvent.type(screen.getByLabelText("Konfirmasi kata sandi baru"), konfirmasi);
};

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userApi.getProfile.mockResolvedValue(profile);
  });

  it("memuat profil dan mengisi form", async () => {
    renderWithProviders(<ProfilePage />);

    expect(screen.getByRole("heading", { name: "Profil Saya" })).toBeInTheDocument();
    expect(await screen.findByDisplayValue("Amanda")).toBeInTheDocument();
    expect(screen.getByDisplayValue("a@b.c")).toBeInTheDocument();
    expect(userApi.getProfile).toHaveBeenCalledTimes(1);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("menampilkan foto profil jika tersedia", async () => {
    userApi.getProfile.mockResolvedValue({ ...profile, photo: "http://foto/a.png" });
    renderWithProviders(<ProfilePage />);

    expect(await screen.findByAltText("Amanda")).toHaveAttribute(
      "src",
      "http://foto/a.png"
    );
  });

  describe("ubah profil", () => {
    it("menyimpan nama dan email baru", async () => {
      userApi.updateProfile.mockResolvedValue({ ...profile, name: "Amanda S" });
      renderWithProviders(<ProfilePage />);

      const nama = await screen.findByDisplayValue("Amanda");
      await userEvent.clear(nama);
      await userEvent.type(nama, "Amanda S");
      await userEvent.clear(screen.getByLabelText("Alamat email"));
      await userEvent.type(screen.getByLabelText("Alamat email"), "baru@b.c");
      await userEvent.click(screen.getByRole("button", { name: "Simpan" }));

      await waitFor(() =>
        expect(showSuccessDialog).toHaveBeenCalledWith("Profil diperbarui")
      );
      expect(userApi.updateProfile).toHaveBeenCalledWith({
        name: "Amanda S",
        email: "baru@b.c",
      });
    });

    it("menampilkan dialog error jika gagal", async () => {
      userApi.updateProfile.mockRejectedValue(new Error("Email sudah dipakai"));
      renderWithProviders(<ProfilePage />);

      await screen.findByDisplayValue("Amanda");
      await userEvent.click(screen.getByRole("button", { name: "Simpan" }));

      await waitFor(() =>
        expect(showErrorDialog).toHaveBeenCalledWith("Email sudah dipakai")
      );
      expect(showSuccessDialog).not.toHaveBeenCalled();
    });
  });

  describe("ubah foto", () => {
    it("mengunggah foto lalu memuat ulang profil", async () => {
      userApi.updatePhoto.mockResolvedValue("Berhasil");
      renderWithProviders(<ProfilePage />);
      await screen.findByDisplayValue("Amanda");

      await userEvent.upload(ambilInputFoto(), file);

      await waitFor(() =>
        expect(showSuccessDialog).toHaveBeenCalledWith("Foto diperbarui")
      );
      expect(userApi.updatePhoto).toHaveBeenCalledWith(file);
      expect(userApi.getProfile).toHaveBeenCalledTimes(2);
    });

    it("menampilkan dialog error jika unggahan gagal", async () => {
      userApi.updatePhoto.mockRejectedValue(new Error("File terlalu besar"));
      renderWithProviders(<ProfilePage />);
      await screen.findByDisplayValue("Amanda");

      await userEvent.upload(ambilInputFoto(), file);

      await waitFor(() =>
        expect(showErrorDialog).toHaveBeenCalledWith("File terlalu besar")
      );
    });

    it("mengabaikan pemilihan file yang dibatalkan", async () => {
      renderWithProviders(<ProfilePage />);
      await screen.findByDisplayValue("Amanda");

      fireEvent.change(ambilInputFoto(), { target: { files: [] } });
      fireEvent.change(ambilInputFoto(), { target: { files: undefined } });

      expect(userApi.updatePhoto).not.toHaveBeenCalled();
    });
  });

  describe("ubah kata sandi", () => {
    it("memperingatkan jika konfirmasi tidak sama", async () => {
      renderWithProviders(<ProfilePage />);
      await screen.findByDisplayValue("Amanda");

      await isiPassword("lama123", "baru123", "beda123");
      await userEvent.click(screen.getByRole("button", { name: "Ubah Kata Sandi" }));

      await waitFor(() =>
        expect(showWarningDialog).toHaveBeenCalledWith(
          "Konfirmasi kata sandi baru tidak sama"
        )
      );
      expect(userApi.updatePassword).not.toHaveBeenCalled();
    });

    it("mengubah kata sandi lalu mengosongkan isian", async () => {
      userApi.updatePassword.mockResolvedValue("Berhasil mengubah kata sandi");
      renderWithProviders(<ProfilePage />);
      await screen.findByDisplayValue("Amanda");

      await isiPassword("lama123", "baru123", "baru123");
      await userEvent.click(screen.getByRole("button", { name: "Ubah Kata Sandi" }));

      await waitFor(() =>
        expect(showSuccessDialog).toHaveBeenCalledWith("Kata sandi diubah")
      );
      expect(userApi.updatePassword).toHaveBeenCalledWith({
        password: "lama123",
        newPassword: "baru123",
        newPasswordConfirmation: "baru123",
      });
      expect(screen.getByLabelText("Kata sandi lama")).toHaveValue("");
      expect(screen.getByLabelText("Kata sandi baru")).toHaveValue("");
      expect(screen.getByLabelText("Konfirmasi kata sandi baru")).toHaveValue("");
    });

    it("menampilkan dialog error dan menyimpan isian jika gagal", async () => {
      userApi.updatePassword.mockRejectedValue(new Error("Kata sandi lama salah"));
      renderWithProviders(<ProfilePage />);
      await screen.findByDisplayValue("Amanda");

      await isiPassword("salah", "baru123", "baru123");
      await userEvent.click(screen.getByRole("button", { name: "Ubah Kata Sandi" }));

      await waitFor(() =>
        expect(showErrorDialog).toHaveBeenCalledWith("Kata sandi lama salah")
      );
      expect(screen.getByLabelText("Kata sandi lama")).toHaveValue("salah");
    });
  });
});
