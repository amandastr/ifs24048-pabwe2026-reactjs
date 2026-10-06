import { describe, it, expect } from "vitest";
import store, { reducer } from "./store";
import { asyncAuthLogout } from "./features/auth/states/action";

describe("store", () => {
  it("menggabungkan reducer auth, users, dan lostFounds", () => {
    expect(Object.keys(reducer)).toEqual(["auth", "users", "lostFounds"]);
    expect(Object.keys(store.getState())).toEqual([
      "auth",
      "users",
      "lostFounds",
    ]);
  });

  it("memiliki state awal yang benar di setiap slice", () => {
    const state = store.getState();

    expect(state.auth.isAuthLogin).toBe(false);
    expect(state.users.profile).toBeNull();
    expect(state.lostFounds.lostFounds).toEqual([]);
  });

  it("meneruskan action ke reducer yang tepat", () => {
    store.dispatch(asyncAuthLogout.fulfilled(undefined, "id"));

    expect(store.getState().auth.isAuthLogout).toBe(true);
  });
});
