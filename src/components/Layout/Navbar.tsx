import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logoImage from '@/assets/logo.png';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = React.useState<string>('hero'); // Track the active section

  React.useEffect(() => {
    // Create the IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        // Loop through each entry (section)
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Set the active section when the section is in view
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.5, // Consider the section active when 50% is visible
      }
    );

    // Target all sections with ids
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      // Clean up observer on component unmount
      observer.disconnect();
    };
  }, []);

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and App Name */}
          <a href="/" className="flex items-center space-x-3">
            <img 
              src={logoImage} 
              alt="Church Logo" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-foreground">ADEPR Kamuhoza</span>
          </a>

          {/* Menu and Login Button */}
          <div className="flex items-center gap-4">
            {/* Navigation Links */}
            <div className="hidden md:flex space-x-6">
              <a 
                href="#hero" 
                className={`text-sm font-semibold transition ${activeSection === 'hero' ? 'text-primary border-b-2 border-primary' : 'text-foreground'}`}
              >
                Home
              </a>
              <a 
                href="#features" 
                className={`text-sm font-semibold transition ${activeSection === 'features' ? 'text-primary border-b-2 border-primary' : 'text-foreground'}`}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className={`text-sm font-semibold transition ${activeSection === 'how-it-works' ? 'text-primary border-b-2 border-primary' : 'text-foreground'}`}
              >
                How It Works
              </a>
              <a 
                href="#contact" 
                className={`text-sm font-semibold transition ${activeSection === 'contact' ? 'text-primary border-b-2 border-primary' : 'text-foreground'}`}
              >
                Contact
              </a>
            </div>

            {/* Login Button */}
            <Button 
              variant="default" 
              size="lg"
              onClick={() => navigate('/login')}
              className="group bg-primary hover:bg-primary/90"
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
