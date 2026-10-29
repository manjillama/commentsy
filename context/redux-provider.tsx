"use client";
import { RootState, initStore } from "@/store";
import { PreloadedState } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { useState } from "react";

export default function ReduxProvider({
  preloadedState,
  children,
}: {
  preloadedState?: PreloadedState<RootState>;
  children: React.ReactNode;
}) {
  const [store] = useState(() => initStore(preloadedState));
  return <Provider store={store}>{children}</Provider>;
}
