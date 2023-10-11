import { IApp } from "@/interfaces/IApp";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface UserAppsState {
  apps: IApp[];
}

const initialState: UserAppsState = {
  apps: [],
};

export const userAppsSlice = createSlice({
  name: "userApps",
  initialState,
  reducers: {
    setUserApps: (state, action: PayloadAction<any>) => {
      state.apps = [...action.payload];
    },
    pushUserApp: (state, action: PayloadAction<any>) => {
      state.apps.push(action.payload);
    },
  },
});

export const { setUserApps, pushUserApp } = userAppsSlice.actions;

export default userAppsSlice.reducer;
