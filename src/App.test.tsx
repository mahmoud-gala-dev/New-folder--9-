import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Check if the main title or some key element is present
    // Since it's a bilingual app, we can check for a common keyword or just that it renders
    expect(document.body).toBeDefined();
  });
});
