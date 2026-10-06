import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";
import StatsPage from "./StatsPage";
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

const kartu = (judul) => screen.getByRole("heading", { name: judul }).parentElement;

describe("StatsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("memuat laporan dan menampilkan judul halaman", async () => {
    lostFoundApi.getAll.mockResolvedValue([]);
    renderWithProviders(<StatsPage />);

    expect(screen.getByRole("heading", { name: "Statistik" })).toBeInTheDocument();
    expect(await screen.findAllByText("Belum ada data.")).toHaveLength(2);
    expect(lostFoundApi.getAll).toHaveBeenCalledWith({});
  });

  it("menghitung laporan per hari dan per bulan, terbaru lebih dulu", async () => {
    lostFoundApi.getAll.mockResolvedValue([
      { id: 1, created_at: "2024-09-15T12:00:00Z" },
      { id: 2, created_at: "2024-09-15T18:00:00Z" },
      { id: 3, created_at: "2024-08-10T12:00:00Z" },
      { id: 4, created_at: null },
    ]);
    renderWithProviders(<StatsPage />);

    const harian = kartu("7 Hari Terakhir");
    expect(await within(harian).findByText("2024-09-15")).toBeInTheDocument();
    expect(within(harian).getByText("2024-08-10")).toBeInTheDocument();

    const bulanan = kartu("6 Bulan Terakhir");
    expect(within(bulanan).getByText("2024-09")).toBeInTheDocument();
    expect(within(bulanan).getByText("2024-08")).toBeInTheDocument();

    const barisSeptember = within(harian).getByText("2024-09-15").parentElement;
    expect(within(barisSeptember).getByText("2")).toBeInTheDocument();
    expect(barisSeptember.querySelector("[style]")).toHaveStyle({ width: "100%" });

    const barisAgustus = within(harian).getByText("2024-08-10").parentElement;
    expect(barisAgustus.querySelector("[style]")).toHaveStyle({ width: "50%" });
  });

  it("membatasi 7 hari dan 6 bulan terbaru", async () => {
    lostFoundApi.getAll.mockResolvedValue(
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map((bulan) => ({
        id: bulan,
        created_at: `2024-0${bulan}-15T12:00:00Z`,
      }))
    );
    renderWithProviders(<StatsPage />);

    const harian = kartu("7 Hari Terakhir");
    expect(await within(harian).findByText("2024-09-15")).toBeInTheDocument();
    expect(within(harian).getByText("2024-03-15")).toBeInTheDocument();
    expect(within(harian).queryByText("2024-02-15")).not.toBeInTheDocument();

    const bulanan = kartu("6 Bulan Terakhir");
    expect(within(bulanan).getByText("2024-04")).toBeInTheDocument();
    expect(within(bulanan).queryByText("2024-03")).not.toBeInTheDocument();
  });
});
