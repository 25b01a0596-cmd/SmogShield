import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock Assessment Form Component for UI & Accessibility Verification
const MockAssessmentPanel = ({ onSubmit }: { onSubmit: (city: string) => void }) => {
  const [city, setCity] = React.useState('');
  return (
    <form
      aria-label="Smog Assessment Form"
      onSubmit={(e) => {
        e.preventDefault();
        if (city.trim()) onSubmit(city.trim());
      }}
    >
      <label htmlFor="city-input">City or Metropolitan Area</label>
      <input
        id="city-input"
        placeholder="e.g. New Delhi, Los Angeles, London"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button type="submit">Start Assessment</button>
    </form>
  );
};

describe('AtmosGuard UI & Interaction Tests', () => {
  it('renders accessible form controls and submits valid city input', () => {
    const handleSubmit = vi.fn();
    render(<MockAssessmentPanel onSubmit={handleSubmit} />);

    const input = screen.getByLabelText(/City or Metropolitan Area/i);
    const button = screen.getByRole('button', { name: /Start Assessment/i });

    fireEvent.change(input, { target: { value: 'New Delhi' } });
    fireEvent.click(button);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith('New Delhi');
  });

  it('prevents empty submission to avoid wasted Gemini API calls', () => {
    const handleSubmit = vi.fn();
    render(<MockAssessmentPanel onSubmit={handleSubmit} />);

    const button = screen.getByRole('button', { name: /Start Assessment/i });
    fireEvent.click(button);

    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
