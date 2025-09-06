export const getCurrentPersonaEmojiPrompt = (persona: object) => {
  return `
    [Persona.json]
    ${JSON.stringify(persona)}

    Use the above persona, generate for me the following and adhere to the format
    {
        "emoji": <Choose one from the following text that most accurately matches the mood of the persona based on it's sentiment analysis:   
        ANXIOUS, STRESSED, NEUTRAL, CONTENT, HAPPY,  EXCITED, GRATEFUL, CALM, ENERGETIC, TIRED>
    }


    [Sample Response]
    {
        "emoji": "ENERGETIC"
    }
    `;
};
