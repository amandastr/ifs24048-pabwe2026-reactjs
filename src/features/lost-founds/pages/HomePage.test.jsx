import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Swal from "sweetalert2";
import HomePage from "./HomePage";
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

const items = [
  {
    id: 1,
    title: "Dompet hitam",
    description: "Hilang di kantin",
    status: "lost",
    is_completed: 0,
    created_at: "2024-02-28T07:49:32Z",
    cover: "http://foto/dompet.jpg",
  },
  {
    id: 2,
    title: "Kunci motor",
    description: "Ditemukan di parkiran",
    status: "found",
    is_completed: 1,
    created_at: "2024-03-01T07:49:32Z",
    cover: null,
  },
  {
    id: 3,
    title: "Payung biru",
    description: "Tertinggal di aula",
    status: "lost",
    is_completed: "1",
    created_at: "2024-03-02T07:49:32Z",
    cover: null,
  },
];

const angkaKartu = (label) =>
  screen.getByText(label, { selector: "p" }).nextElementSibling;
const baris = () => within(screen.getByRole("table")).getAllByRole("row").slice(1);

const muatHalaman = async () => {
  const hasil = renderWithProviders(<HomePage />);
  await screen.findByText("Dompet hitam");
  return hasil;
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    lostFoundApi.getAll.mockResolvedValue(items);
  });

  it("memuat daftar laporan saat dibuka", async () => {
    await muatHalaman();

    expect(lostFoundApi.getAll).toHaveBeenCalledWith({});
    expect(
      screen.getByRole("heading", { name: "Laporan Lost & Founds" })
    ).toBeInTheDocument();
    expect(baris()).toHaveLength(3);
  });

  it("menampilkan statistik total, hilang, ditemukan, dan selesai", async () => {
    await muatHalaman();

    expect(angkaKartu("Total Laporan")).toHaveTextContent("3");
    expect(angkaKartu("Barang Hilang")).toHaveTextContent("2");
    expect(angkaKartu("Barang Ditemukan")).toHaveTextContent("1");
    expect(angkaKartu("Selesai")).toHaveTextContent("2");
  });

  it("menampilkan jenis, status, gambar kecil, dan tautan detail di tabel", async () => {
    await muatHalaman();
    const [pertama, kedua] = baris();

    expect(within(pertama).getByText("Hilang")).toBeInTheDocument();
    expect(within(pertama).getByText("Proses")).toBeInTheDocument();
    expect(within(pertama).getByAltText("Dompet hitam")).toHaveAttribute(
      "src",
      "http://foto/dompet.jpg"
    );
    expect(within(pertama).getByRole("link", { name: "Lihat" })).toHaveAttribute(
      "href",
      "/lost-founds/1"
    );
    expect(within(kedua).getByText("Ditemukan")).toBeInTheDocument();
    expect(within(kedua).getByText("Selesai")).toBeInTheDocument();
    expect(within(kedua).queryByRole("img")).not.toBeInTheDocument();
  });

  it("menampilkan teks memuat selama data diambil", async () => {
    let selesai;
    lostFoundApi.getAll.mockReturnValue(
      new Promise((resolve) => {
        selesai = resolve;
      })
    );
    renderWithProviders(<HomePage />);

    expect(await screen.findByText("Memuat...")).toBeInTheDocument();
    expect(screen.queryByText("Belum ada laporan.")).not.toBeInTheDocument();

    selesai(items);
    expect(await screen.findByText("Dompet hitam")).toBeInTheDocument();
    expect(screen.queryByText("Memuat...")).not.toBeInTheDocument();
  });

  it("menampilkan keadaan kosong jika belum ada laporan", async () => {
    lostFoundApi.getAll.mockResolvedValue([]);
    renderWithProviders(<HomePage />);

    expect(await screen.findByText("Belum ada laporan.")).toBeInTheDocument();
  });

  it("menampilkan pesan error jika gagal memuat", async () => {
    lostFoundApi.getAll.mockRejectedValue(new Error("Token tidak valid"));
    renderWithProviders(<HomePage />);

    expect(await screen.findByText("Token tidak valid")).toBeInTheDocument();
  });

  describe("pencarian dan filter", () => {
    it("mencari berdasarkan judul atau deskripsi (live search)", async () => {
      await muatHalaman();
      const kolomCari = screen.getByPlaceholderText(
        "Cari judul atau deskripsi laporan..."
      );

      await userEvent.type(kolomCari, "PARKIRAN");
      expect(baris()).toHaveLength(1);
      expect(screen.getByText("Kunci motor")).toBeInTheDocument();

      await userEvent.clear(kolomCari);
      await userEvent.type(kolomCari, "payung");
      expect(baris()).toHaveLength(1);
      expect(screen.getByText("Payung biru")).toBeInTheDocument();
    });

    it("menampilkan keadaan kosong jika pencarian tidak cocok", async () => {
      await muatHalaman();

      await userEvent.type(
        screen.getByPlaceholderText("Cari judul atau deskripsi laporan..."),
        "tidak-ada"
      );

      expect(screen.getByText("Belum ada laporan.")).toBeInTheDocument();
      expect(screen.queryByRole("row", { name: /Dompet/ })).not.toBeInTheDocument();
    });

    it("memfilter berdasarkan jenis laporan", async () => {
      await muatHalaman();

      await userEvent.click(screen.getByRole("button", { name: "Hilang" }));
      expect(baris()).toHaveLength(2);
      expect(screen.queryByText("Kunci motor")).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Ditemukan" }));
      expect(baris()).toHaveLength(1);
      expect(screen.getByText("Kunci motor")).toBeInTheDocument();

      await userEvent.click(screen.getAllByRole("button", { name: "Semua" })[0]);
      expect(baris()).toHaveLength(3);
    });

    it("memfilter berdasarkan status penyelesaian", async () => {
      await muatHalaman();

      await userEvent.click(screen.getByRole("button", { name: "Selesai" }));
      expect(baris()).toHaveLength(2);
      expect(screen.queryByText("Dompet hitam")).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Proses" }));
      expect(baris()).toHaveLength(1);
      expect(screen.getByText("Dompet hitam")).toBeInTheDocument();

      await userEvent.click(screen.getAllByRole("button", { name: "Semua" })[1]);
      expect(baris()).toHaveLength(3);
    });
  });

  describe("tampilan kartu", () => {
    it("berpindah antara tampilan tabel dan kartu", async () => {
      await muatHalaman();

      await userEvent.click(screen.getByRole("button", { name: "Kartu" }));
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.getByAltText("Dompet hitam")).toHaveClass("h-40");
      expect(screen.getAllByText("Tanpa foto")).toHaveLength(2);
      expect(screen.getByText("Payung biru")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Tabel" }));
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });

  describe("tambah dan ubah laporan", () => {
    it("membuka dan menutup modal tambah laporan", async () => {
      await muatHalaman();

      await userEvent.click(screen.getByRole("button", { name: /Tambah Laporan/ }));
      expect(screen.getByRole("heading", { name: "Tambah Laporan" })).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Tutup" }));
      expect(
        screen.queryByRole("heading", { name: "Tambah Laporan" })
      ).not.toBeInTheDocument();
    });

    it("membuka dan menutup modal ubah laporan dengan data baris terpilih", async () => {
      await muatHalaman();

      await userEvent.click(within(baris()[1]).getByRole("button", { name: "Ubah" }));
      expect(screen.getByRole("heading", { name: "Ubah Laporan" })).toBeInTheDocument();
      expect(screen.getByDisplayValue("Kunci motor")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Tutup" }));
      expect(
        screen.queryByRole("heading", { name: "Ubah Laporan" })
      ).not.toBeInTheDocument();
    });
  });

  describe("hapus laporan", () => {
    it("menghapus laporan setelah dikonfirmasi lalu memuat ulang daftar", async () => {
      lostFoundApi.remove.mockResolvedValue(null);
      await muatHalaman();

      await userEvent.click(within(baris()[0]).getByRole("button", { name: "Hapus" }));

      await waitFor(() => expect(lostFoundApi.remove).toHaveBeenCalledWith(1));
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Hapus laporan ini?", text: "Dompet hitam" })
      );
      await waitFor(() => expect(lostFoundApi.getAll).toHaveBeenCalledTimes(2));
    });

    it("tidak menghapus jika dibatalkan", async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: false });
      await muatHalaman();

      await userEvent.click(within(baris()[0]).getByRole("button", { name: "Hapus" }));

      await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
      expect(lostFoundApi.remove).not.toHaveBeenCalled();
    });

    it("menampilkan dialog error jika penghapusan gagal", async () => {
      lostFoundApi.remove.mockRejectedValue(new Error("Tidak berhak menghapus"));
      await muatHalaman();

      await userEvent.click(within(baris()[0]).getByRole("button", { name: "Hapus" }));

      await waitFor(() =>
        expect(Swal.fire).toHaveBeenCalledWith(
          expect.objectContaining({ icon: "error", text: "Tidak berhak menghapus" })
        )
      );
      expect(lostFoundApi.getAll).toHaveBeenCalledTimes(1);
    });
  });
});
