import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/states/reducer";
import lostFoundReducer from "./features/lost-founds/states/reducer";
// Tambahkan reducer users jika folder features/users/states sudah ada:
// import usersReducer from "./features/users/states/reducer";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    lostFounds: lostFoundReducer,
    // users: usersReducer,
  },
});

export default store;
