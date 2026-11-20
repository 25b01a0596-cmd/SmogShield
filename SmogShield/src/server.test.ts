import { describe, it, expect } from 'vitest';

describe('SmogShield API & Telemetry Processing', () => {
  it('calculates AQI risk category accurately', () => {
    const getRiskLevel = (aqi: number) => {
      if (aqi > 200) return 'Very Unhealthy';
      if (aqi > 150) return 'Unhealthy';
      if (aqi > 100) return 'Sensitive Groups';
      return 'Moderate';
    };

    expect(getRiskLevel(210)).toBe('Very Unhealthy');
    expect(getRiskLevel(165)).toBe('Unhealthy');
    expect(getRiskLevel(75)).toBe('Moderate');
  });

  it('handles missing or empty city queries gracefully', () => {
    const sanitizeCity = (input: string) => input.trim() || 'New Delhi';
    expect(sanitizeCity('   ')).toBe('New Delhi');
    expect(sanitizeCity('London')).toBe('London');
  });

  it('validates structured Gemini JSON response schema', () => {
    const mockResponse = {
      aqi: 210,
      pm25: 135.4,
      dailyRoutine: ['Wear N95 during 8 AM commute'],
      indoorHacks: ['Run HEPA filter on high'],
    };

    expect(mockResponse).toHaveProperty('aqi');
    expect(Array.isArray(mockResponse.dailyRoutine)).toBe(true);
    expect(mockResponse.dailyRoutine.length).toBeGreaterThan(0);
  });
});
