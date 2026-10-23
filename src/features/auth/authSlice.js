
import { createSlice } from "@reduxjs/toolkit";
import { normalizeUser } from "../../utils/auth";

const parseSavedUser = () => {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? normalizeUser(JSON.parse(savedUser)) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const savedToken = localStorage.getItem("token");

const initialState = {
  user: parseSavedUser(),
  token: savedToken || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = normalizeUser(action.payload.user);
      state.token = action.payload.token;

      localStorage.setItem(
        "user",
        JSON.stringify(state.user)
      );
      localStorage.setItem("token", action.payload.token);
    },

    logout: (state) => {
      state.user = null;
      state.token = null;

      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
