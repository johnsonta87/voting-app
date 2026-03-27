import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    ticketName: v.string(),
    revealed: v.boolean(),
  }),
  votes: defineTable({
    roomId: v.id("rooms"),
    voterName: v.string(),
    value: v.optional(v.string()),
  })
    .index("by_room", ["roomId"])
    .index("by_room_and_voter", ["roomId", "voterName"]),
});
