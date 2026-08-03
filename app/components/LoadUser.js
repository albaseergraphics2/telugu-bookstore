"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUser } from "@/redux/actions/authActions";
import { loadCart } from "@/redux/actions/cartActions";

export default function LoadUser() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
    dispatch(loadCart());

    const handleFocus = () => {
      dispatch(loadUser());
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        dispatch(loadUser());
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [dispatch]);

  return null;
}