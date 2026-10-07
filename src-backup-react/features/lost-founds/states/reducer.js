import { createSlice } from "@reduxjs/toolkit";
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

export const getInitialState = () => ({
  lostFounds: [], // daftar laporan
  lostFound: null, // detail laporan
  lostFoundStats: null, // statistik
  isLostFound: false, // loading daftar/detail
  isLostFoundAdd: false,
  isLostFoundAdded: false,
  isLostFoundChange: false,
  isLostFoundChanged: false,
  isLostFoundChangeCover: false,
  isLostFoundChangedCover: false,
  isLostFoundDelete: false,
  isLostFoundDeleted: false,
  error: null,
});

const lostFoundSlice = createSlice({
  name: "lostFounds",
  initialState: getInitialState,
  reducers: {},
  extraReducers: (builder) => {
    // Menambahkan pasangan pending/fulfilled/rejected untuk satu thunk
    const track = (thunk, loadingKey, doneKey, onSuccess) => {
      builder
        .addCase(thunk.pending, (state) => {
          state[loadingKey] = true;
          state.error = null;
          if (doneKey) state[doneKey] = false;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state[loadingKey] = false;
          if (doneKey) state[doneKey] = true;
          if (onSuccess) onSuccess(state, action);
        })
        .addCase(thunk.rejected, (state, action) => {
          state[loadingKey] = false;
          state.error = action.payload ?? action.error.message;
        });
    };

    track(asyncGetLostFounds, "isLostFound", null, (s, a) => {
      s.lostFounds = a.payload;
    });
    track(asyncGetLostFound, "isLostFound", null, (s, a) => {
      s.lostFound = a.payload;
    });
    track(asyncGetLostFoundStats, "isLostFound", null, (s, a) => {
      s.lostFoundStats = a.payload;
    });
    track(asyncAddLostFound, "isLostFoundAdd", "isLostFoundAdded");
    track(asyncChangeLostFound, "isLostFoundChange", "isLostFoundChanged");
    track(
      asyncChangeCoverLostFound,
      "isLostFoundChangeCover",
      "isLostFoundChangedCover"
    );
    track(asyncDeleteLostFound, "isLostFoundDelete", "isLostFoundDeleted");

    builder.addCase(resetLostFoundStatus, (state) => {
      state.isLostFoundAdded = false;
      state.isLostFoundChanged = false;
      state.isLostFoundChangedCover = false;
      state.isLostFoundDeleted = false;
      state.error = null;
    });
  },
});

export default lostFoundSlice.reducer;
