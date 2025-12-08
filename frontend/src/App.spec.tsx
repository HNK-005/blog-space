import { render, screen } from '@testing-library/react';

import App from './App';

describe('App Component', () => {
  it('renders the hello message', () => {
    render(<App />);

    const heading = screen.getByText(/Hello Blogspace/i);

    expect(heading).toBeInTheDocument();
  });

  it('applies the correct CSS classes', () => {
    render(<App />);

    const heading = screen.getByText(/Hello Blogspace/i);

    expect(heading).toHaveClass('text-2xl');
    expect(heading).toHaveClass('text-red-500');
  });
});
