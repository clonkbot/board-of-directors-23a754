import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("coachingPlans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const generate = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    // Check if plan already exists
    const existing = await ctx.db
      .query("coachingPlans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) return existing._id;

    // Generate a personalized plan based on the goal
    const goalLower = profile.primaryGoal.toLowerCase();

    let milestones = [];

    if (goalLower.includes("mrr") || goalLower.includes("revenue") || goalLower.includes("money")) {
      milestones = [
        { title: "Validate Your Offer", description: "Talk to 10 potential customers and identify their biggest pain point", completed: false },
        { title: "Build MVP", description: "Create the simplest version that solves the core problem", completed: false },
        { title: "First Paying Customer", description: "Convert one user to a paying customer at any price", completed: false },
        { title: "Feedback Loop", description: "Implement weekly user feedback sessions", completed: false },
        { title: "Scale to 10 Customers", description: "Refine your acquisition channel and hit 10 paying users", completed: false },
      ];
    } else if (goalLower.includes("fit") || goalLower.includes("health") || goalLower.includes("weight")) {
      milestones = [
        { title: "Baseline Assessment", description: "Track your current metrics: weight, energy, sleep quality", completed: false },
        { title: "Morning Routine", description: "Establish a 20-minute morning movement practice", completed: false },
        { title: "Nutrition Reset", description: "Eliminate processed foods for 2 weeks", completed: false },
        { title: "Consistency Streak", description: "Hit 21 consecutive days of your new habits", completed: false },
        { title: "Progress Review", description: "Reassess all baseline metrics and adjust plan", completed: false },
      ];
    } else {
      milestones = [
        { title: "Define Success", description: "Write down exactly what achieving this goal looks like", completed: false },
        { title: "Identify Blockers", description: "List the top 3 obstacles and how you'll overcome them", completed: false },
        { title: "Daily Action", description: "Commit to one small daily action toward your goal", completed: false },
        { title: "Accountability Check", description: "Review progress weekly with your AI coaches", completed: false },
        { title: "First Milestone", description: "Achieve your first measurable progress marker", completed: false },
      ];
    }

    const content = `Your personalized roadmap to "${profile.primaryGoal}" has been crafted based on your profile. This plan is designed specifically for ${profile.name}, leveraging your unique background and strengths.`;

    return await ctx.db.insert("coachingPlans", {
      userId,
      content,
      milestones,
      createdAt: Date.now(),
    });
  },
});

export const toggleMilestone = mutation({
  args: {
    milestoneIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const plan = await ctx.db
      .query("coachingPlans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!plan) throw new Error("Plan not found");

    const milestones = [...plan.milestones];
    milestones[args.milestoneIndex] = {
      ...milestones[args.milestoneIndex],
      completed: !milestones[args.milestoneIndex].completed,
    };

    await ctx.db.patch(plan._id, { milestones });
  },
});
