import axios from "axios";

import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,

  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAIL,

  LOAD_USER_REQUEST,
  LOAD_USER_SUCCESS,
  LOAD_USER_FAIL,

  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAIL,

  LOGOUT_SUCCESS,

  CLEAR_ERRORS,
} from "../constants/authConstants";

// ================= LOGIN =================

export const login = (loginData) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    await axios.post("/api/auth", {
      type: "login",
      loginId: loginData.loginId,
      password: loginData.password,
    });

    const { data } = await axios.get("/api/auth/me");

    dispatch({
      type: LOGIN_SUCCESS,
      payload: data.user,
    });

  } catch (error) {
    dispatch({
      type: LOGIN_FAIL,
      payload: error.response?.data?.message || "Login Failed",
    });
  }
};

// ================= REGISTER =================

export const register = (userData) => async (dispatch) => {
  try {
    dispatch({ type: REGISTER_REQUEST });

    await axios.post("/api/auth", {
      type: "register",
      name: userData.name,
      username: userData.username,
      phone: userData.phone,
      email: userData.email,
      password: userData.password,
    });

    const { data } = await axios.get("/api/auth/me");

    dispatch({
      type: REGISTER_SUCCESS,
      payload: data.user,
    });

  } catch (error) {
    dispatch({
      type: REGISTER_FAIL,
      payload: error.response?.data?.message || "Registration Failed",
    });
  }
};

// ================= LOAD USER =================
export const loadUser = () => async (dispatch) => {
  try {
    dispatch({ type: LOAD_USER_REQUEST });

    const { data } = await axios.get("/api/auth/me");

    dispatch({
      type: LOAD_USER_SUCCESS,
      payload: data.user,
    });

  } catch (error) {
    dispatch({
      type: LOAD_USER_FAIL,
      payload: error.response?.data?.message || "Unauthorized",
    });
  }
};

// ================= LOGOUT =================

// Implement after creating /api/auth/logout
export const logout = () => async (dispatch) => {
  try {
    await axios.post("/api/auth/logout");

    dispatch({
      type: LOGOUT_SUCCESS,
    });

  } catch (error) {
    console.log(error);
  }
};

// ================= FORGOT PASSWORD =================

export const forgotPassword = (email) => async (dispatch) => {
  try {
    dispatch({ type: FORGOT_PASSWORD_REQUEST });

    const { data } = await axios.post("/api/auth/forgot-password", {
      email,
    });

    dispatch({
      type: FORGOT_PASSWORD_SUCCESS,
      payload: data.message,
    });

  } catch (error) {
    dispatch({
      type: FORGOT_PASSWORD_FAIL,
      payload: error.response?.data?.message || "Failed to send reset link",
    });
  }
};

// ================= CLEAR ERRORS =================

export const clearErrors = () => (dispatch) => {
  dispatch({
    type: CLEAR_ERRORS,
  });
};