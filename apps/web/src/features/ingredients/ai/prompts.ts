import dedent from "dedent";

export const expiryDateHintPrompt = ({
	name,
	today,
	timezone,
}: {
	name: string;
	today: string;
	timezone: string;
}) =>
	dedent`
        Given an ingredient, determine its typical default storage method and estimate its expiration date based on today's date.

        [CRITICAL INSTRUCTIONS]
        1. IDENTIFY SHELF-STABLE ITEMS: If the ingredient is inherently stable and doesn't realistically expire in a household timescale (e.g., sugar, salt, honey, white rice, vinegar, water), you MUST set estimatedExpiryDate to null. Never guess a future year.
        2. CATEGORIZE PERISHABLES BY TIMELINE: If the item is perishable, force the estimation into one of these strict grocery-store-sealed baselines:
        - Ultra-fresh (Fresh raw fish, berries): +3 days
        - Standard cold fresh (Milk, fresh raw meat/sausage): +7 days
        - Packaged processed/smoked cold items (Bacon, processed sausages/hot dogs, eggs, hard cheese): +14 to +21 days
        - Frozen items (Ice cream): +90 days
        3. CALCULATION: Identify which tier the ingredient belongs to, assume it is a fresh, unopened commercial package bought today, and add those days to today's date.

        [CONTEXT]
        Today's date: ${today} ${timezone}

        [INPUT]
        Ingredient: ${name}
    `;
