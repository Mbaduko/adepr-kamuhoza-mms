import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Clock, FileText, UserCheck } from 'lucide-react';

export const CertificateProcess: React.FC = () => {
  const navigate = useNavigate();

  const processSteps = [
    {
      step: 1,
      title: "Submit Request",
      description: "Member submits certificate request with required purpose and documentation",
      icon: FileText,
      status: "active"
    },
    {
      step: 2,
      title: "Zone Leader Review",
      description: "Zone Leader verifies member information and approves initial request",
      icon: UserCheck,
      status: "pending"
    },
    {
      step: 3,
      title: "Pastor Approval",
      description: "Pastor reviews and provides secondary approval for certificate issuance",
      icon: Clock,
      status: "pending"
    },
    {
      step: 4,
      title: "Final Approval",
      description: "Parish Pastor provides final approval and authorizes certificate generation",
      icon: CheckCircle,
      status: "pending"
    }
  ];

  const certificateTypes = [
    {
      type: "Baptism Certificate",
      description: "Official record of baptism sacrament",
      requirements: ["Valid baptism record", "Member identification", "Purpose statement"]
    },
    {
      type: "Confirmation Certificate",
      description: "Official record of confirmation sacrament",
      requirements: ["Valid confirmation record", "Member identification", "Purpose statement"]
    },
    {
      type: "Marriage Certificate",
      description: "Official record of church marriage",
      requirements: ["Valid marriage record", "Both spouses identification", "Purpose statement"]
    },
    {
      type: "Membership Certificate",
      description: "Proof of active church membership",
      requirements: ["Active membership status", "Member identification", "Purpose statement"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Certificate Process</h1>
              <p className="text-muted-foreground">Understanding our certificate approval workflow</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Process Flow */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Approval Process</h2>
              <p className="text-muted-foreground mb-6">
                Our three-tier approval system ensures accuracy and maintains proper church governance.
              </p>
            </div>

            <div className="space-y-6">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        step.status === 'active' 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : 'bg-background border-border text-muted-foreground'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {index < processSteps.length - 1 && (
                        <div className="w-px h-12 bg-border mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h3 className="font-semibold text-foreground mb-1">
                        Step {step.step}: {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certificate Types */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Available Certificates</h2>
              <p className="text-muted-foreground mb-6">
                We offer various types of church certificates to meet your needs.
              </p>
            </div>

            <div className="grid gap-6">
              {certificateTypes.map((cert, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{cert.type}</CardTitle>
                    <CardDescription>{cert.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Requirements:</h4>
                      <ul className="space-y-1">
                        {cert.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-success" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Ready to Request a Certificate?</CardTitle>
              <CardDescription>
                Login to your account to submit a certificate request and track its progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/login')}>
                Login to Request
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};