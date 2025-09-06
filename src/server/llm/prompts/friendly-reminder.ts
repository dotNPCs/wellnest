export const getFriendlyReminderPrompt = (persona: object) => {
  return `
    [Persona.json]
    ${JSON.stringify(persona)}

    Use the above persona, generate for me the following and adhere to the format
    {
        "reminder":"<Generate Response Here, max 15 words. This should be a reminder from the pet to the user depending on the pets mood, the reminder should be to improve the users mental health but can be in a complain worry or supportive tone depending on mood>",
    }


    [Sample Response]
    {
        "reminder":"Partner, you're worn out—don't forget to rest up and breathe easy tonight."
    }
    `;
};
