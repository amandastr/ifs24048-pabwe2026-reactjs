import { describe, it, expect } from "vitest";
import reducer, { getInitialState } from "./reducer";
import {
  asyncGetLostFounds,
  asyncGetLostFound,
  asyncAddLostFound,
  asyncChangeLostFound,
  asyncChangeCoverLostFound,
  asyncDeleteLostFound,
  asyncGetLostFoundStats,
  resetLostFoundStatus,
} from "./action";

const item = { id: 1, title: "Dompet", status: "lost", is_completed: 0 };
const stats = { stats_losts: { "06-10-2024": 1 } };

describe("lost-founds reducer", () => {
  it("mengembalikan state awal", () => {
    expect(reducer(undefined, { type: "tidak-dikenal" })).toEqual(
      getInitialState()
    );
  });

  it("getInitialState selalu membuat object baru", () => {
    expect(getInitialState()).not.toBe(getInitialState());
  });

  describe("pemuatan data (memakai isLostFound)", () => {
    it.each([
      ["asyncGetLostFounds", asyncGetLostFounds, [item], "lostFounds", undefined],
      ["asyncGetLostFound", asyncGetLostFound, item, "lostFound", 1],
      ["asyncGetLostFoundStats", asyncGetLostFoundStats, stats, "lostFoundStats", undefined],
    ])("%s: pending, fulfilled, dan rejected", (_n, thunk, payload, key, arg) => {
      const pendingState = reducer(
        { ...getInitialState(), error: "lama" },
        thunk.pending("id", arg)
      );
      expect(pendingState.isLostFound).toBe(true);
      expect(pendingState.error).toBeNull();

      const fulfilledState = reducer(
        pendingState,
        thunk.fulfilled(payload, "id", arg)
      );
      expect(fulfilledState.isLostFound).toBe(false);
      expect(fulfilledState[key]).toEqual(payload);

      const rejectedState = reducer(
        pendingState,
        thunk.rejected(null, "id", arg, "Pesan dari API")
      );
      expect(rejectedState.isLostFound).toBe(false);
      expect(rejectedState.error).toBe("Pesan dari API");
      expect(rejectedState[key]).toEqual(getInitialState()[key]);
    });
  });

  describe("perubahan data (flag berjalan dan berhasil)", () => {
    it.each([
      ["asyncAddLostFound", asyncAddLostFound, "isLostFoundAdd", "isLostFoundAdded"],
      ["asyncChangeLostFound", asyncChangeLostFound, "isLostFoundChange", "isLostFoundChanged"],
      ["asyncChangeCoverLostFound", asyncChangeCoverLostFound, "isLostFoundChangeCover", "isLostFoundChangedCover"],
      ["asyncDeleteLostFound", asyncDeleteLostFound, "isLostFoundDelete", "isLostFoundDeleted"],
    ])("%s: pending, fulfilled, dan rejected mengatur flag %s dan %s", (_n, thunk, running, done) => {
      const pendingState = reducer(
        { ...getInitialState(), [done]: true, error: "lama" },
        thunk.pending("id", {})
      );
      expect(pendingState[running]).toBe(true);
      expect(pendingState[done]).toBe(false);
      expect(pendingState.error).toBeNull();

      const fulfilledState = reducer(
        pendingState,
        thunk.fulfilled(null, "id", {})
      );
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
  });

  it("rejected memakai pesan dari error jika payload tidak ada", () => {
    const state = reducer(
      getInitialState(),
      asyncAddLostFound.rejected(new Error("Gagal tak terduga"), "id", {})
    );

    expect(state.error).toBe("Gagal tak terduga");
  });

  it("resetLostFoundStatus mereset flag berhasil dan error, data tetap", () => {
    const prev = {
      ...getInitialState(),
      lostFounds: [item],
      lostFound: item,
      lostFoundStats: stats,
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
    expect(state.lostFoundStats).toEqual(stats);
  });
});
