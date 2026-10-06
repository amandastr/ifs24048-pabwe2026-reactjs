import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NavbarComponent from "./NavbarComponent";
import { renderWithProviders } from "../../../test-utils";
import { putAccessToken, getAccessToken } from "../../../helpers/apiHelper";

const profile = { name: "Amanda", email: "a@b.c", photo: "http://foto/a.png" };

describe("NavbarComponent", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("menampilkan judul aplikasi, nama, email, dan foto profil", () => {
    renderWithProviders(
      <NavbarComponent profile={profile} onToggleSidebar={() => {}} />
    );

    expect(screen.getByText("Delcom Lost & Founds")).toBeInTheDocument();
    expect(screen.getByText("Amanda")).toBeInTheDocument();
    expect(screen.getByText("a@b.c")).toBeInTheDocument();
    expect(screen.getByAltText("Amanda")).toHaveAttribute("src", "http://foto/a.png");
  });

  it("menampilkan inisial jika tidak ada foto", () => {
    renderWithProviders(
      <NavbarComponent
        profile={{ name: "budi", email: "b@b.c" }}
        onToggleSidebar={() => {}}
      />
    );

    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("menampilkan nilai cadangan jika profil belum dimuat", () => {
    renderWithProviders(
      <NavbarComponent profile={null} onToggleSidebar={() => {}} />
    );

    expect(screen.getByText("?")).toBeInTheDocument();
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
  });

  it("menampilkan tanda tanya jika profil tidak punya nama", () => {
    renderWithProviders(
      <NavbarComponent profile={{}} onToggleSidebar={() => {}} />
    );

    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("memanggil onToggleSidebar saat tombol menu diklik", async () => {
    const onToggleSidebar = vi.fn();
    renderWithProviders(
      <NavbarComponent profile={profile} onToggleSidebar={onToggleSidebar} />
    );

    await userEvent.click(screen.getByRole("button", { name: "Buka menu" }));

    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("membuka dan menutup menu profil", async () => {
    renderWithProviders(
      <NavbarComponent profile={profile} onToggleSidebar={() => {}} />
    );
    const tombolProfil = screen.getByRole("button", { name: /Amanda/ });

    expect(screen.queryByRole("link", { name: /Profil Saya/ })).not.toBeInTheDocument();

    await userEvent.click(tombolProfil);
    expect(screen.getByRole("link", { name: /Profil Saya/ })).toHaveAttribute(
      "href",
      "/profile"
    );

    await userEvent.click(tombolProfil);
    expect(screen.queryByRole("link", { name: /Profil Saya/ })).not.toBeInTheDocument();
  });

  it("menutup menu setelah memilih Profil Saya", async () => {
    renderWithProviders(
      <NavbarComponent profile={profile} onToggleSidebar={() => {}} />
    );

    await userEvent.click(screen.getByRole("button", { name: /Amanda/ }));
    await userEvent.click(screen.getByRole("link", { name: /Profil Saya/ }));

    expect(screen.queryByRole("link", { name: /Profil Saya/ })).not.toBeInTheDocument();
  });

  it("Keluar menghapus token dan menandai logout di store", async () => {
    putAccessToken("1|abc");
    const { store } = renderWithProviders(
      <NavbarComponent profile={profile} onToggleSidebar={() => {}} />
    );

    await userEvent.click(screen.getByRole("button", { name: /Amanda/ }));
    await userEvent.click(screen.getByRole("button", { name: /Keluar/ }));

    expect(getAccessToken()).toBeNull();
    expect(store.getState().auth.isAuthLogout).toBe(true);
    expect(store.getState().auth.isAuthLogin).toBe(false);
  });
});
