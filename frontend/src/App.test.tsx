import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  it('renders the hello message', () => {
    render(<App />)

    const heading = screen.getByText(/Hello Blogspace/i)

    expect(heading).toBeInTheDocument()
  })
})
