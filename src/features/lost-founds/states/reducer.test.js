import { describe, it, expect } from "vitest";
import reducer, { initialState } from "./reducer";
import {
  asyncGetLostFounds,
  asyncGetLostFound,
  asyncAddLostFound,
  asyncChangeLostFound,
  asyncChangeLostFoundCover,
  asyncDeleteLostFound,
  asyncGetLostFoundStatsDaily,
  asyncGetLostFoundStatsMonthly,
  resetLostFoundStatus,
} from "./action";
import { asyncAuthLogout } from "../../auth/states/action";

const item = { id: 1, title: "Dompet", status: "lost", is_completed: 0 };
const loading = { ...initialState, isLoading: true };

describe("lost-founds reducer", () => {
  it("mengembalikan state awal", () => {
    expect(reducer(undefined, { type: "tidak-dikenal" })).toEqual(initialState);
  });

  describe("pemuatan data", () => {
    it("asyncGetLostFounds.fulfilled menyimpan daftar laporan", () => {
      const state = reducer(loading, asyncGetLostFounds.fulfilled([item], "id"));

      expect(state.lostFounds).toEqual([item]);
      expect(state.isLoading).toBe(false);
    });

    it("asyncGetLostFound.pending mengosongkan detail lama dan mengaktifkan loading", () => {
      const prev = { ...initialState, lostFound: item, isLostFound: true };
      const state = reducer(prev, asyncGetLostFound.pending("id", 2));

      expect(state.lostFound).toBeNull();
      expect(state.isLostFound).toBe(false);
      expect(state.isLoading).toBe(true);
    });

    it("asyncGetLostFound.fulfilled menyimpan detail dan menandai isLostFound", () => {
      const state = reducer(loading, asyncGetLostFound.fulfilled(item, "id", 1));

      expect(state.lostFound).toEqual(item);
      expect(state.isLostFound).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it("statistik harian dan bulanan disimpan terpisah", () => {
      const daily = { stats_losts: { "06-10-2024": 1 } };
      const monthly = { stats_losts: { "10-2024": 1 } };

      let state = reducer(loading, asyncGetLostFoundStatsDaily.fulfilled(daily, "id"));
      expect(state.lostFoundStats.daily).toEqual(daily);
      expect(state.lostFoundStats.monthly).toBeNull();
      expect(state.isLoading).toBe(false);

      state = reducer(
        { ...state, isLoading: true },
        asyncGetLostFoundStatsMonthly.fulfilled(monthly, "id")
      );
      expect(state.lostFoundStats.daily).toEqual(daily);
      expect(state.lostFoundStats.monthly).toEqual(monthly);
      expect(state.isLoading).toBe(false);
    });

    it.each([
      ["asyncGetLostFounds", asyncGetLostFounds, undefined],
      ["asyncGetLostFound", asyncGetLostFound, 1],
      ["asyncGetLostFoundStatsDaily", asyncGetLostFoundStatsDaily, undefined],
      ["asyncGetLostFoundStatsMonthly", asyncGetLostFoundStatsMonthly, undefined],
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
  });

  describe("perubahan data", () => {
    it.each([
      ["asyncAddLostFound", asyncAddLostFound, "isLostFoundAdd", "isLostFoundAdded"],
      ["asyncChangeLostFound", asyncChangeLostFound, "isLostFoundChange", "isLostFoundChanged"],
      ["asyncChangeLostFoundCover", asyncChangeLostFoundCover, "isLostFoundChangeCover", "isLostFoundChangedCover"],
      ["asyncDeleteLostFound", asyncDeleteLostFound, "isLostFoundDelete", "isLostFoundDeleted"],
    ])("%s: pending, fulfilled, dan rejected mengatur flag %s dan %s", (_n, thunk, running, done) => {
      const pendingState = reducer(
        { ...initialState, [done]: true, error: "lama" },
        thunk.pending("id", {})
      );
      expect(pendingState[running]).toBe(true);
      expect(pendingState[done]).toBe(false);
      expect(pendingState.error).toBeNull();

      const fulfilledState = reducer(pendingState, thunk.fulfilled("ok", "id", {}));
      expect(fulfilledState[running]).toBe(false);
      expect(fulfilledState[done]).toBe(true);

      const rejectedState = reducer(
        pendingState,
        thunk.rejected(null, "id", {}, "Gagal menyimpan")
      );
      expect(rejectedState[running]).toBe(false);
      expect(rejectedState[done]).toBe(false);
      expect(rejectedState.error).toBe("Gagal menyimpan");
    });

    it("rejected memakai pesan dari error jika payload tidak ada", () => {
      const state = reducer(
        initialState,
        asyncAddLostFound.rejected(new Error("Gagal tak terduga"), "id", {})
      );

      expect(state.error).toBe("Gagal tak terduga");
    });
  });

  it("resetLostFoundStatus mereset flag berhasil dan error, data tetap", () => {
    const prev = {
      ...initialState,
      lostFounds: [item],
      lostFound: item,
      isLostFound: true,
      isLostFoundAdded: true,
      isLostFoundChanged: true,
      isLostFoundChangedCover: true,
      isLostFoundDeleted: true,
      error: "sesuatu",
    };

    const state = reducer(prev, resetLostFoundStatus());

    expect(state.isLostFoundAdded).toBe(false);
    expect(state.isLostFoundChanged).toBe(false);
    expect(state.isLostFoundChangedCover).toBe(false);
    expect(state.isLostFoundDeleted).toBe(false);
    expect(state.error).toBeNull();
    expect(state.lostFounds).toEqual([item]);
    expect(state.lostFound).toEqual(item);
    expect(state.isLostFound).toBe(true);
  });

  it("logout mengosongkan seluruh data laporan", () => {
    const prev = { ...initialState, lostFounds: [item], lostFound: item };

    const state = reducer(prev, asyncAuthLogout.fulfilled(undefined, "id"));

    expect(state).toEqual(initialState);
  });
});
