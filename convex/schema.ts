import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // User profile with bio and goals
  userProfiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    bio: v.string(),
    primaryGoal: v.string(),
    createdAt: v.number(),
    onboardingComplete: v.boolean(),
    planRevealed: v.boolean(),
  }).index("by_user", ["userId"]),

  // Generated coaching plans
  coachingPlans: defineTable({
    userId: v.id("users"),
    content: v.string(),
    milestones: v.array(v.object({
      title: v.string(),
      description: v.string(),
      completed: v.boolean(),
    })),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Available coaches (predefined and community)
  coaches: defineTable({
    name: v.string(),
    avatar: v.string(),
    bio: v.string(),
    systemPrompt: v.string(),
    isOfficial: v.boolean(),
    createdBy: v.optional(v.id("users")),
    specialty: v.string(),
  }).index("by_official", ["isOfficial"]),

  // Chat conversations
  conversations: defineTable({
    userId: v.id("users"),
    coachId: v.id("coaches"),
    lastMessageAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_coach", ["userId", "coachId"]),

  // Individual messages
  messages: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    coachId: v.optional(v.id("coaches")),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),
});
