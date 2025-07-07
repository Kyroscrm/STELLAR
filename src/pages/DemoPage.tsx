
import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

const DemoPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary mb-6">
            See CAPTION <span className="text-secondary">In Action</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch a comprehensive demonstration of CAPTION's features and how it can transform your business.
          </p>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="aspect-video w-full max-w-4xl mx-auto rounded-lg shadow-xl overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/your-demo-video-id" // Replace with actual demo video ID
              title="CAPTION CRM Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="text-center mt-8">
            <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 font-semibold">
              <PlayCircle className="h-5 w-5 mr-2" />
              Watch Full Demo on YouTube
            </Button>
          </div>
        </div>
      </section>

      {/* Key Takeaways */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-primary mb-4">
              Key Takeaways from the Demo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understand the core benefits and functionalities highlighted in our demonstration.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Centralized Data",
                description: "All your customer and project data in one secure location."
              },
              {
                title: "Automated Workflows",
                description: "Save time and reduce errors with intelligent automation."
              },
              {
                title: "Actionable Insights",
                description: "Make informed decisions with powerful reporting and analytics."
              }
            ].map((item, index) => (
              <div key={index} className="text-center p-6 rounded-lg shadow-md bg-white">
                <h3 className="text-xl font-semibold text-primary mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold mb-4">
            Ready to Experience CAPTION?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Schedule a personalized demo with our experts to see how CAPTION fits your unique business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 font-semibold">
              Schedule a Demo
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DemoPage;
