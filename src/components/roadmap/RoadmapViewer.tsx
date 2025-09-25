import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Calendar, MapPin, Sparkles, Target, TrendingUp, BookOpen, Users, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RoadmapViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roadmapContent: string;
  selectedCareer: string;
}

export function RoadmapViewer({ open, onOpenChange, roadmapContent, selectedCareer }: RoadmapViewerProps) {
  const { toast } = useToast();

  const downloadRoadmap = () => {
    const blob = new Blob([roadmapContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCareer.toLowerCase().replace(/\s+/g, '-')}-roadmap.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Your roadmap has been downloaded as a text file."
    });
  };

  const formatRoadmapContent = (content: string) => {
    const lines = content.split('\n');
    const formattedContent = [];
    let currentSection = null;
    let sectionContent = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and basic headers
      if (!trimmedLine || trimmedLine === '===========================' || trimmedLine.startsWith('AI-GENERATED')) {
        continue;
      }

      // Main section headers (1., 2., 3., etc. or ##)
      if (trimmedLine.match(/^(#{1,2}\s+|[1-6]\.\s+)/)) {
        if (currentSection) {
          formattedContent.push({
            type: 'section',
            header: currentSection,
            content: sectionContent
          });
        }
        currentSection = trimmedLine.replace(/^(#{1,2}\s+|[1-6]\.\s+)/, '');
        sectionContent = [];
      }
      // Sub-headers (###, ####)
      else if (trimmedLine.match(/^#{3,4}\s+/)) {
        sectionContent.push({
          type: 'subheader',
          text: trimmedLine.replace(/^#{3,4}\s+/, '')
        });
      }
      // Bullet points
      else if (trimmedLine.startsWith('- ')) {
        sectionContent.push({
          type: 'bullet',
          text: trimmedLine.substring(2)
        });
      }
      // Regular text
      else if (trimmedLine) {
        sectionContent.push({
          type: 'text',
          text: trimmedLine
        });
      }
    }

    // Add the last section
    if (currentSection) {
      formattedContent.push({
        type: 'section',
        header: currentSection,
        content: sectionContent
      });
    }

    return formattedContent;
  };

  const getSectionIcon = (header: string) => {
    const lowerHeader = header.toLowerCase();
    if (lowerHeader.includes('immediate') || lowerHeader.includes('0-3')) return MapPin;
    if (lowerHeader.includes('short-term') || lowerHeader.includes('3-12')) return Calendar;
    if (lowerHeader.includes('medium-term') || lowerHeader.includes('1-3')) return TrendingUp;
    if (lowerHeader.includes('long-term') || lowerHeader.includes('3+')) return Target;
    if (lowerHeader.includes('personal') || lowerHeader.includes('recommend')) return Sparkles;
    if (lowerHeader.includes('challenge') || lowerHeader.includes('obstacle')) return Award;
    if (lowerHeader.includes('overview') || lowerHeader.includes('career')) return BookOpen;
    return Users;
  };

  const formattedSections = formatRoadmapContent(roadmapContent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Career Roadmap: {selectedCareer}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Your personalized AI-generated career development plan
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4 h-[calc(90vh-200px)]">
          <div className="space-y-6 py-4">
            {formattedSections.map((section, sectionIndex) => {
              const IconComponent = getSectionIcon(section.header);
              
              return (
                <div key={sectionIndex} className="roadmap-section animate-fade-in-up" style={{ animationDelay: `${sectionIndex * 0.1}s` }}>
                  <div className="roadmap-header flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-primary">{section.header}</h3>
                  </div>
                  
                  <div className="roadmap-content mt-4 space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="animate-fade-in" style={{ animationDelay: `${(sectionIndex * 0.1) + (itemIndex * 0.05)}s` }}>
                        {item.type === 'subheader' && (
                          <h4 className="text-lg font-semibold text-foreground mt-4 mb-2 flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            {item.text}
                          </h4>
                        )}
                        {item.type === 'bullet' && (
                          <div className="roadmap-list-item">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                          </div>
                        )}
                        {item.type === 'text' && (
                          <p className="text-foreground leading-relaxed font-medium">{item.text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Summary Action Plan */}
            <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-primary-light/5 rounded-xl border border-primary/20 animate-fade-in-up">
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quick Start Guide
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Next 30 Days</h4>
                  <p className="text-sm text-muted-foreground">Research, learn, and start building foundational skills</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Next 90 Days</h4>
                  <p className="text-sm text-muted-foreground">Complete first projects and build your portfolio</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Next Year</h4>
                  <p className="text-sm text-muted-foreground">Gain experience and transition to the field</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Generated on {new Date().toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={downloadRoadmap} className="btn-gradient">
              <Download className="mr-2 h-4 w-4" />
              Download Roadmap
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}