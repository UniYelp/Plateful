import { query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

export const getTasks = query({
    args: {},
    handler: async (ctx) => {
        // Get most recent tasks first
        const tasks = await ctx.db.query('tasks').order('desc').take(50);
        // Reverse the list so that it's in a chronological order.
        return tasks.reverse();
    },
});

export const getForCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUserOrThrow(ctx);

        return await ctx.db
            .query('tasks')
            .filter((q) => q.eq(q.field('by'), user._id))
            .collect();
    },
});
