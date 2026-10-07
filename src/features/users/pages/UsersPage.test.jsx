import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsersPage from "./UsersPage";
import { renderWithProviders } from "../../../test-utils";
import userApi from "../api/userApi";

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

const users = [
  { id: 1, name: "Amanda Shinta", email: "amanda@del.ac.id", photo: "http://foto/a.png" },
  { id: 2, name: "budi", email: "budi@del.ac.id", photo: null },
  { id: 3, email: "tanpanama@del.ac.id", photo: null },
];

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userApi.getUsers.mockResolvedValue(users);
  });

  it("memuat dan menampilkan daftar pengguna", async () => {
    renderWithProviders(<UsersPage />);

    expect(screen.getByRole("heading", { name: "Daftar Pengguna" })).toBeInTheDocument();
    expect(await screen.findByText("Amanda Shinta")).toBeInTheDocument();
    expect(userApi.getUsers).toHaveBeenCalledTimes(1);
    expect(screen.getByText("budi@del.ac.id")).toBeInTheDocument();
    expect(screen.getByAltText("Amanda Shinta")).toHaveAttribute("src", "http://foto/a.png");
  });

  it("menampilkan inisial jika tidak ada foto", async () => {
    renderWithProviders(<UsersPage />);

    expect(await screen.findByText("B")).toBeInTheDocument();
    expect(screen.queryByAltText("budi")).not.toBeInTheDocument();
  });

  it("menampilkan teks memuat selama data diambil", async () => {
    let selesai;
    userApi.getUsers.mockReturnValue(
      new Promise((resolve) => {
        selesai = resolve;
      })
    );
    renderWithProviders(<UsersPage />);

    expect(await screen.findByText("Memuat...")).toBeInTheDocument();
    expect(screen.queryByText("Pengguna tidak ditemukan.")).not.toBeInTheDocument();

    selesai(users);
    expect(await screen.findByText("Amanda Shinta")).toBeInTheDocument();
    expect(screen.queryByText("Memuat...")).not.toBeInTheDocument();
  });

  it("mencari berdasarkan nama atau email tanpa membedakan huruf besar", async () => {
    renderWithProviders(<UsersPage />);
    await screen.findByText("Amanda Shinta");
    const kolomCari = screen.getByRole("textbox", { name: "Cari pengguna" });

    await userEvent.type(kolomCari, "SHINTA");
    expect(screen.getByText("Amanda Shinta")).toBeInTheDocument();
    expect(screen.queryByText("budi")).not.toBeInTheDocument();

    await userEvent.clear(kolomCari);
    await userEvent.type(kolomCari, "budi@del");
    expect(screen.getByText("budi")).toBeInTheDocument();
    expect(screen.queryByText("Amanda Shinta")).not.toBeInTheDocument();
  });

  it("menampilkan keadaan kosong jika pencarian tidak cocok", async () => {
    renderWithProviders(<UsersPage />);
    await screen.findByText("Amanda Shinta");

    await userEvent.type(screen.getByRole("textbox", { name: "Cari pengguna" }), "zzz");

    expect(screen.getByText("Pengguna tidak ditemukan.")).toBeInTheDocument();
  });

  it("menampilkan pesan error jika gagal memuat", async () => {
    userApi.getUsers.mockRejectedValue(new Error("Token tidak valid"));
    renderWithProviders(<UsersPage />);

    expect(await screen.findByText("Token tidak valid")).toBeInTheDocument();
    expect(screen.queryByText("Pengguna tidak ditemukan.")).not.toBeInTheDocument();
  });
});
