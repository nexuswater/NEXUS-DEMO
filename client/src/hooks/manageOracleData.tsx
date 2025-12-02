import { useState } from "react";

export function useManageOracleData() {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchDate, setLastFetchDate] = useState<string | null>(null);

  const fetchOracleData = async (oracleIndex: string | null) => {
    if (!oracleIndex) {
      console.error("No oracleIndex provided to fetchOracleData");
      setError("Oracle index is required to fetch oracle data.");
      return;
    }

    console.log("Fetching oracle data for oracleIndex:", oracleIndex);

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch("/api/oracle-data/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oracleIndex }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch oracle data");
      }

      const responseText = await response.text();
      console.log("Raw response text:", responseText);

      const data = JSON.parse(responseText);
      console.log("Parsed oracle data:", data);

      setLastFetchDate(new Date().toISOString());
    } catch (err) {
      console.error("Error fetching oracle data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsFetching(false);
    }
  };

  const updateOracleData = async (oracleIndex: string | null) => {
    if (!oracleIndex) {
      console.error("No oracleIndex provided to updateOracleData");
      setError("Oracle index is required to update oracle data.");
      return;
    }

    console.log("Updating oracle data for oracleIndex:", oracleIndex);

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch("/api/oracle-data/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oracleIndex }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to update oracle data");
      }

      const responseText = await response.text();
      console.log("Raw response text:", responseText);

      const data = JSON.parse(responseText);
      console.log("Parsed oracle data:", data);

      // Temporarily update the last fetch date in the frontend
      setLastFetchDate(new Date().toISOString());
    } catch (err) {
      console.error("Error updating oracle data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsFetching(false);
    }
  };

  const fetchOracleTOV = async (oracleIndex: string | null) => {
    if (!oracleIndex) {
      console.error("No oracleIndex provided to fetchOracleTOV");
      setError("Oracle index is required to fetch TOV.");
      return null;
    }

    console.log("Fetching TOV for oracleIndex:", oracleIndex);

    try {
      const response = await fetch(`/api/oracle-data/tov?oracleIndex=${oracleIndex}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch TOV");
      }

      const data = await response.json();
      console.log("Fetched TOV data:", data);

      return data.tov || null;
    } catch (err) {
      console.error("Error fetching TOV:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    }
  };

  const fetchTOV = async (oracleIndex: string | null): Promise<number | null> => {
    if (!oracleIndex) {
      console.error("No oracleIndex provided to fetch TOV");
      setError("Oracle index is required to fetch TOV.");
      return null;
    }

    console.log("Fetching TOV for oracleIndex:", oracleIndex);

    try {
      const response = await fetch(`/api/oracle-data/tov?oracleIndex=${oracleIndex}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch TOV");
      }

      const data = await response.json();
      console.log("Fetched TOV data:", data);

      return data.tov || null;
    } catch (err) {
      console.error("Error fetching TOV:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    }
  };

  return {
    isFetching,
    error,
    lastFetchDate,
    fetchOracleData,
    updateOracleData,
    fetchOracleTOV,
    fetchTOV, // Added the new function to fetch TOV
  };
}