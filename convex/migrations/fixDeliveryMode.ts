import { mutation } from "../_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    let cursor: string | null = null;
    let updated = 0;

    while (true) {
      const page = await ctx.db.query("orders").paginate({
        cursor,
        numItems: 100,
      });

      for (const order of page.page) {
        if (order.deliveryMode === undefined) {
          await ctx.db.patch(order._id, { deliveryMode: "manual" });
          updated += 1;
        }
      }

      if (page.isDone) {
        break;
      }

      cursor = page.continueCursor;
    }

    return { updated };
  },
});
