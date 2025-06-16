
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ProjectGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const projects = [
    {
      id: 1,
      title: "Modern Metal Roof Installation",
      category: "metal",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop",
      description: "Complete metal roof replacement with energy-efficient features",
      location: "Downtown District",
      year: "2024"
    },
    {
      id: 2,
      title: "Victorian Home Slate Restoration",
      category: "slate",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
      description: "Historic slate roof restoration maintaining original character",
      location: "Historic Neighborhood",
      year: "2023"
    },
    {
      id: 3,
      title: "Solar Integration Project",
      category: "solar",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop",
      description: "Seamless solar panel integration with new asphalt shingles",
      location: "Suburban Area",
      year: "2024"
    },
    {
      id: 4,
      title: "Energy Retrofit Upgrade",
      category: "retrofit",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop",
      description: "Complete energy efficiency upgrade with new insulation",
      location: "City Center",
      year: "2023"
    },
    {
      id: 5,
      title: "Tile Roof Replacement",
      category: "tile",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
      description: "Premium clay tile installation with enhanced ventilation",
      location: "East Side",
      year: "2024"
    },
    {
      id: 6,
      title: "Storm Damage Repair",
      category: "repair",
      image: "https://images.unsplash.com/photo-1521543387331-1bdde561f17c?w=600&h=400&fit=crop",
      description: "Emergency storm damage repair and restoration",
      location: "West District",
      year: "2024"
    }
  ];

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'metal', label: 'Metal Roofing' },
    { id: 'slate', label: 'Slate' },
    { id: 'solar', label: 'Solar Integration' },
    { id: 'retrofit', label: 'Energy Retrofits' },
    { id: 'tile', label: 'Tile Roofing' },
    { id: 'repair', label: 'Repairs' }
  ];

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
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

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map(project => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <Badge variant="secondary" className="mb-2">
                    {project.year}
                  </Badge>
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-3">{project.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{project.location}</span>
                  <Badge variant="outline">{categories.find(c => c.id === project.category)?.label}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View More Projects
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProjectGallery;
