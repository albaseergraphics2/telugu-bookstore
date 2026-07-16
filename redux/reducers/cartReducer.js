import {
  ADD_TO_CART,
  REMOVE_FROM_CART,
  CLEAR_CART,
  LOAD_CART,
} from "../constants/cartConstants";

const initialState = {
  cartItems: [],
};

export const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_CART:
      return {
        ...state,
        cartItems: action.payload,
      };

    case ADD_TO_CART: {
      const item = action.payload;

      const existItem = state.cartItems.find(
        (i) => i.slug === item.slug
      );

      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((i) =>
            i.slug === existItem.slug ? item : i
          ),
        };
      }

      return {
        ...state,
        cartItems: [...state.cartItems, item],
      };
    }

    case REMOVE_FROM_CART:
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (item) => item.slug !== action.payload
        ),
      };

    case CLEAR_CART:
      return {
        ...state,
        cartItems: [],
      };

    default:
      return state;
  }
};