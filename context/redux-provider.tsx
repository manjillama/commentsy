"use client";
import { RootState, initStore } from "@/store";
import { PreloadedState } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

export default function ReduxProvider({
  preloadedState,
  children,
}: {
  preloadedState?: PreloadedState<RootState>;
  children: React.ReactNode;
}) {
  return <Provider store={initStore(preloadedState)}>{children}</Provider>;
}
