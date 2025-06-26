import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders hello world message', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', { name: /hello world/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders welcome message', () => {
    render(<Home />)
    
    const welcomeText = screen.getByText(/welcome to culturalite frontend/i)
    expect(welcomeText).toBeInTheDocument()
  })

  it('renders technology stack information', () => {
    render(<Home />)
    
    const techStack = screen.getByText(/next\.js 14.*typescript.*tailwind css/i)
    expect(techStack).toBeInTheDocument()
  })

  it('renders ready for development message', () => {
    render(<Home />)
    
    const readyMessage = screen.getByText(/ready for development/i)
    expect(readyMessage).toBeInTheDocument()
  })
})
