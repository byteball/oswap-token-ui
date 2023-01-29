import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Redirect = ({ path }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(path);
  }, []);

  return null;
};
