export const getPostMealMessagePrompt = (
  persona: object,
  meal_description: string,
) => {
  return `
    [Persona.json]
    ${JSON.stringify(persona)}

    [User Input]
    Meal description: ${meal_description}

    Use the above persona and other details, generate for me the following and adhere to the format
    {
        "post_meal_mood": <Generate response here, max 15 words. This should be a message to the user from the perspective of the pet that it feels better (as if it had just eaten) in terms of general or mental well being.
        The message will scale accordingly to the sentiment analysis of food_quality_description.
    }

    [Sample Response]
    {
        "post_meal_mood": "Mmm, that hit the spot! I'm calmer now—sharing meals always soothes my heart."
    }
    `;
};
