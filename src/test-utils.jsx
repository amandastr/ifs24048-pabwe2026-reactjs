import { render } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { reducer } from "./store";

// Render komponen dengan Redux Provider dan MemoryRouter.
// - preloadedState: state awal store (isi tiap slice harus lengkap)
// - route: alamat awal MemoryRouter
// Mengembalikan hasil render beserta `store` agar state bisa diperiksa.
export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    route = "/",
    store = configureStore({ reducer, preloadedState }),
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper }) };
};
