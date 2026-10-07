import { describe, it, expect, vi, beforeEach } from "vitest";
import userApi from "./userApi";
import { apiRequest } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({
  apiRequest: vi.fn(),
}));

const user = { id: 1, name: "Amanda", email: "a@b.c" };

describe("userApi", () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it("getUsers memanggil GET /users dan mengembalikan daftar pengguna", async () => {
    apiRequest.mockResolvedValue({ data: { users: [user] } });

    const result = await userApi.getUsers();

    expect(apiRequest).toHaveBeenCalledWith("/users");
    expect(result).toEqual([user]);
  });

  it("getUserById memanggil GET /users/:id", async () => {
    apiRequest.mockResolvedValue({ data: { user } });

    const result = await userApi.getUserById(7);

    expect(apiRequest).toHaveBeenCalledWith("/users/7");
    expect(result).toEqual(user);
  });

  it("getProfile memanggil GET /users/me", async () => {
    apiRequest.mockResolvedValue({ data: { user } });

    const result = await userApi.getProfile();

    expect(apiRequest).toHaveBeenCalledWith("/users/me");
    expect(result).toEqual(user);
  });

  it("updateProfile memanggil PUT /users/me hanya dengan name dan email", async () => {
    apiRequest.mockResolvedValue({ data: { user } });

    const result = await userApi.updateProfile({
      name: "Amanda",
      email: "a@b.c",
      ekstra: "diabaikan",
    });

    expect(apiRequest).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: { name: "Amanda", email: "a@b.c" },
    });
    expect(result).toEqual(user);
  });

  it("updatePhoto mengirim FormData berisi field photo", async () => {
    apiRequest.mockResolvedValue({ message: "Berhasil mengubah foto" });
    const file = new File(["x"], "foto.png", { type: "image/png" });

    const result = await userApi.updatePhoto(file);

    const [path, options] = apiRequest.mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("photo").name).toBe("foto.png");
    expect(result).toBe("Berhasil mengubah foto");
  });

  it("updatePassword memetakan field ke format API", async () => {
    apiRequest.mockResolvedValue({ message: "Berhasil mengubah kata sandi" });

    const result = await userApi.updatePassword({
      password: "123456",
      newPassword: "654321",
      newPasswordConfirmation: "654321",
    });

    expect(apiRequest).toHaveBeenCalledWith("/users/password", {
      method: "PUT",
      body: {
        password: "123456",
        new_password: "654321",
        new_password_confirmation: "654321",
      },
    });
    expect(result).toBe("Berhasil mengubah kata sandi");
  });

  it("meneruskan error dari apiRequest", async () => {
    apiRequest.mockRejectedValue(new Error("Data tidak valid"));

    await expect(userApi.getUsers()).rejects.toThrow("Data tidak valid");
  });
});