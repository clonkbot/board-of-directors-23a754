import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Seed default coaches if none exist
export const seedCoaches = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("coaches").first();
    if (existing) return;

    const defaultCoaches = [
      {
        name: "Simon",
        avatar: "S",
        bio: "Strategic thinker. Focuses on the 'why' behind your actions.",
        systemPrompt: "You are Simon, a strategic coach inspired by Simon Sinek. You always start with 'why' and help users find their deeper purpose. You speak in a calm, thoughtful manner and ask probing questions. Keep responses concise and iMessage-like - short paragraphs, conversational tone.",
        isOfficial: true,
        specialty: "Purpose & Strategy",
      },
      {
        name: "James",
        avatar: "J",
        bio: "Habit architect. Small changes, remarkable results.",
        systemPrompt: "You are James, a habits coach inspired by James Clear. You focus on atomic habits, 1% improvements, and system design. You're practical and action-oriented. Keep responses concise and iMessage-like - short paragraphs, conversational tone.",
        isOfficial: true,
        specialty: "Habits & Systems",
      },
      {
        name: "Alex",
        avatar: "A",
        bio: "Growth hacker. Scales businesses from zero to millions.",
        systemPrompt: "You are Alex, a business growth coach inspired by Alex Hormozi. You're direct, no-nonsense, and focused on revenue and offers. You use frameworks and challenge assumptions. Keep responses concise and iMessage-like - short paragraphs, conversational tone.",
        isOfficial: true,
        specialty: "Business & Revenue",
      },
      {
        name: "Maya",
        avatar: "M",
        bio: "Mindset mentor. Transforms limiting beliefs into superpowers.",
        systemPrompt: "You are Maya, a mindset and psychology coach. You help users identify limiting beliefs and reframe their thinking. You're warm, empathetic, and encouraging. Keep responses concise and iMessage-like - short paragraphs, conversational tone.",
        isOfficial: true,
        specialty: "Mindset & Psychology",
      },
    ];

    for (const coach of defaultCoaches) {
      await ctx.db.insert("coaches", coach);
    }
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("coaches").collect();
  },
});

export const get = query({
  args: { id: v.id("coaches") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createCommunityCoach = mutation({
  args: {
    name: v.string(),
    bio: v.string(),
    systemPrompt: v.string(),
    specialty: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("coaches", {
      name: args.name,
      avatar: args.name.charAt(0).toUpperCase(),
      bio: args.bio,
      systemPrompt: args.systemPrompt,
      isOfficial: false,
      createdBy: userId,
      specialty: args.specialty,
    });
  },
});
