/**
 * Cleanup script for removing deprecated location fields
 * This removes shippingAreaName and shippingZoneName from all existing orders
 */
import { internalMutation } from "./_generated/server";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

type CleanupResult = {
  processedCount: number;
  updatedCount: number;
  success: boolean;
};

export const removeOldLocationFieldsInternal = internalMutation({
  handler: async (ctx): Promise<CleanupResult> => {
    const orders = await ctx.db.query("orders").collect();
    
    let processedCount = 0;
    let updatedCount = 0;

    for (const order of orders) {
      const update: Record<string, undefined> = {};

      if ("shippingAreaName" in order) {
        update.shippingAreaName = undefined;
      }

      if ("shippingZoneName" in order) {
        update.shippingZoneName = undefined;
      }

      if (Object.keys(update).length > 0) {
        await ctx.db.patch(order._id, update);
        updatedCount++;
      }
      
      processedCount++;
    }

    console.log(`[Cleanup] Processed ${processedCount} orders, updated ${updatedCount} orders`);
    
    return {
      processedCount,
      updatedCount,
      success: true,
    };
  },
});

export const removeOldLocationFields = action({
  handler: async (ctx): Promise<CleanupResult> => {
    return await ctx.runMutation(internal.orders_cleanup.removeOldLocationFieldsInternal);
  },
});

