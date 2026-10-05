import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import lostFoundApi from "../api/lostFoundApi";

export const resetLostFoundStatus = createAction("lostFounds/resetStatus");

// Membungkus pemanggilan API agar error dikembalikan sebagai pesan string
const makeThunk = (type, fn) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const asyncGetLostFounds = makeThunk("lostFounds/getAll", (params) =>
  lostFoundApi.getAll(params)
);
export const asyncGetLostFound = makeThunk("lostFounds/getById", (id) =>
  lostFoundApi.getById(id)
);
export const asyncAddLostFound = makeThunk("lostFounds/add", (data) =>
  lostFoundApi.add(data)
);
export const asyncChangeLostFound = makeThunk(
  "lostFounds/change",
  ({ id, ...data }) => lostFoundApi.change(id, data)
);
export const asyncChangeCoverLostFound = makeThunk(
  "lostFounds/changeCover",
  ({ id, cover }) => lostFoundApi.changeCover(id, cover)
);
export const asyncDeleteLostFound = makeThunk("lostFounds/delete", (id) =>
  lostFoundApi.remove(id)
);
export const asyncGetLostFoundStats = makeThunk(
  "lostFounds/stats",
  ({ type, params } = {}) => lostFoundApi.getStats(type, params)
);
