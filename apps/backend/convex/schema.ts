import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    users: defineTable({
        // this the Clerk ID, stored in the subject JWT field
        externalId: v.string(),
    }).index('byExternalId', ['externalId']),
    tasks: defineTable({
        text: v.string(),
        by: v.id('users'),
        isCompleted: v.boolean(),
    }),
});
