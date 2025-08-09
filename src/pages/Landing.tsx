import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Layout/Navbar';
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  FileText, 
  Shield, 
  Clock,
  Award,
  UserCheck,
  Heart,
  Church,
  BookOpen,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import heroImage from '@/assets/hero-image.png';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section id="hero" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Church className="h-6 w-6" />
                  <span className="text-sm font-semibold uppercase tracking-wider">ADEPR Kamuhoza</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Digital Church
                  <span className="block text-primary">Management System</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Empowering our church community with modern tools for membership management, certificate processing, and spiritual growth tracking.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="group bg-primary hover:bg-primary/90"
                >
                  Access Your Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => scrollToSection('features')}
                >
                  Learn More
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">System Access</div>
                </div>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={heroImage}
                  alt="ADEPR Kamuhoza Church Community"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-card p-4 rounded-lg shadow-lg border border-border">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Certificate Ready</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-card p-4 rounded-lg shadow-lg border border-border">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium">Growing Together</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comprehensive Church Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage church membership, track spiritual growth, and maintain records efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Member Management */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Member Management</CardTitle>
                <CardDescription>
                  Comprehensive member profiles with contact information, spiritual journey tracking, and family connections.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Certificate Processing */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Digital Certificates</CardTitle>
                <CardDescription>
                  Request and manage baptism, confirmation, marriage, and membership certificates with secure approval workflow.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Secure Access */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Role-based access control ensures that sensitive information is protected and only accessible to authorized personnel.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Quick Processing */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Fast Processing</CardTitle>
                <CardDescription>
                  Streamlined approval workflow reduces certificate processing time from weeks to days.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Sacramental Records */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Sacramental Records</CardTitle>
                <CardDescription>
                  Complete tracking of baptisms, confirmations, marriages, and other important spiritual milestones.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Leadership Tools */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Leadership Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive tools for pastors and zone leaders to manage their congregations effectively.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple Process, Powerful Results
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting your certificates and managing your church records has never been easier.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Sign In to Your Account</h3>
              <p className="text-muted-foreground">
                Access your personal dashboard with your church member credentials.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Request Services</h3>
              <p className="text-muted-foreground">
                Submit requests for certificates, update your information, or access church services.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Receive & Download</h3>
              <p className="text-muted-foreground">
                Get notified when your request is approved and download your official documents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Need Help or Have Questions?
            </h2>
            <p className="text-lg text-muted-foreground">
              Our church office is here to assist you with any questions about the system or your membership.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-muted-foreground">+250 XXX XXX XXX</p>
            </div>

            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-muted-foreground">info@adeprkamuhoza.rw</p>
            </div>

            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Visit Us</h3>
              <p className="text-muted-foreground">Kamuhoza, Rwanda</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Join Our Digital Church Community
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Experience modern church management that strengthens our community and simplifies your spiritual journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              className="bg-primary hover:bg-primary/90"
            >
              Access Your Account
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => scrollToSection('hero')}
            >
              Back to Top
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 ADEPR Kamuhoza. All rights reserved. Built with love for our church community.
          </p>
        </div>
      </footer>
    </div>
  );
};