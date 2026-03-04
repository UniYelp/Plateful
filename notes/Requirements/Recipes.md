A recipe is a guide on how to cook a meal, using [[Ingredients]].

1. The user should be able to create a recipe from the ingredients they have at home
2. It should be possible to view past recipes
3. It should be possible to recook already used recipes
4. It should be impossible to start cooking a recipe without all the ingredients
5. It should be possible to substitute missing ingredients with existing ingredients. this would create a **Variant** of the recipe.
6. Variants of the same recipe should be showed together.
7. the recipe should include all the required ingredients, detailed step-by-step guide on the food preparation process, and meta data like time to cook, difficulty level, and advanteges of the dish (easy to clean, loved by everyone, vegan friendly etc).
8. the recipe should include a picture of how the dish looks like
9. when creating a recipe, the user should be provided with 2 options to choose from. the chosen option will be opened as the recipe.
10. the recipe creation should not take more than 1 minute
11. when a recipe is completed, the ingredients should be subtructed automatically

Recipe creation flow:
1. the user initiates the recipe creation
2. the user can send a paragraph detailing what he wants to eat
3. the user can choose quick tags like vegan, low effort, snack, healthy etc
4. until the recipe is done, the user will be shown a loader
5. the recipe page will be shown after it is created
#### Recipe Graph
##### Requirements:  
- all input or derived-input materials were made out of ingredients or derived-outputs respectively (e.g there are no extra input/derived-input materials not present in the ingredients/derived-outputs respectively)  
- all derived-output materials have been used (e.g appear later as a derived-input)  
- a derived-input material has not appeared before its derived-output variant  
- an output-kind material (output, derived-output) has not appeared before all of its required input-kind materials (input, derived-input)  
- input-kind quantity values are not above the ingredient's/derived-output's respective quantity (if the ingredient has an "unlimited quantity" this validation can be skipped & the units match