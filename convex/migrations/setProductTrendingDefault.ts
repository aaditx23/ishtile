import { mutation } from "../_generated/server";

export const setProductTrendingDefault = mutation({
  args: {},
  handler: async (ctx) => {
    let cursor: string | null = null;
    let updated = 0;

    while (true) {
      const page = await ctx.db.query("products").paginate({
        cursor,
        numItems: 100,
      });

      for (const product of page.page) {
        if (product.trending === undefined) {
          await ctx.db.patch(product._id, { trending: false });
          updated += 1;
        }
      }

      if (page.isDone) break;
      cursor = page.continueCursor;
    }

    return { updated };
  },
});
