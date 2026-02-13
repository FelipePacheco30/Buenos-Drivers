
import { useState, useEffect } from "react";
import { getDriverEarnings } from "../services/api";

export default function useDriverStatus() {
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEarnings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDriverEarnings();
      setEarnings(data.total || 0);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  return { earnings, loading, error, refresh: fetchEarnings };
}
