import { createSlice, isPending, isRejected } from "@reduxjs/toolkit";
import { asyncAuthLogout } from "../../auth/states/action";
import {
  asyncGetUsers,
  asyncGetUserById,
  asyncGetProfile,
  asyncChangeProfile,
  asyncChangeProfilePhoto,
  asyncChangeProfilePassword,
  resetUsersStatus,
} from "./action";

export const initialState = {
  users: [], // daftar semua pengguna
  user: null, // satu pengguna (berdasarkan id)
  profile: null, // profil pengguna yang sedang login
  isProfile: false, // true setelah profil berhasil dimuat
  isChangeProfile: false, // true setelah ubah profil berhasil
  isChangeProfilePhoto: false, // true setelah ubah foto berhasil
  isChangeProfilePassword: false, // true setelah ubah password berhasil
  isLoading: false, // true selama permintaan berjalan
  error: null, // pesan error terakhir
};

const apiThunks = [
  asyncGetUsers,
  asyncGetUserById,
  asyncGetProfile,
  asyncChangeProfile,
  asyncChangeProfilePhoto,
  asyncChangeProfilePassword,
];

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(asyncGetUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(asyncGetUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(asyncGetProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.isProfile = true;
      })
      .addCase(asyncChangeProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.isChangeProfile = true;
      })
      .addCase(asyncChangeProfilePhoto.fulfilled, (state) => {
        state.isLoading = false;
        state.isChangeProfilePhoto = true;
      })
      .addCase(asyncChangeProfilePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isChangeProfilePassword = true;
      })
      .addCase(resetUsersStatus, (state) => {
        state.isChangeProfile = false;
        state.isChangeProfilePhoto = false;
        state.isChangeProfilePassword = false;
        state.error = null;
      })
      // Setelah logout, data pengguna lama tidak boleh tersisa
      .addCase(asyncAuthLogout.fulfilled, () => initialState)
      .addMatcher(isPending(...apiThunks), (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(isRejected(...apiThunks), (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error.message;
      });
  },
});

export default usersSlice.reducer;