export const getPostMeditationMessagePrompt = (persona: object, meditation_duration: number, time_started: string) => {
    return `
    [Persona.json]
    ${JSON.stringify(persona)}

    [User Input]
    Meditation duration of ${meditation_duration}s, started at ${time_started}.

    Use the above persona and other details, generate for me the following and adhere to the format
    {
        "meditation_response": <Generate Response here, max 15 words. This should be a message to the user from the perspective of the pet that it feels better mentally. The message will scale according to meditation duration, time started, amongst other factors. Don't be too specific with or include numbers in the response>
    }

    [Sample Response]
    {
        "meditation_response": "Phew… I'm calmer now, partner. That little pause helped clear my head and soften my claws."
    }
    `;
}