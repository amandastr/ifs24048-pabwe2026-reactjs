import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import Swal from "sweetalert2";
import DetailPage from "./DetailPage";
import { renderWithProviders } from "../../../test-utils";
import lostFoundApi from "../api/lostFoundApi";

vi.mock("../api/lostFoundApi", () => ({
  default: {
    getAll: vi.fn(),
    getById: vi.fn(),
    add: vi.fn(),
    change: vi.fn(),
    changeCover: vi.fn(),
    remove: vi.fn(),
    getStats: vi.fn(),
  },
}));

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn() },
}));

const item = {
  id: 5,
  title: "Dompet hitam",
  description: "Hilang di kantin\nlantai dua",
  status: "lost",
  is_completed: 0,
  created_at: "2024-02-28T07:49:32Z",
  updated_at: "2024-03-01T07:49:32Z",
  cover: "http://foto/dompet.jpg",
  user: { name: "Amanda", photo: "http://foto/amanda.png" },
};

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/lost-founds/:id" element={<DetailPage />} />
      <Route path="/" element={<p>halaman daftar</p>} />
    </Routes>,
    { route: "/lost-founds/5" }
  );

const muatDetail = async (data = item) => {
  lostFoundApi.getById.mockResolvedValue(data);
  const hasil = renderPage();
  await screen.findByRole("heading", { level: 1, name: data.title });
  return hasil;
};

describe("DetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    globalThis.URL.createObjectURL = vi.fn(() => "blob:pratinjau");
  });

  describe("pemuatan data", () => {
    it("memuat laporan berdasarkan id pada alamat", async () => {
      await muatDetail();

      expect(lostFoundApi.getById).toHaveBeenCalledWith("5");
    });

    it("menampilkan teks memuat selama data diambil", async () => {
      let selesai;
      lostFoundApi.getById.mockReturnValue(
        new Promise((resolve) => {
          selesai = resolve;
        })
      );
      renderPage();

      expect(await screen.findByText("Memuat...")).toBeInTheDocument();

      selesai(item);
      expect(
        await screen.findByRole("heading", { level: 1, name: "Dompet hitam" })
      ).toBeInTheDocument();
    });

    it("menampilkan pesan error jika gagal memuat", async () => {
      lostFoundApi.getById.mockRejectedValue(new Error("Laporan tidak ditemukan di server"));
      renderPage();

      expect(
        await screen.findByText("Laporan tidak ditemukan di server")
      ).toBeInTheDocument();
    });

    it("menampilkan pesan bawaan jika data kosong", async () => {
      lostFoundApi.getById.mockResolvedValue(null);
      renderPage();

      expect(await screen.findByText("Laporan tidak ditemukan")).toBeInTheDocument();
    });

    it("menolak laporan yang id-nya tidak sesuai dengan alamat", async () => {
      lostFoundApi.getById.mockResolvedValue({ ...item, id: 99 });
      renderPage();

      expect(await screen.findByText("Laporan tidak ditemukan")).toBeInTheDocument();
      expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    });
  });

  describe("isi detail", () => {
    it("menampilkan judul, deskripsi, tanggal, dan pelapor", async () => {
      await muatDetail();

      expect(screen.getByText(/Hilang di kantin/)).toBeInTheDocument();
      expect(screen.getByText("#5")).toBeInTheDocument();
      expect(screen.getByText("Barang Hilang")).toBeInTheDocument();
      expect(screen.getByText("Belum Selesai")).toBeInTheDocument();
      expect(screen.getByText("Amanda")).toBeInTheDocument();
      expect(screen.getByAltText("Amanda")).toHaveAttribute(
        "src",
        "http://foto/amanda.png"
      );
      expect(screen.getAllByText(/2024/).length).toBeGreaterThanOrEqual(2);
      expect(screen.getByAltText("Dompet hitam")).toHaveAttribute(
        "src",
        "http://foto/dompet.jpg"
      );
    });

    it("menampilkan jenis 'ditemukan' dan status 'selesai'", async () => {
      await muatDetail({ ...item, status: "found", is_completed: 1 });

      expect(screen.getByText("Barang Ditemukan")).toBeInTheDocument();
      expect(screen.getByText("Selesai")).toBeInTheDocument();
    });

    it("tanpa cover dan pelapor tanpa foto menampilkan inisial", async () => {
      await muatDetail({
        ...item,
        cover: null,
        user: { name: "budi", photo: null },
      });

      expect(screen.queryByAltText("Dompet hitam")).not.toBeInTheDocument();
      expect(screen.getByText("B")).toBeInTheDocument();
    });

    it("memakai data author jika user tidak ada", async () => {
      await muatDetail({ ...item, user: undefined, author: { name: "Citra" } });

      expect(screen.getByText("Citra")).toBeInTheDocument();
    });

    it("menampilkan tanda strip jika pelapor tidak diketahui", async () => {
      await muatDetail({ ...item, user: undefined });

      expect(screen.getByText("-")).toBeInTheDocument();
      expect(screen.getByText("?")).toBeInTheDocument();
    });

    it("pelapor tanpa nama menampilkan tanda tanya dan strip", async () => {
      await muatDetail({ ...item, user: { photo: null } });

      expect(screen.getByText("?")).toBeInTheDocument();
    });

    it("memiliki tautan kembali ke daftar laporan", async () => {
      await muatDetail();

      expect(
        screen.getByRole("link", { name: /Kembali ke Daftar Laporan/ })
      ).toHaveAttribute("href", "/");
    });
  });

  describe("modal", () => {
    it("membuka dan menutup modal ubah cover", async () => {
      await muatDetail();

      await userEvent.click(screen.getByRole("button", { name: /Ubah Cover/ }));
      expect(screen.getByRole("heading", { name: "Ganti Cover" })).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Tutup" }));
      expect(
        screen.queryByRole("heading", { name: "Ganti Cover" })
      ).not.toBeInTheDocument();
    });

    it("membuka dan menutup modal ubah data", async () => {
      await muatDetail();

      await userEvent.click(screen.getByRole("button", { name: /Ubah Data/ }));
      expect(screen.getByRole("heading", { name: "Ubah Laporan" })).toBeInTheDocument();
      expect(screen.getByDisplayValue("Dompet hitam")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Tutup" }));
      expect(
        screen.queryByRole("heading", { name: "Ubah Laporan" })
      ).not.toBeInTheDocument();
    });
  });

  describe("hapus laporan", () => {
    it("menghapus setelah dikonfirmasi lalu kembali ke daftar", async () => {
      lostFoundApi.remove.mockResolvedValue(null);
      await muatDetail();

      await userEvent.click(screen.getByRole("button", { name: /Hapus/ }));

      expect(await screen.findByText("halaman daftar")).toBeInTheDocument();
      expect(lostFoundApi.remove).toHaveBeenCalledWith("5");
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "success", title: "Laporan dihapus" })
      );
    });

    it("tidak menghapus jika dibatalkan", async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: false });
      await muatDetail();

      await userEvent.click(screen.getByRole("button", { name: /Hapus/ }));

      await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
      expect(lostFoundApi.remove).not.toHaveBeenCalled();
      expect(screen.queryByText("halaman daftar")).not.toBeInTheDocument();
    });

    it("menampilkan dialog error jika penghapusan gagal", async () => {
      lostFoundApi.remove.mockRejectedValue(new Error("Tidak berhak menghapus"));
      await muatDetail();

      await userEvent.click(screen.getByRole("button", { name: /Hapus/ }));

      await waitFor(() =>
        expect(Swal.fire).toHaveBeenCalledWith(
          expect.objectContaining({ icon: "error", text: "Tidak berhak menghapus" })
        )
      );
      expect(screen.queryByText("halaman daftar")).not.toBeInTheDocument();
    });
  });
});
