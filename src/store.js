import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/states/reducer";
import usersReducer from "./features/users/states/reducer";
import lostFoundReducer from "./features/lost-founds/states/reducer";

// Dipisahkan agar test bisa membuat store baru dengan reducer yang sama
export const reducer = {
  auth: authReducer,
  users: usersReducer,
  lostFounds: lostFoundReducer,
};

export const store = configureStore({ reducer });

export default store;
