import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageSquare,
  Users,
  Headphones
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const ContactPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <MessageSquare className="h-4 w-4 mr-2" />
            Get in Touch
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Contact Our Team
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about Elevatr? Need help optimizing your resume? 
            Our expert team is here to assist you on your career journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="card-elevated border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  Email Us
                </CardTitle>
                <CardDescription>
                  Get in touch via email for detailed inquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium">support@elevatr.ai</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We typically respond within 2-4 hours
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-primary" />
                  Phone Support
                </CardTitle>
                <CardDescription>
                  Speak directly with our career experts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium">+1 (555) 123-4567</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Monday - Friday, 9 AM - 6 PM PST
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Office Location
                </CardTitle>
                <CardDescription>
                  Visit us at our headquarters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium">123 Innovation Drive</p>
                <p className="text-sm text-muted-foreground">
                  San Francisco, CA 94105
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-muted-foreground">Closed</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="card-elevated border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help you?"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      required
                      className="mt-1 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="card-elevated border-0 mt-16">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Frequently Asked Questions</CardTitle>
            <CardDescription>
              Quick answers to common questions about Elevatr
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">How accurate is the AI analysis?</h4>
                  <p className="text-sm text-muted-foreground">
                    Our AI has been trained on millions of successful resumes and maintains 
                    a 95% accuracy rate in skill matching and recommendations.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What file formats do you support?</h4>
                  <p className="text-sm text-muted-foreground">
                    Currently, we support PDF files up to 10MB. We're working on adding 
                    support for Word documents and other formats.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Is my data secure?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! We use enterprise-grade encryption and never store your personal 
                    information. All uploads are processed securely and deleted after analysis.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">How long does analysis take?</h4>
                  <p className="text-sm text-muted-foreground">
                    Most resume analyses are completed within 30-60 seconds, depending on 
                    the complexity of your resume and job description.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Can I analyze multiple resumes?</h4>
                  <p className="text-sm text-muted-foreground">
                    Free users can analyze up to 3 resumes per month. Pro users get unlimited 
                    analyses plus additional features like progress tracking.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Do you offer career coaching?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! Our Pro plan includes one-on-one sessions with certified career 
                    coaches who can help you implement our AI recommendations.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Team */}
        <div className="text-center mt-16">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-elevated border-0">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Sales Team</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Questions about pricing and features
                </p>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  sales@elevatr.ai
                </Button>
              </CardContent>
            </Card>

            <Card className="card-elevated border-0">
              <CardContent className="p-6 text-center">
                <Headphones className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Technical Support</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Help with using the platform
                </p>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  support@elevatr.ai
                </Button>
              </CardContent>
            </Card>

            <Card className="card-elevated border-0">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Career Experts</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Professional career advice
                </p>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  experts@elevatr.ai
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;