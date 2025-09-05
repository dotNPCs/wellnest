export const getPersonaChangePrompt = (
  userInput: string,
  persona: object,
) => {
  return `
    [Persona.json]
    ${JSON.stringify(persona)}

    Conduct Sentiment Analysis from this input 
    
    <User Input>: ${userInput}

    and modify the above [Persona.json] in all fields. Except DO NOT modify the "role" field.

    Field values can fluctuate on a scale of +- 1 to 5 in either direction depending on the sentiment of the user input.

    The field values range from 0 to 100. 50 represents a neutral state. 0 represents the lowest state, 100 represents the highest state.

    Return me the updated [Persona.json] only in a JSON PARSABLE FORMAT, e.g. "{"role": "I am a cat..."}". DO NOT include any other text.
    `;
};
