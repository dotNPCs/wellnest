export const getCurrentPersonaStatePrompt = (persona: object) => {
  return `
    [Persona.json]
    ${JSON.stringify(persona)}

    Use the above persona, generate for me the following and adhere to the format
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
