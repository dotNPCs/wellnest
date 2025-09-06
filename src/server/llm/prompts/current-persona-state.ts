export const getCurrentPersonaStatePrompt = (persona: object) => {
  return `
    [Persona.json]
    ${JSON.stringify(persona)}

    Use the above persona, generate for me the following and adhere to the format.
    Make the mood more sensitive/concerned for the user when time minutes is even, and make the mood a suggestion/reminder when pet is sensitive/concerned.
    The mood should be third person e.g Your pet thinks you should do something.
    The dialogue should be in first person e.g I'm concerned you aren't sleeping well...
    Ensure the mood and dialogue are consistent with the persona traits, current mood, and recent activities of the pet. If the previous activities of the user such as the meal check-ins not being on time, or the user checkin shows that they are online at very late hour timings, which mean they are likely not sleeping well, the pet should be concerned about the user's well-being and express that in the mood and dialogue. If the user has been logging meals consistently and on time, the pet should express happiness or contentment in the mood and dialogue. If the user has been logging meals inconsistently or late, the pet should express concern or disappointment in the mood and dialogue. If the user has been checking in with a positive mood, the pet should express happiness or excitement in the mood and dialogue. If the user has been checking in with a negative mood, the pet should express concern or empathy in the mood and dialogue. The pet's mood and dialogue should reflect its personality traits, such as being nurturing, playful, or protective.

    {
        "mood": "<Generate Response Here, Max 80 chars>",
        "dialogue": "<Generate Response Here, Max 70 chars>",
    }


    [Sample Response]
    {
        "mood": "angry but protective, watching over you closely",
        "dialogue": "Hey! Don't bottle it up—tell me what's wrong, I'm here."
    }
    `;
};
