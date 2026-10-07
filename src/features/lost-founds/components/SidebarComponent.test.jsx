import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SidebarComponent from "./SidebarComponent";
import { renderWithProviders } from "../../../test-utils";

const lapisan = (container) => container.querySelector('[class*="bg-black/40"]');

describe("SidebarComponent", () => {
  it("menampilkan seluruh menu navigasi", () => {
    renderWithProviders(<SidebarComponent open={false} onClose={() => {}} />);

    expect(screen.getByRole("link", { name: /Dashboard \/ Laporan/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /Statistik/ })).toHaveAttribute("href", "/stats");
    expect(screen.getByRole("link", { name: /Pengguna/ })).toHaveAttribute("href", "/users");
    expect(screen.getByRole("link", { name: /Profil Saya/ })).toHaveAttribute("href", "/profile");
    expect(screen.getByText("Praktikum PABWE 2026")).toBeInTheDocument();
  });

  it("tertutup: tanpa lapisan gelap dan panel bergeser keluar", () => {
    const { container } = renderWithProviders(
      <SidebarComponent open={false} onClose={() => {}} />
    );

    expect(lapisan(container)).toBeNull();
    expect(container.querySelector("aside")).toHaveClass("-translate-x-full");
  });

  it("terbuka: lapisan gelap tampil dan menutup panel saat diklik", async () => {
    const onClose = vi.fn();
    const { container } = renderWithProviders(
      <SidebarComponent open onClose={onClose} />
    );

    expect(container.querySelector("aside")).toHaveClass("translate-x-0");

    await userEvent.click(lapisan(container));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menutup panel saat sebuah menu dipilih", async () => {
    const onClose = vi.fn();
    renderWithProviders(<SidebarComponent open onClose={onClose} />);

    await userEvent.click(screen.getByRole("link", { name: /Pengguna/ }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menandai menu aktif sesuai alamat", () => {
    renderWithProviders(<SidebarComponent open={false} onClose={() => {}} />, {
      route: "/stats",
    });

    expect(screen.getByRole("link", { name: /Statistik/ })).toHaveClass("bg-indigo-600");
    expect(screen.getByRole("link", { name: /Dashboard \/ Laporan/ })).not.toHaveClass(
      "bg-indigo-600"
    );
  });

  it("menu Dashboard aktif hanya di alamat beranda", () => {
    renderWithProviders(<SidebarComponent open={false} onClose={() => {}} />, {
      route: "/",
    });

    expect(screen.getByRole("link", { name: /Dashboard \/ Laporan/ })).toHaveClass(
      "bg-indigo-600"
    );
    expect(screen.getByRole("link", { name: /Statistik/ })).not.toHaveClass(
      "bg-indigo-600"
    );
  });
});
