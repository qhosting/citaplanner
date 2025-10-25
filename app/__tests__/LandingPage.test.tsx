
import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/landing/hero-section';

describe('HeroSection', () => {
  it('renders a heading', () => {
    render(<HeroSection />);

    const heading = screen.getByRole('heading', {
      name: /Gestiona tu negocio de belleza y bienestar con facilidad/i,
    });

    expect(heading).toBeInTheDocument();
  });
});
