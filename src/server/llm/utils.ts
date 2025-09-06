import type { GenerateContentResponse } from "@google/genai";

export const tryParseToObject = (response: GenerateContentResponse) => {
  let response_json: object | null = null;
  try {
    if (typeof response.text === "string") {
      response_json = JSON.parse(response.text) as object;
    } else throw new Error("Response text is not a string");
  } catch (e) {
    console.log("Error parsing JSON:", e);
    throw new Error("Failed to parse response to JSON");
  }

  return response_json;
};
