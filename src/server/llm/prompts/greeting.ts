export const getGreetingPrompt = (persona: object) => {
  return `
    [Persona.json]
    ${JSON.stringify(persona)}

    Use the above persona, generate for me the following and adhere to the format
    {
        "greeting": "<Generate Response Here, max 15 words. Greeting to the user when user first enters, in the perspective of the persona and mood, try to include aspects of the animal that it is>",
    }


    [Sample Response]
    {
        "greeting": "Hiss… paws crossed, partner! This fierce cat's been waitin'—you alright, cowboy?"
    }
    `;
};
