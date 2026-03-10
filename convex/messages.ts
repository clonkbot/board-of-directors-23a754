import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get coach details for each conversation
    const conversationsWithCoaches = await Promise.all(
      conversations.map(async (conv) => {
        const coach = await ctx.db.get(conv.coachId);
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .order("desc")
          .first();
        return { ...conv, coach, lastMessage };
      })
    );

    return conversationsWithCoaches.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

export const getOrCreateConversation = mutation({
  args: { coachId: v.id("coaches") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check for existing conversation
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_user_coach", (q) =>
        q.eq("userId", userId).eq("coachId", args.coachId)
      )
      .first();

    if (existing) return existing._id;

    // Create new conversation
    return await ctx.db.insert("conversations", {
      userId,
      coachId: args.coachId,
      lastMessageAt: Date.now(),
    });
  },
});

export const listMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found");
    }

    // Add user message
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      userId,
      content: args.content,
      role: "user",
      createdAt: Date.now(),
    });

    // Update conversation timestamp
    await ctx.db.patch(args.conversationId, { lastMessageAt: Date.now() });

    return args.conversationId;
  },
});

export const addCoachResponse = mutation({
  args: {
    conversationId: v.id("conversations"),
    coachId: v.id("coaches"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      userId,
      coachId: args.coachId,
      content: args.content,
      role: "assistant",
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.conversationId, { lastMessageAt: Date.now() });
  },
});
