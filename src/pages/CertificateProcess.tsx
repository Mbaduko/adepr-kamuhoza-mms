import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  FileText, 
  UserCheck, 
  Award, 
  Users, 
  Heart, 
  Shield,
  Droplets,
  Cross,
  Church,
  User
} from 'lucide-react';

export const CertificateProcess: React.FC = () => {
  const navigate = useNavigate();

  const processSteps = [
    {
      step: 1,
      title: "Submit Request",
      description: "Member submits certificate request with required purpose and documentation",
      icon: FileText,
      status: "completed",
      color: "bg-success text-success-foreground"
    },
    {
      step: 2,
      title: "Zone Leader Review",
      description: "Zone Leader verifies member information and approves initial request",
      icon: UserCheck,
      status: "active",
      color: "bg-primary text-primary-foreground"
    },
    {
      step: 3,
      title: "Pastor Approval",
      description: "Pastor reviews and provides secondary approval for certificate issuance",
      icon: Shield,
      status: "pending",
      color: "bg-muted text-muted-foreground"
    },
    {
      step: 4,
          title: "Parish Pastor Approval",
    description: "Parish Pastor provides approval and authorizes certificate generation",
      icon: Award,
      status: "pending",
      color: "bg-muted text-muted-foreground"
    }
  ];

  const certificateTypes = [
    {
      type: "Baptism Certificate",
      description: "Official record of baptism sacrament",
      icon: Droplets,
      requirements: ["Valid baptism record", "Member identification", "Purpose statement"],
      color: "bg-blue-50 border-blue-200"
    },
    {
      type: "Recommendation Certificate",
      description: "Official record of recommendation sacrament",
      icon: Cross,
      requirements: ["Valid recommendation record", "Member identification", "Purpose statement"],
      color: "bg-purple-50 border-purple-200"
    },
    {
      type: "Marriage Certificate",
      description: "Official record of church marriage",
      icon: Heart,
      requirements: ["Valid marriage record", "Both spouses identification", "Purpose statement"],
      color: "bg-pink-50 border-pink-200"
    },
    {
      type: "Membership Certificate",
      description: "Proof of active church membership",
      icon: Users,
      requirements: ["Active membership status", "Member identification", "Purpose statement"],
      color: "bg-green-50 border-green-200"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case "active":
        return <Badge className="bg-primary text-primary-foreground">In Progress</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Certificate Process
              </h1>
              <p className="text-muted-foreground text-lg mt-2">Understanding our certificate approval workflow</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Process Flow */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Approval Process</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Our three-tier approval system ensures accuracy and maintains proper church governance.
              </p>
            </div>

            <div className="space-y-8">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="relative">
                    <div className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg transition-all duration-300 ${
                          step.status === 'completed' 
                            ? 'bg-success border-success text-success-foreground' 
                            : step.status === 'active'
                            ? 'bg-primary border-primary text-primary-foreground animate-pulse'
                            : 'bg-muted border-border text-muted-foreground'
                        }`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        {index < processSteps.length - 1 && (
                          <div className={`w-1 h-16 mt-3 rounded-full transition-all duration-300 ${
                            step.status === 'completed' ? 'bg-success' : 'bg-border'
                          }`}></div>
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-foreground">
                            Step {step.step}: {step.title}
                          </h3>
                          {getStatusBadge(step.status)}
                        </div>
                        <p className="text-muted-foreground text-base leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certificate Types */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Available Certificates</h2>
              <p className="text-muted-foreground text-lg mb-8">
                We offer various types of church certificates to meet your needs.
              </p>
            </div>

            <div className="grid gap-6">
              {certificateTypes.map((cert, index) => {
                const Icon = cert.icon;
                return (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-foreground">{cert.type}</CardTitle>
                          <CardDescription className="text-base">{cert.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          Requirements:
                        </h4>
                        <ul className="space-y-2">
                          {cert.requirements.map((req, reqIndex) => (
                            <li key={reqIndex} className="flex items-center gap-3 text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <Card className="max-w-3xl mx-auto border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader className="pb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Ready to Request a Certificate?</CardTitle>
              <CardDescription className="text-lg">
                Login to your account to submit a certificate request and track its progress in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center pb-8">
              <Button size="lg" onClick={() => navigate('/login')} className="bg-primary hover:bg-primary/90">
                Login to Request
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};