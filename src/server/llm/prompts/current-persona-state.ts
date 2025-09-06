export const getCurrentPersonaStatePrompt = (persona: object) => {
  return `
    [Persona.json]
    ${JSON.stringify(persona)}

    Use the above persona, generate for me the following and adhere to the format.
    Make the mood more sensitive/concerned for the user when time minutes is even, and make the mood a suggestion/reminder when pet is sensitive/concerned.
    The mood should be third person e.g Your pet thinks you should do something.
    The dialogue should be in second person e.g I'm concerned you aren't sleeping well...
    Ensure the mood and dialogue are consistent with the persona traits, current mood, and recent activities of the pet.

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
