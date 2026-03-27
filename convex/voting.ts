import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Returns the single shared room's ID, creating it if it doesn't exist yet.
 * Idempotent: subsequent calls always return the same first room.
 */
export const getOrCreateRoom = mutation({
  args: {},
  handler: async (ctx) => {
    const room = await ctx.db.query("rooms").first();
    if (room) return room._id;
    return await ctx.db.insert("rooms", {
      ticketName: "Ticket #1",
      revealed: false,
    });
  },
});

/**
 * Real-time subscription for the voting room.
 * Each voter always sees their own selected value.
 * Other voters' values are hidden until the room is revealed.
 */
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
      ticketName: room.ticketName,
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

/**
 * Cast or update a vote for a given voter in the room.
 */
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

/**
 * Reveal all votes so every participant can see each other's selections.
 */
export const revealVotes = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    await ctx.db.patch("rooms", args.roomId, { revealed: true });
  },
});

/**
 * Reset the room for a new voting round.
 * Clears all votes and marks the room as un-revealed with a new ticket name.
 */
export const resetRoom = mutation({
  args: {
    roomId: v.id("rooms"),
    ticketName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch("rooms", args.roomId, {
      revealed: false,
      ticketName: args.ticketName,
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

/**
 * Clear only the votes for the current round, keeping the ticket name intact.
 */
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

/**
 * Clear the room to a blank slate: no ticket name, no votes, not revealed.
 */
export const clearRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    await ctx.db.patch("rooms", args.roomId, {
      revealed: false,
      ticketName: "",
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

/**
 * Update the ticket name being voted on without resetting votes.
 */
export const updateTicketName = mutation({
  args: {
    roomId: v.id("rooms"),
    ticketName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch("rooms", args.roomId, { ticketName: args.ticketName });
  },
});

