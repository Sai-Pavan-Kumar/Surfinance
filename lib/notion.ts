import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID!;
const accountsDatabaseId = "2da9fbd3f1b1808c937ac8e6c70a1576"; // Your Accounts Database ID

export async function getDashboardData() {
  try {
    // 1. Fetch ALL Accounts
    const accountsResponse = await notion.databases.query({
      database_id: accountsDatabaseId,
    });

    const accounts = accountsResponse.results.map((page: any) => {
      const name = page.properties.Name?.title[0]?.plain_text || "Unknown";
      const balance = page.properties["Current Balance"]?.formula?.number || 
                      page.properties["Current Balance"]?.number || 0;
      return { id: page.id, name, balance };
    });

    const accountMap = new Map();
    accounts.forEach((acc) => accountMap.set(acc.id, acc.name));

    // 2. Fetch Master Categories list directly from the Database Schema
    const dbMetadata = await notion.databases.retrieve({ database_id: databaseId });
    const masterCategories = (dbMetadata.properties.Category as any).select.options.map(
      (option: any) => option.name
    );

    // 3. Fetch Transactions
    const transactionResponse = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      sorts: [{ property: "Date", direction: "descending" }], 
    });

    const transactions = transactionResponse.results.map((page: any) => {
      const props = page.properties;
      const relData = props.rel?.relation;
      const relatedPageId = relData && relData.length > 0 ? relData[0].id : null;
      const relName = relatedPageId ? accountMap.get(relatedPageId) || "Unknown" : "No Account";

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

    return { transactions, accounts, masterCategories }; // FIX: Added masterCategories
  } catch (error) {
    console.error("Notion API Error:", error);
    return { transactions: [], accounts: [], masterCategories: [] };
  }
}

export async function addTransaction(data: {
  name: string;
  amount: number;
  category: string;
  type: string;
  rel: string;
  date: string;
}) {
  try {
    // Dynamically find the Notion ID for whichever account name the user selects
    const accountsResponse = await notion.databases.query({
      database_id: accountsDatabaseId,
    });
    const matchedAccount = accountsResponse.results.find(
      (page: any) => page.properties.Name?.title[0]?.plain_text === data.rel
    );
    const relationId = matchedAccount ? matchedAccount.id : null;

    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: data.name } }] },
        Amount: { number: data.amount },
        Category: { select: { name: data.category } },
        Type: { select: { name: data.type } },
        Date: { date: { start: data.date } },
        ...(relationId && { rel: { relation: [{ id: relationId }] } }),
      },
    });
    return { success: true, id: response.id };
  } catch (error) {
    console.error("Failed to add transaction:", error);
    return { success: false, error };
  }
}