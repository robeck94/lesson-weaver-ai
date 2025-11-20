import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTemplates } from '@/hooks/useTemplates';
import { PromptTemplate } from '@/types/template';
import { Settings, Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateManagerProps {
  onSelectTemplate?: (template: PromptTemplate) => void;
}

export const TemplateManager = ({ onSelectTemplate }: TemplateManagerProps) => {
  const { templates, saveTemplate, deleteTemplate, updateTemplate } = useTemplates();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teachingStyle: 'interactive',
    activityPreferences: [] as string[],
    emphasisAreas: [] as string[],
    customInstructions: '',
    tone: 'friendly',
  });

  const activityTypes = [
    'Matching Activities',
    'Fill-in-the-Blank',
    'Word Scrambles',
    'Sentence Ordering',
    'True/False Questions',
    'Dialogue Completion',
    'Role-play Scenarios',
    'Games',
    'Group Work',
    'Pair Work',
  ];

  const emphasisOptions = [
    'Vocabulary',
    'Grammar',
    'Speaking',
    'Listening',
    'Reading',
    'Writing',
    'Pronunciation',
    'Fluency',
  ];

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, formData);
      toast.success('Template updated successfully');
    } else {
      const newTemplate = saveTemplate(formData);
      toast.success('Template created successfully');
      if (onSelectTemplate) {
        onSelectTemplate(newTemplate);
      }
    }

    resetForm();
    setIsOpen(false);
  };

  const handleEdit = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      teachingStyle: template.teachingStyle,
      activityPreferences: template.activityPreferences,
      emphasisAreas: template.emphasisAreas,
      customInstructions: template.customInstructions,
      tone: template.tone,
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
      toast.success('Template deleted');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      teachingStyle: 'interactive',
      activityPreferences: [],
      emphasisAreas: [],
      customInstructions: '',
      tone: 'friendly',
    });
    setEditingTemplate(null);
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Manage Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Custom Prompt Templates</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Your Templates</h3>
              <Button
                onClick={() => {
                  resetForm();
                  setIsOpen(true);
                }}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                New Template
              </Button>
            </div>
            <div className="grid gap-3">
              {templates.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No templates yet. Create your first template to save your teaching preferences.
                  </CardContent>
                </Card>
              ) : (
                templates.map((template) => (
                  <Card key={template.id} className="group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(template)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(template.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{template.teachingStyle}</Badge>
                        <Badge variant="outline">{template.tone}</Badge>
                      </div>
                      {template.emphasisAreas.length > 0 && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Focus: </span>
                          {template.emphasisAreas.join(', ')}
                        </div>
                      )}
                      {onSelectTemplate && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onSelectTemplate(template);
                            setIsOpen(false);
                          }}
                          className="w-full mt-2"
                        >
                          Use This Template
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Template Form */}
          {(editingTemplate || templates.length === 0) && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Interactive & Fun"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of this teaching style"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teachingStyle">Teaching Style</Label>
                    <Select
                      value={formData.teachingStyle}
                      onValueChange={(value) => setFormData({ ...formData, teachingStyle: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interactive">Interactive</SelectItem>
                        <SelectItem value="structured">Structured</SelectItem>
                        <SelectItem value="playful">Playful</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="game-based">Game-Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tone">Tone</Label>
                    <Select
                      value={formData.tone}
                      onValueChange={(value) => setFormData({ ...formData, tone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                        <SelectItem value="calm">Calm</SelectItem>
                        <SelectItem value="motivating">Motivating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Activity Preferences</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activityTypes.map((activity) => (
                      <Badge
                        key={activity}
                        variant={formData.activityPreferences.includes(activity) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            activityPreferences: toggleArrayItem(formData.activityPreferences, activity),
                          })
                        }
                      >
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Emphasis Areas</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {emphasisOptions.map((area) => (
                      <Badge
                        key={area}
                        variant={formData.emphasisAreas.includes(area) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            emphasisAreas: toggleArrayItem(formData.emphasisAreas, area),
                          })
                        }
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="customInstructions">Custom Instructions</Label>
                  <Textarea
                    id="customInstructions"
                    placeholder="Add any specific instructions or preferences for lesson generation..."
                    value={formData.customInstructions}
                    onChange={(e) => setFormData({ ...formData, customInstructions: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
