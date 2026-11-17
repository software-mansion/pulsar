export const DEFAULT_LOCATION = {
  city: 'Warsaw',
  latitude: 52.23,
  longitude: 21.01,
};

export type CurrentWeather = {
  city: string;
  temperature: number;
  weatherCode: number;
};

export const buildForecastUrl = (
  latitude: number,
  longitude: number,
): string => {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,weather_code',
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
};

export const fetchCurrentWeather = async (
  location = DEFAULT_LOCATION,
): Promise<CurrentWeather> => {
  const response = await fetch(
    buildForecastUrl(location.latitude, location.longitude),
  );
  if (!response.ok) {
    throw new Error(`Weather request failed with status ${response.status}`);
  }
  const body = await response.json();
  const temperature = body?.current?.temperature_2m;
  const weatherCode = body?.current?.weather_code;
  if (typeof temperature !== 'number' || typeof weatherCode !== 'number') {
    throw new Error('Weather response is missing current conditions');
  }
  return { city: location.city, temperature, weatherCode };
};
