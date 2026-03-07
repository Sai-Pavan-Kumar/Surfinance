import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID!;
const accountsDatabaseId = "2da9fbd3f1b1808c937ac8e6c70a1576"; // Your Accounts Database ID

export async function getDashboardData() {
  try {
    // 1. Fetch Balances directly from Accounts Database
    const accountsResponse = await notion.databases.query({
      database_id: accountsDatabaseId,
    });

    let digitalBalance = 0;
    let handBalance = 0;

    accountsResponse.results.forEach((page: any) => {
      const name = page.properties.Name?.title[0]?.plain_text;
      // MATCHING NOTION COLUMN NAME EXACTLY: "Current Balance"
      const balanceValue = page.properties["Current Balance"]?.formula?.number || 
                           page.properties["Current Balance"]?.number || 0;

      if (name === "Digital Cash") digitalBalance = balanceValue;
      if (name === "Hand Cash") handBalance = balanceValue;
    });

    // 2. Fetch only the most recent 100 transactions for the Chart
    const transactionResponse = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      sorts: [{ property: "Date", direction: "descending" }], // Ensure newest are first
    });

    const DIGITAL_CASH_ID = "2da9fbd3-f1b1-8086-8b63-e82b46e94659";
    const HAND_CASH_ID = "2da9fbd3-f1b1-8032-a688-dc600a873bc6";

    const transactions = transactionResponse.results.map((page: any) => {
      const props = page.properties;
      const relData = props.rel?.relation;
      const relatedPageId = relData && relData.length > 0 ? relData[0].id : null;

      let relName = "Digital Cash"; 
      if (relatedPageId === HAND_CASH_ID) {
        relName = "Hand Cash";
      } else if (relatedPageId === DIGITAL_CASH_ID) {
        relName = "Digital Cash";
      }

      return {
        id: page.id,
        name: props.Name?.title[0]?.plain_text || "Untitled",
        amount: props.Amount?.number || 0,
        category: props.Category?.select?.name || "Uncategorized",
        type: props.Type?.select?.name || "Expense", 
        rel: relName, 
        date: props.Date?.date?.start || "",
      };
    });

    return { transactions, digitalBalance, handBalance };
  } catch (error) {
    console.error("Notion API Error:", error);
    return { transactions: [], digitalBalance: 0, handBalance: 0 };
  }
}

export async function addTransaction(data: {
  name: string;
  amount: number;
  category: string;
  type: "Income" | "Expense";
  rel: "Digital Cash" | "Hand Cash";
  date: string;
}) {
  const DIGITAL_CASH_ID = "2da9fbd3-f1b1-8086-8b63-e82b46e94659";
  const HAND_CASH_ID = "2da9fbd3-f1b1-8032-a688-dc600a873bc6";
  const relationId = data.rel === "Hand Cash" ? HAND_CASH_ID : DIGITAL_CASH_ID;

  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: data.name } }] },
        Amount: { number: data.amount },
        Category: { select: { name: data.category } },
        Type: { select: { name: data.type } },
        Date: { date: { start: data.date } },
        rel: { relation: [{ id: relationId }] },
      },
    });
    return { success: true, id: response.id };
  } catch (error) {
    console.error("Failed to add transaction:", error);
    return { success: false, error };
  }
}