
import React, { useState } from 'react';
import { Calculator, Home, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const EstimateCalculator = () => {
  const [formData, setFormData] = useState({
    projectType: '',
    squareFootage: '',
    bathrooms: '',
    timeline: '',
    budget: '',
    description: '',
    name: '',
    email: '',
    phone: ''
  });

  const [estimate, setEstimate] = useState<number | null>(null);
  const { toast } = useToast();

  const projectTypes = {
    'kitchen-remodel': { base: 25000, multiplier: 150 },
    'bathroom-remodel': { base: 15000, multiplier: 200 },
    'home-addition': { base: 40000, multiplier: 250 },
    'basement-finish': { base: 20000, multiplier: 100 },
    'deck-patio': { base: 8000, multiplier: 50 },
    'roofing': { base: 12000, multiplier: 15 },
    'flooring': { base: 5000, multiplier: 8 },
    'painting': { base: 3000, multiplier: 3 }
  };

  const calculateEstimate = () => {
    if (!formData.projectType || !formData.squareFootage) {
      toast({
        title: "Missing Information",
        description: "Please select a project type and enter square footage.",
        variant: "destructive"
      });
      return;
    }

    const project = projectTypes[formData.projectType as keyof typeof projectTypes];
    const sqft = parseInt(formData.squareFootage);
    const bathrooms = parseInt(formData.bathrooms) || 1;
    
    let baseEstimate = project.base + (sqft * project.multiplier);
    
    // Adjust for bathrooms if it's a bathroom project
    if (formData.projectType === 'bathroom-remodel') {
      baseEstimate *= bathrooms;
    }

    // Timeline adjustments
    if (formData.timeline === 'rush') {
      baseEstimate *= 1.2;
    } else if (formData.timeline === 'flexible') {
      baseEstimate *= 0.9;
    }

    setEstimate(Math.round(baseEstimate));
  };

  const submitEstimate = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Contact Information Required",
        description: "Please fill in your contact information to receive your detailed estimate.",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would submit to the CRM
    console.log('Estimate submitted:', { ...formData, estimate });
    
    toast({
      title: "Estimate Submitted!",
      description: "We'll contact you within 24 hours with your detailed estimate and to schedule a consultation."
    });

    // Reset form
    setFormData({
      projectType: '',
      squareFootage: '',
      bathrooms: '',
      timeline: '',
      budget: '',
      description: '',
      name: '',
      email: '',
      phone: ''
    });
    setEstimate(null);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="projectType">Project Type *</Label>
            <Select value={formData.projectType} onValueChange={(value) => setFormData(prev => ({ ...prev, projectType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kitchen-remodel">Kitchen Remodel</SelectItem>
                <SelectItem value="bathroom-remodel">Bathroom Remodel</SelectItem>
                <SelectItem value="home-addition">Home Addition</SelectItem>
                <SelectItem value="basement-finish">Basement Finishing</SelectItem>
                <SelectItem value="deck-patio">Deck/Patio</SelectItem>
                <SelectItem value="roofing">Roofing</SelectItem>
                <SelectItem value="flooring">Flooring</SelectItem>
                <SelectItem value="painting">Interior/Exterior Painting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="squareFootage">Square Footage *</Label>
            <Input
              id="squareFootage"
              type="number"
              placeholder="Enter square footage"
              value={formData.squareFootage}
              onChange={(e) => setFormData(prev => ({ ...prev, squareFootage: e.target.value }))}
            />
          </div>

          {formData.projectType === 'bathroom-remodel' && (
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Number of Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                placeholder="1"
                value={formData.bathrooms}
                onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="timeline">Project Timeline</Label>
            <Select value={formData.timeline} onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rush">ASAP (Rush - 20% premium)</SelectItem>
                <SelectItem value="normal">Normal (4-8 weeks)</SelectItem>
                <SelectItem value="flexible">Flexible (10% discount)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget Range</Label>
            <Select value={formData.budget} onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-10k">Under $10,000</SelectItem>
                <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                <SelectItem value="over-100k">Over $100,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Project Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your project goals, specific requirements, or any special considerations..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>

        <Button 
          onClick={calculateEstimate}
          className="w-full bg-secondary text-primary hover:bg-secondary/90 font-semibold py-3"
        >
          <Calculator className="h-4 w-4 mr-2" />
          Calculate Estimate
        </Button>

        {estimate && (
          <div className="border-t pt-6">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-primary mb-2">
                ${estimate.toLocaleString()}
              </div>
              <p className="text-gray-600">Preliminary Estimate Range: ${Math.round(estimate * 0.8).toLocaleString()} - ${Math.round(estimate * 1.2).toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">
                *This is a preliminary estimate. Final pricing depends on materials, finishes, and site conditions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(123) 456-7890"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              onClick={submitEstimate}
              className="w-full bg-primary text-white hover:bg-primary/90 font-semibold py-3"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Get Detailed Estimate & Schedule Consultation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateCalculator;
