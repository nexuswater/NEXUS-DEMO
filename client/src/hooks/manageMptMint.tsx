import axios from "axios";

export const useManageMptMint = () => {
  const holderOptIn = async (account: string, seed: string) => {
    try {
      const response = await axios.post("/api/holder-opt-in", { account, seed });
      return response.data;
    } catch (error) {
      console.error("Error during holder opt-in:", error);
      throw error;
    }
  };

  const authorizeHolder = async (account: string) => {
    try {
      const response = await axios.post("/api/authorize-holder", { account });
      return response.data;
    } catch (error) {
      console.error("Error during authorize holder:", error);
      throw error;
    }
  };

  const mint = async (account: string, amount: string) => {
    console.log("[useManageMptMint] Mint request initiated:", { account, amount });
    try {
      const response = await axios.post("/api/mint", { account, amount });
      console.log("[useManageMptMint] Mint response:", response.data);
      return response.data;
    } catch (error) {
      console.error("[useManageMptMint] Error during mint request:", error);
      throw error;
    }
  };

  return { holderOptIn, authorizeHolder, mint };
};