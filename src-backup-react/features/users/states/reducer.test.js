import { describe, it, expect } from "vitest";
import reducer, { initialState } from "./reducer";
import {
  asyncGetUsers,
  asyncGetUserById,
  asyncGetProfile,
  asyncChangeProfile,
  asyncChangeProfilePhoto,
  asyncChangeProfilePassword,
  resetUsersStatus,
} from "./action";
import { asyncAuthLogout } from "../../auth/states/action";

const user = { id: 1, name: "Amanda", email: "a@b.c" };
const loading = { ...initialState, isLoading: true };

describe("users reducer", () => {
  it("mengembalikan state awal", () => {
    expect(reducer(undefined, { type: "tidak-dikenal" })).toEqual(initialState);
  });

  it("asyncGetUsers.fulfilled menyimpan daftar pengguna", () => {
    const state = reducer(loading, asyncGetUsers.fulfilled([user], "id"));

    expect(state.users).toEqual([user]);
    expect(state.isLoading).toBe(false);
  });

  it("asyncGetUserById.fulfilled menyimpan satu pengguna", () => {
    const state = reducer(loading, asyncGetUserById.fulfilled(user, "id", 1));

    expect(state.user).toEqual(user);
    expect(state.isLoading).toBe(false);
  });

  it("asyncGetProfile.fulfilled menyimpan profil dan menandai isProfile", () => {
    const state = reducer(loading, asyncGetProfile.fulfilled(user, "id"));

    expect(state.profile).toEqual(user);
    expect(state.isProfile).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it("asyncChangeProfile.fulfilled memperbarui profil dan menandai isChangeProfile", () => {
    const updated = { ...user, name: "Amanda S" };
    const state = reducer(
      { ...loading, profile: user },
      asyncChangeProfile.fulfilled(updated, "id", { name: "Amanda S", email: "a@b.c" })
    );

    expect(state.profile).toEqual(updated);
    expect(state.isChangeProfile).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it("asyncChangeProfilePhoto.fulfilled menandai isChangeProfilePhoto", () => {
    const state = reducer(
      loading,
      asyncChangeProfilePhoto.fulfilled("Berhasil", "id", new File(["x"], "f.png"))
    );

    expect(state.isChangeProfilePhoto).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it("asyncChangeProfilePassword.fulfilled menandai isChangeProfilePassword", () => {
    const state = reducer(
      loading,
      asyncChangeProfilePassword.fulfilled("Berhasil", "id", {})
    );

    expect(state.isChangeProfilePassword).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it.each([
    ["asyncGetUsers", asyncGetUsers, undefined],
    ["asyncGetUserById", asyncGetUserById, 1],
    ["asyncGetProfile", asyncGetProfile, undefined],
    ["asyncChangeProfile", asyncChangeProfile, {}],
    ["asyncChangeProfilePhoto", asyncChangeProfilePhoto, null],
    ["asyncChangeProfilePassword", asyncChangeProfilePassword, {}],
  ])("%s: pending mengaktifkan loading, rejected menyimpan pesan error", (_n, thunk, arg) => {
    const pendingState = reducer(
      { ...initialState, error: "lama" },
      thunk.pending("id", arg)
    );
    expect(pendingState.isLoading).toBe(true);
    expect(pendingState.error).toBeNull();

    const rejectedState = reducer(
      pendingState,
      thunk.rejected(null, "id", arg, "Pesan dari API")
    );
    expect(rejectedState.isLoading).toBe(false);
    expect(rejectedState.error).toBe("Pesan dari API");
  });

  it("rejected memakai pesan dari error jika payload tidak ada", () => {
    const state = reducer(
      loading,
      asyncGetUsers.rejected(new Error("Gagal tak terduga"), "id")
    );

    expect(state.error).toBe("Gagal tak terduga");
  });

  it("resetUsersStatus mereset status perubahan dan error, data tetap", () => {
    const prev = {
      ...initialState,
      profile: user,
      isProfile: true,
      isChangeProfile: true,
      isChangeProfilePhoto: true,
      isChangeProfilePassword: true,
      error: "sesuatu",
    };

    const state = reducer(prev, resetUsersStatus());

    expect(state.isChangeProfile).toBe(false);
    expect(state.isChangeProfilePhoto).toBe(false);
    expect(state.isChangeProfilePassword).toBe(false);
    expect(state.error).toBeNull();
    expect(state.profile).toEqual(user);
    expect(state.isProfile).toBe(true);
  });

  it("logout mengosongkan seluruh data pengguna", () => {
    const prev = {
      ...initialState,
      users: [user],
      user,
      profile: user,
      isProfile: true,
    };

    const state = reducer(prev, asyncAuthLogout.fulfilled(undefined, "id"));

    expect(state).toEqual(initialState);
  });
});