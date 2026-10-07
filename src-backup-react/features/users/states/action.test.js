import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  asyncGetUsers,
  asyncGetUserById,
  asyncGetProfile,
  asyncChangeProfile,
  asyncChangeProfilePhoto,
  asyncChangeProfilePassword,
  resetUsersStatus,
} from "./action";
import userApi from "../api/userApi";

vi.mock("../api/userApi", () => ({
  default: {
    getUsers: vi.fn(),
    getUserById: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    updatePhoto: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

const run = (thunk) => thunk(vi.fn(), vi.fn(), undefined);

const file = new File(["x"], "foto.png", { type: "image/png" });
const profileData = { name: "Amanda", email: "a@b.c" };
const passwordData = {
  password: "123456",
  newPassword: "654321",
  newPasswordConfirmation: "654321",
};

// [nama, thunk, method userApi, argumen thunk, argumen yang diteruskan ke userApi]
const cases = [
  ["asyncGetUsers", asyncGetUsers, "getUsers", undefined, []],
  ["asyncGetUserById", asyncGetUserById, "getUserById", 7, [7]],
  ["asyncGetProfile", asyncGetProfile, "getProfile", undefined, []],
  ["asyncChangeProfile", asyncChangeProfile, "updateProfile", profileData, [profileData]],
  ["asyncChangeProfilePhoto", asyncChangeProfilePhoto, "updatePhoto", file, [file]],
  ["asyncChangeProfilePassword", asyncChangeProfilePassword, "updatePassword", passwordData, [passwordData]],
];

describe("users action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resetUsersStatus menghasilkan action bertipe users/resetStatus", () => {
    expect(resetUsersStatus()).toEqual({ type: "users/resetStatus" });
  });

  describe.each(cases)("%s", (_name, thunk, method, arg, expectedArgs) => {
    it("memanggil userApi dan mengembalikan hasilnya saat berhasil", async () => {
      userApi[method].mockResolvedValue("hasil-api");

      const result = await run(thunk(arg));

      expect(userApi[method]).toHaveBeenCalledWith(...expectedArgs);
      expect(thunk.fulfilled.match(result)).toBe(true);
      expect(result.payload).toBe("hasil-api");
    });

    it("menolak dengan pesan error saat gagal", async () => {
      userApi[method].mockRejectedValue(new Error("Gagal dari API"));

      const result = await run(thunk(arg));

      expect(thunk.rejected.match(result)).toBe(true);
      expect(result.payload).toBe("Gagal dari API");
    });
  });
});