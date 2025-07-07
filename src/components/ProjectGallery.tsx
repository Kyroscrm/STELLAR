import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Project {
  id: string;
  title: string;
  category: string;
  beforeImage: string;
  afterImage: string;
  cost: string;
  duration: string;
  description: string;
}

const ProjectGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projects: Project[] = [
    {
      id: '1',
      title: 'Lead Management Dashboard',
      category: 'services',
      beforeImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c7ce?w=400&h=300&fit=crop',
      cost: 'Essential Plan',
      duration: 'Instant Setup',
      description: `Visualize and manage your sales pipeline with an intuitive dashboard, tracking leads from initial contact to conversion.`,
    },
    {
      id: '2',
      title: 'Automated Workflow Example',
      category: 'services',
      beforeImage: 'https://images.unsplash.com/photo-1556157382-97eda2d13296?w=400&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1550522600-08777929b720?w=400&h=300&fit=crop',
      cost: 'Pro Plan',
      duration: 'Quick Setup',
      description: `See how automated workflows can save you time by automating repetitive tasks and notifications.`,
    },
    {
      id: '3',
      title: 'Customizable Reporting',
      category: 'repair',
      beforeImage: 'https://images.unsplash.com/photo-1551288259-cd7c81741d52?w=400&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1550522600-08777929b720?w=400&h=300&fit=crop',
      cost: 'Pro Plan',
      duration: 'Real-time',
      description: `Generate custom reports and gain insights into your business performance with powerful analytics tools.`,
    },
    {
      id: '4',
      title: 'Secure Client Portal',
      category: 'restoration',
      beforeImage: 'https://images.unsplash.com/photo-1550522600-08777929b720?w=400&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1550522600-08777929b720?w=400&h=300&fit=crop',
      cost: 'Included',
      duration: 'Always On',
      description: `Provide your clients with a secure portal to view project updates, invoices, and communicate directly.`,
    },
    {
      id: '5',
      title: 'Mobile Access & Sync',
      category: 'solar',
      beforeImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=400&h=300&fit=crop',
      cost: 'Included',
      duration: 'Seamless',
      description: `Access your CRM data on the go with our mobile-friendly interface, ensuring you're always connected.`,
    },
    {
      id: '6',
      title: 'Integration Capabilities',
      category: 'commercial',
      beforeImage: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
      cost: 'Customizable',
      duration: 'Flexible',
      description: `Connect CAPTION with your favorite business tools and applications for a unified workflow.`,
    }
  ];

  const categories = [
    { id: 'all', label: 'All Features' },
    { id: 'lead-management', label: 'Lead Management' },
    { id: 'project-tracking', label: 'Project Tracking' },
    { id: 'invoicing', label: 'Invoicing' },
    { id: 'reporting', label: 'Reporting' },
    { id: 'automation', label: 'Automation' }
  ];

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  const handleGetEstimate = () => {
    // Navigate to contact form or estimate request
    window.location.href = '/contact';
  };

  return (
    <section id="gallery" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-heading font-bold text-primary mb-4">
            CRM Features <span className="text-secondary">Showcase</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the core functionalities of CAPTION through interactive demos and visual examples.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={selectedCategory === category.id ? "bg-primary text-white" : ""}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <Card key={project.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow group cursor-pointer">
              <div className="relative">
                <div className="grid grid-cols-2 h-48">
                  <div className="relative overflow-hidden">
                    <img 
                      src={project.beforeImage} 
                      alt={`${project.title} - Before`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">Before</Badge>
                    </div>
                  </div>
                  <div className="relative overflow-hidden">
                    <img 
                      src={project.afterImage} 
                      alt={`${project.title} - After`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="text-xs bg-secondary text-primary">After</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-primary">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-secondary">{project.cost}</span>
                    <span className="text-gray-500">{project.duration}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedProject(project)}
                    className="text-primary hover:text-primary/80"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Project Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-primary">{selectedProject.title}</h3>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-2">Before</h4>
                    <img 
                      src={selectedProject.beforeImage} 
                      alt="Before"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">After</h4>
                    <img 
                      src={selectedProject.afterImage} 
                      alt="After"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Project Details</h4>
                    <p className="text-gray-600 mb-4">{selectedProject.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Investment:</span>
                        <span className="text-secondary font-semibold">{selectedProject.cost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Duration:</span>
                        <span>{selectedProject.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Category:</span>
                        <span className="capitalize">{selectedProject.category}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Ready to Explore CAPTION?</h4>
                    <p className="text-gray-600 mb-4">
                      Discover how CAPTION can streamline your business operations. Schedule a demo or start your free trial today!
                    </p>
                    <Button 
                      className="w-full bg-secondary text-primary hover:bg-secondary/90"
                      onClick={handleGetEstimate}
                    >
                      Get Free Estimate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectGallery;