import * as xrpl from "xrpl";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const WTR_ISSUER_ADDRESS = process.env.WTR_ISSUER_ADDRESS;
const WTR_ISSUER_SEED = process.env.WTR_ISSUER_SEED;
const WTR_MPT_ID = process.env.WTR_MPT_ID;

export class MultiPurposeTokensManager {
  private client: xrpl.Client;

  constructor() {
    this.client = new xrpl.Client("wss://s.devnet.rippletest.net:51233");
    console.log("✅ Multi-Purpose Tokens Manager initialized");
  }

  async connect(): Promise<void> {
    if (!this.client.isConnected()) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.client.isConnected()) {
      await this.client.disconnect();
    }
  }

  private async signAndSubmitTransaction(
    transaction: xrpl.SubmittableTransaction
  ): Promise<any> {
    try {
      await this.connect();
      const wallet = xrpl.Wallet.fromSeed(WTR_ISSUER_SEED!);
      const response = await this.client.submitAndWait(transaction, { wallet });
      console.log("Transaction Response:", response);
      return response;
    } catch (error) {
      console.error("Error during transaction submission:", error);
      return { error: error instanceof Error ? error.message : error };
    } finally {
      await this.disconnect();
    }
  }

  async holderOptIn(account: string, seed: string): Promise<boolean> {
    try {
      await this.connect();
      const wallet = xrpl.Wallet.fromSeed(seed);
      const transaction: xrpl.SubmittableTransaction = {
        TransactionType: "MPTokenAuthorize",
        Account: wallet.classicAddress,
        MPTokenIssuanceID: WTR_MPT_ID!,
      };
      const response = await this.client.submitAndWait(transaction, { wallet });
      console.log("Holder Opt-In Response:", response);
      return response.result?.engine_result === "tesSUCCESS";
    } catch (error) {
      console.error("Error during holder opt-in:", error);
      return false;
    } finally {
      await this.disconnect();
    }
  }

  async authorizeHolder(holder: string): Promise<boolean> {
    const transaction: xrpl.SubmittableTransaction = {
      TransactionType: "MPTokenAuthorize",
      Account: xrpl.Wallet.fromSeed(WTR_ISSUER_SEED!).classicAddress,
      MPTokenIssuanceID: WTR_MPT_ID!,
      Holder: holder,
    };
    return this.signAndSubmitTransaction(transaction);
  }

  async makePayment(to: string, amount: string): Promise<any> {
    console.log("[makePayment] Initiating payment:", { to, amount });
    // Convert float amount to integer MPT units using AssetScale=2
    const assetScale = 2;
    let intAmount = 0;
    try {
      intAmount = Math.round(parseFloat(amount) * Math.pow(10, assetScale));
    } catch (e) {
      console.error("[makePayment] Invalid amount format:", amount);
      return { success: false, error: "Invalid amount format" };
    }
    if (!Number.isFinite(intAmount) || intAmount <= 0) {
      console.error("[makePayment] Computed invalid integer amount:", intAmount);
      return { success: false, error: "Invalid integer amount" };
    }
    const transaction: xrpl.SubmittableTransaction = {
      TransactionType: "Payment",
      Account: xrpl.Wallet.fromSeed(WTR_ISSUER_SEED!).classicAddress,
      Destination: to,
      Amount: {
        mpt_issuance_id: WTR_MPT_ID!,
        value: intAmount.toString(),
      },
    };
    try {
      const response = await this.signAndSubmitTransaction(transaction);
      // XRPL success can be in engine_result or meta.TransactionResult
      const engineResult = response?.result?.engine_result;
      const txResult = response?.result?.meta?.TransactionResult;
      const success = engineResult === "tesSUCCESS" || txResult === "tesSUCCESS";
      console.log("[makePayment] Payment result:", success);
      return {
        success,
        txResult: response?.result,
        fullResponse: response
      };
    } catch (error) {
      console.error("[makePayment] Error during payment:", error);
      return { success: false, error: error instanceof Error ? error.message : error };
    }
  }
}