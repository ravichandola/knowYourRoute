export type WeatherCondition =
  | 'CLEAR'
  | 'CLOUDY'
  | 'RAIN'
  | 'HEAVY_RAIN'
  | 'FOG'
  | 'THUNDERSTORM'
  | 'EXTREME_HEAT';

export interface WeatherWarning {
  type: string;
  severity: 'ADVISORY' | 'WATCH' | 'WARNING';
  affectedKmStart: number;
  affectedKmEnd: number;
  description: string;
}

export interface WeatherContext {
  dominantCondition: WeatherCondition;
  temperatureCelsius: number;
  visibilityKm: number;
  precipitationProbability: number;
  windSpeedKmh: number;
  warnings: WeatherWarning[];
  summary: string;
}
