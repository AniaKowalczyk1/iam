import { useEffect, useState } from "react";
import { api } from "../api/axios";

export function useAuth() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadUser = async () => {

      try {
        const res = await api.get("/auth/me");

        setUser(res.data);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

  }, []);

  return {
    user,
    loading
  };
}