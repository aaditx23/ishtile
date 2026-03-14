import { mutation } from "../_generated/server";

export const fixOldOrderStatus = mutation({
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    let updated = 0;
    for (const order of orders) {
      const rawStatus = order.status as unknown as string;
      if (rawStatus === "new") {
        await ctx.db.patch(order._id, {
          status: "pending"
        });
        updated++;
      }
    }
    return { updated };
  }
});
