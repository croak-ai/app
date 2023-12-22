// countryInformation.js: Contain the function we'll run for our assistant.

type countryInput = { country: string };

export async function getCountryInformation(params: countryInput) {
  const country = params.country;

  try {
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(
      country,
    )}`;
    const response = await fetch(url);
    const jsonResponse = await response.json();
    return JSON.stringify(jsonResponse);
  } catch (error) {
    console.error(error);
    return null;
  }
}
