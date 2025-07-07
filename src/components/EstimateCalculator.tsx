import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCalculatorSubmissions } from '@/hooks/useCalculatorSubmissions';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface FormData {
  projectType: string;
  squareFootage: string;
  bathrooms: string;
  timeline: string;
  budget: string;
  description: string;
  name: string;
  email: string;
  phone: string;
}

const EstimateCalculator = () => {
  const { createSubmission } = useCalculatorSubmissions();
  const [estimate, setEstimate] = useState<number | null>(null);
  const { toast } = useToast();
  const form = useForm<FormData>({
    defaultValues: {
      projectType: '',
      squareFootage: '',
      bathrooms: '',
      timeline: '',
      budget: '',
      description: '',
      name: '',
      email: '',
      phone: ''
    }
  });

  const projectTypes = {
    'kitchen-remodel': { base: 25000, multiplier: 150 },
    'bathroom-remodel': { base: 15000, multiplier: 200 },
    'home-addition': { base: 40000, multiplier: 250 },
    'basement-finish': { base: 20000, multiplier: 100 },
    'deck-patio': { base: 8000, multiplier: 50 },
    'services': { base: 12000, multiplier: 15 },
    'flooring': { base: 5000, multiplier: 8 },
    'painting': { base: 3000, multiplier: 3 }
  };

  const calculateEstimate = () => {
    const values = form.getValues();
    if (!values.projectType || !values.squareFootage) {
      toast({
        title: "Missing Information",
        description: "Please select a project type and enter square footage.",
        variant: "destructive"
      });
      return;
    }

    const project = projectTypes[values.projectType as keyof typeof projectTypes];
    const sqft = parseInt(values.squareFootage);
    const bathrooms = parseInt(values.bathrooms) || 1;
    
    let baseEstimate = project.base + (sqft * project.multiplier);
    
    if (values.projectType === 'bathroom-remodel') {
      baseEstimate *= bathrooms;
    }

    if (values.timeline === 'rush') {
      baseEstimate *= 1.2;
    } else if (values.timeline === 'flexible') {
      baseEstimate *= 0.9;
    }

    setEstimate(Math.round(baseEstimate));
  };

  const onSubmit = async (data: FormData) => {
    if (!data.name || !data.email || !data.phone) {
      toast({
        title: "Contact Information Required",
        description: "Please fill in your contact information to receive your detailed estimate.",
        variant: "destructive"
      });
      return;
    }

    if (!estimate) {
      toast({
        title: "Calculate Estimate First",
        description: "Please calculate an estimate before submitting.",
        variant: "destructive"
      });
      return;
    }

    const result = await createSubmission({
      name: data.name,
      email: data.email,
      phone: data.phone,
      project_type: data.projectType,
      square_footage: parseInt(data.squareFootage) || undefined,
      bathrooms: parseInt(data.bathrooms) || undefined,
      timeline: data.timeline || undefined,
      budget: data.budget || undefined,
      description: data.description || undefined,
      estimate_amount: estimate
    });

    if (result) {
      toast({
        title: "Estimate Submitted!",
        description: "We'll contact you within 24 hours with your detailed estimate and to schedule a consultation."
      });

      form.reset();
      setEstimate(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Calculator className="h-6 w-6" />
          Instant Project Estimate
        </CardTitle>
        <p className="text-primary-foreground/90">Get a preliminary estimate in seconds</p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="projectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kitchen-remodel">Kitchen Remodel</SelectItem>
                        <SelectItem value="bathroom-remodel">Bathroom Remodel</SelectItem>
                        <SelectItem value="home-addition">Home Addition</SelectItem>
                        <SelectItem value="basement-finish">Basement Finishing</SelectItem>
                        <SelectItem value="deck-patio">Deck/Patio</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="flooring">Flooring</SelectItem>
                        <SelectItem value="painting">Interior/Exterior Painting</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="squareFootage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Square Footage *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter square footage"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('projectType') === 'bathroom-remodel' && (
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Bathrooms</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Timeline</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rush">ASAP (Rush - 20% premium)</SelectItem>
                        <SelectItem value="normal">Normal (4-8 weeks)</SelectItem>
                        <SelectItem value="flexible">Flexible (10% discount)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Range</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="under-25k">Under $25,000</SelectItem>
                        <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                        <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                        <SelectItem value="over-100k">Over $100,000</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us more about your project..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Your phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                type="button"
                onClick={calculateEstimate}
                className="w-full sm:w-auto"
                variant="secondary"
              >
                Calculate Estimate
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={!estimate}
              >
                Submit for Detailed Quote
              </Button>
            </div>

            {estimate && (
              <div className="mt-6 p-4 bg-primary/10 rounded-lg text-center">
                <h3 className="text-lg font-semibold mb-2">Preliminary Estimate</h3>
                <p className="text-3xl font-bold text-primary">
                  ${estimate.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This is a preliminary estimate. Submit for a detailed quote and consultation.
                </p>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EstimateCalculator;
