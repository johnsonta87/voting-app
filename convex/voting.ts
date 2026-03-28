import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * returns the single shared room's ID, creating it if it doesn't exist yet.
 */
export const getOrCreateRoom = mutation({
  args: {},
  handler: async (ctx) => {
    const room = await ctx.db.query("rooms").first();
    if (room) return room._id;
    return await ctx.db.insert("rooms", {
      revealed: false,
    });
  },
});

export const getVotes = query({
  args: {
    roomId: v.id("rooms"),
    voterName: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get("rooms", args.roomId);
    if (!room) return null;

    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .take(200);

    return {
      revealed: room.revealed,
      votes: votes.map((vote) => ({
        voterName: vote.voterName,
        // Own vote is always visible; others' are hidden until revealed
        value:
          room.revealed || vote.voterName === args.voterName
            ? vote.value
            : null,
        hasVoted: vote.value !== undefined,
      })),
    };
  },
});

export const submitVote = mutation({
  args: {
    roomId: v.id("rooms"),
    voterName: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_room_and_voter", (q) =>
        q.eq("roomId", args.roomId).eq("voterName", args.voterName),
      )
      .unique();

    if (existing) {
      await ctx.db.patch("votes", existing._id, { value: args.value });
    } else {
      await ctx.db.insert("votes", {
        roomId: args.roomId,
        voterName: args.voterName,
        value: args.value,
      });
    }
  },
});

export const revealVotes = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    await ctx.db.patch("rooms", args.roomId, { revealed: true });
  },
});

export const resetRoom = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch("rooms", args.roomId, {
      revealed: false,
    });

    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .take(200);

    for (const vote of votes) {
      await ctx.db.delete("votes", vote._id);
    }
  },
});

export const clearVotes = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    await ctx.db.patch("rooms", args.roomId, { revealed: false });

    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .take(200);

    for (const vote of votes) {
      await ctx.db.delete("votes", vote._id);
    }
  },
});

export const clearRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    await ctx.db.patch("rooms", args.roomId, {
      revealed: false,
    });

    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .take(200);

    for (const vote of votes) {
      await ctx.db.delete("votes", vote._id);
    }
  },
});

