
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
      title: 'Complete Roof Replacement',
      category: 'roofing',
      beforeImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop',
      cost: '$45,000',
      duration: '2 weeks',
      description: 'Complete roof replacement with premium architectural shingles and new gutters.'
    },
    {
      id: '2',
      title: 'Metal Roof Installation',
      category: 'roofing',
      beforeImage: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=400&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1504233529578-6d46beb811cd?w=400&h=300&fit=crop',
      cost: '$32,000',
      duration: '1.5 weeks',
      description: 'Modern metal roofing installation with energy-efficient coating and extended warranty.'
    },
    {
      id: '3',
      title: 'Roof Repair & Gutters',
      category: 'repair',
      beforeImage: 'https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?w=400&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      cost: '$12,500',
      duration: '3 days',
      description: 'Storm damage repair with new shingle sections and complete gutter replacement.'
    },
    {
      id: '4',
      title: 'Tile Roof Restoration',
      category: 'restoration',
      beforeImage: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
      cost: '$28,000',
      duration: '1 week',
      description: 'Clay tile roof restoration with cleaning, sealing, and damaged tile replacement.'
    },
    {
      id: '5',
      title: 'Solar Panel Integration',
      category: 'solar',
      beforeImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=400&h=300&fit=crop',
      cost: '$18,000',
      duration: '2 days',
      description: 'Solar panel installation with proper roof mounting and electrical integration.'
    },
    {
      id: '6',
      title: 'Commercial Roof Overhaul',
      category: 'commercial',
      beforeImage: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
      cost: '$180,000',
      duration: '3 weeks',
      description: 'Complete commercial building roof replacement with EPDM membrane and insulation upgrade.'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'roofing', label: 'New Roofing' },
    { id: 'repair', label: 'Repairs' },
    { id: 'restoration', label: 'Restoration' },
    { id: 'solar', label: 'Solar Integration' },
    { id: 'commercial', label: 'Commercial' }
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
            Our Recent Projects
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See the transformation stories from our recent roofing projects. Each project showcases our commitment to quality craftsmanship and attention to detail.
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
                    <h4 className="font-semibold mb-2">Interested in Similar Work?</h4>
                    <p className="text-gray-600 mb-4">
                      Get a free consultation and estimate for your roofing project. Our experts will work with you to create the perfect solution for your home.
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
