import { IApp } from "@/interfaces/IApp";
import { AppDispatch } from "@/store";
import api from "@/utils/api";
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
export const refetchUserApps = () => async (dispatch: AppDispatch) => {
  const data = await api.get<IApp[]>("/api/apps");
  if (data.status === "success")
    dispatch(userAppsSlice.actions.setUserApps(data.data));
};
export default userAppsSlice.reducer;
