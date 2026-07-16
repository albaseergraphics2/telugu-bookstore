import {
  ADD_TO_CART,
  REMOVE_FROM_CART,
  CLEAR_CART,
  LOAD_CART,
} from "../constants/cartConstants";

// Load Cart
export const loadCart = () => (dispatch) => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  dispatch({
    type: LOAD_CART,
    payload: cart,
  });
};

// Add / Update Cart
export const addToCart = (book, qty) => (dispatch, getState) => {
  dispatch({
    type: ADD_TO_CART,
    payload: {
      ...book,
      qty,
    },
  });

  localStorage.setItem(
    "cart",
    JSON.stringify(getState().cart.cartItems)
  );
};

// Remove Item
export const removeFromCart = (slug) => (dispatch, getState) => {
  dispatch({
    type: REMOVE_FROM_CART,
    payload: slug,
  });

  localStorage.setItem(
    "cart",
    JSON.stringify(getState().cart.cartItems)
  );
};

// Clear Cart
export const clearCart = () => (dispatch) => {
  dispatch({
    type: CLEAR_CART,
  });

  localStorage.removeItem("cart");
};