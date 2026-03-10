import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    bio: v.string(),
    primaryGoal: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        bio: args.bio,
        primaryGoal: args.primaryGoal,
        onboardingComplete: true,
      });
      return existing._id;
    }

    return await ctx.db.insert("userProfiles", {
      userId,
      name: args.name,
      bio: args.bio,
      primaryGoal: args.primaryGoal,
      createdAt: Date.now(),
      onboardingComplete: true,
      planRevealed: false,
    });
  },
});

export const revealPlan = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, { planRevealed: true });
  },
});
