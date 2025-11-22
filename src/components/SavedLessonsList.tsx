import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SavedLesson {
  id: string;
  title: string;
  topic: string;
  cefr_level: string;
  age_group: string | null;
  context: string | null;
  created_at: string;
  updated_at: string;
}

interface SavedLessonsListProps {
  lessons: SavedLesson[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export const SavedLessonsList = ({ lessons, onLoad, onDelete, isLoading }: SavedLessonsListProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Lessons</CardTitle>
          <CardDescription>Loading your saved lessons...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (lessons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Lessons</CardTitle>
          <CardDescription>No saved lessons yet. Generate and save a lesson to get started!</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Lessons</CardTitle>
        <CardDescription>Your saved lesson library ({lessons.length} lesson{lessons.length !== 1 ? 's' : ''})</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{lesson.title}</h3>
                    <Badge variant="outline">{lesson.cefr_level}</Badge>
                    {lesson.age_group && (
                      <Badge variant="secondary">{lesson.age_group}</Badge>
                    )}
                    {lesson.context && lesson.context !== 'general' && (
                      <Badge variant="secondary">{lesson.context}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{lesson.topic}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created: {format(new Date(lesson.created_at), 'MMM d, yyyy')}
                    </span>
                    {lesson.updated_at !== lesson.created_at && (
                      <span className="flex items-center gap-1">
                        Updated: {format(new Date(lesson.updated_at), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => onLoad(lesson.id)}
                    variant="default"
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Load
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{lesson.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(lesson.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
