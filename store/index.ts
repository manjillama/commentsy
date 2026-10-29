import userAppsReducer from "@/slices/userAppsSlice";
import {
  PreloadedState,
  StateFromReducersMapObject,
  configureStore,
} from "@reduxjs/toolkit";

const reducer = {
  apps: userAppsReducer,
};

export type RootState = StateFromReducersMapObject<typeof reducer>;
export function initStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer,
    preloadedState,
  });
}

type Store = ReturnType<typeof initStore>;
export type AppDispatch = Store["dispatch"];
