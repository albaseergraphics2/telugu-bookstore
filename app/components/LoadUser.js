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
  }, [dispatch]);

  return null;
}