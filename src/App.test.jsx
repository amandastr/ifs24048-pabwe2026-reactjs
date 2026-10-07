import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import App from "./App";
import { renderWithProviders } from "./test-utils";
import { getInitialState } from "./features/auth/states/reducer";
import userApi from "./features/users/api/userApi";

vi.mock("./features/users/api/userApi", () => ({
  default: {
    getProfile: vi.fn(),
    getUsers: vi.fn(),
    getUserById: vi.fn(),
    updateProfile: vi.fn(),
    updatePhoto: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

vi.mock("./features/auth/pages/LoginPage", () => ({
  default: () => <p>halaman login</p>,
}));
vi.mock("./features/auth/pages/RegisterPage", () => ({
  default: () => <p>halaman register</p>,
}));
vi.mock("./features/lost-founds/pages/HomePage", () => ({
  default: () => <p>halaman beranda</p>,
}));
vi.mock("./features/lost-founds/pages/DetailPage", () => ({
  default: () => <p>halaman detail</p>,
}));
vi.mock("./features/lost-founds/pages/StatsPage", () => ({
  default: () => <p>halaman statistik</p>,
}));
vi.mock("./features/users/pages/UsersPage", () => ({
  default: () => <p>halaman pengguna</p>,
}));
vi.mock("./features/users/pages/ProfilePage", () => ({
  default: () => <p>halaman profil</p>,
}));

const renderApp = (route, isAuthLogin) =>
  renderWithProviders(<App />, {
    route,
    preloadedState: { auth: { ...getInitialState(), isAuthLogin } },
  });

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userApi.getProfile.mockResolvedValue({ id: 1, name: "Amanda", email: "a@b.c" });
  });

  it("menampilkan halaman login di dalam AuthLayout", async () => {
    renderApp("/auth/login", false);

    expect(await screen.findByText("halaman login")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Delcom Lost & Founds" })
    ).toBeInTheDocument();
  });

  it("menampilkan halaman register di dalam AuthLayout", async () => {
    renderApp("/auth/register", false);

    expect(await screen.findByText("halaman register")).toBeInTheDocument();
  });

  it("mengalihkan pengguna yang belum login dari dashboard ke login", async () => {
    renderApp("/", false);

    expect(await screen.findByText("halaman login")).toBeInTheDocument();
    expect(userApi.getProfile).not.toHaveBeenCalled();
  });

  it("mengalihkan pengguna yang sudah login dari halaman login ke beranda", async () => {
    renderApp("/auth/login", true);

    expect(await screen.findByText("halaman beranda")).toBeInTheDocument();
  });

  it.each([
    ["/", "halaman beranda"],
    ["/lost-founds/5", "halaman detail"],
    ["/stats", "halaman statistik"],
    ["/users", "halaman pengguna"],
    ["/profile", "halaman profil"],
  ])("rute dashboard %s menampilkan %s untuk pengguna yang login", async (route, teks) => {
    renderApp(route, true);

    expect(await screen.findByText(teks)).toBeInTheDocument();
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });
});
