import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import LostFoundLayout from "./LostFoundLayout";
import { renderWithProviders } from "../../../test-utils";
import { getInitialState } from "../../auth/states/reducer";
import userApi from "../../users/api/userApi";

vi.mock("../../users/api/userApi", () => ({
  default: {
    getProfile: vi.fn(),
    getUsers: vi.fn(),
    getUserById: vi.fn(),
    updateProfile: vi.fn(),
    updatePhoto: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

const renderLayout = (isAuthLogin) =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<LostFoundLayout />}>
        <Route index element={<p>isi halaman</p>} />
      </Route>
      <Route path="/auth/login" element={<p>halaman login</p>} />
    </Routes>,
    {
      route: "/",
      preloadedState: { auth: { ...getInitialState(), isAuthLogin } },
    }
  );

describe("LostFoundLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userApi.getProfile.mockResolvedValue({
      id: 1,
      name: "Amanda",
      email: "a@b.c",
    });
  });

  it("mengalihkan pengguna yang belum login ke halaman login", () => {
    renderLayout(false);

    expect(screen.getByText("halaman login")).toBeInTheDocument();
    expect(screen.queryByText("isi halaman")).not.toBeInTheDocument();
    expect(userApi.getProfile).not.toHaveBeenCalled();
  });

  it("memuat profil dan menampilkan navbar, sidebar, serta isi halaman", async () => {
    renderLayout(true);

    expect(screen.getByText("isi halaman")).toBeInTheDocument();
    expect(await screen.findByText("Amanda")).toBeInTheDocument();
    expect(userApi.getProfile).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("hanya memiliki satu landmark main (aksesibilitas)", async () => {
    renderLayout(true);

    await waitFor(() => expect(userApi.getProfile).toHaveBeenCalled());
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("membuka dan menutup sidebar di layar kecil", async () => {
    const { container } = renderLayout(true);
    const aside = container.querySelector("aside");

    expect(aside).toHaveClass("-translate-x-full");

    await userEvent.click(screen.getByRole("button", { name: "Buka menu" }));
    expect(aside).toHaveClass("translate-x-0");

    await userEvent.click(container.querySelector('[class*="bg-black/40"]'));
    expect(aside).toHaveClass("-translate-x-full");
  });
});
