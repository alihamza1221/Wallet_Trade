import { Token } from "./tokens";

export async function getQuote(
  swapFrom: Token,
  swapTo: Token,
  amount: string
): Promise<string | undefined> {
  if (!amount || parseFloat(amount) <= 0) {
    return "";
  }

  try {
    // Fetch the quote from the backend API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/quote`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          swapFrom: swapFrom,
          swapTo: swapTo,
          userAmount: amount,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.quote || data.amount || "";
    } else {
      throw new Error("Failed to fetch quote");
    }
  } catch (error) {
    console.log("Error fetching quote:", error);
  }
}
