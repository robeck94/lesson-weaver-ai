import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, AlertTriangle, XCircle, Info, Sparkles } from "lucide-react";
import { LessonValidation, ValidationIssue } from "@/pages/Index";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ValidationPanelProps {
  validation: LessonValidation;
}

const SEVERITY_CONFIG = {
  critical: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
  },
  major: {
    icon: AlertTriangle,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
  },
  minor: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
  },
};

const CATEGORY_LABELS = {
  collocation: "Collocation",
  cultural: "Cultural Sensitivity",
  grammar: "Grammar",
  cefr: "CEFR Level",
  age: "Age Appropriateness",
};

export const ValidationPanel = ({ validation }: ValidationPanelProps) => {
  const getQualityColor = () => {
    if (validation.qualityScore >= 85) return "text-green-600 dark:text-green-400";
    if (validation.qualityScore >= 70) return "text-blue-600 dark:text-blue-400";
    if (validation.qualityScore >= 50) return "text-orange-600 dark:text-orange-400";
    return "text-destructive";
  };

  const getQualityBadge = () => {
    if (validation.overallQuality === 'excellent') return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (validation.overallQuality === 'good') return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    if (validation.overallQuality === 'needs_improvement') return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };

  const criticalIssues = validation.issues.filter(i => i.severity === 'critical');
  const majorIssues = validation.issues.filter(i => i.severity === 'major');
  const minorIssues = validation.issues.filter(i => i.severity === 'minor');

  return (
    <Card className="shadow-medium border-border/50">
      <CardHeader className="gradient-card border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="w-5 h-5 text-primary" />
              Content Quality Validation
            </CardTitle>
            <CardDescription>AI-powered quality analysis</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={`text-2xl font-bold ${getQualityColor()}`}>
                {validation.qualityScore}/100
              </div>
              <Badge className={getQualityBadge()}>
                {validation.overallQuality.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            {validation.issues.length === 0 && (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Summary */}
        {validation.issues.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {criticalIssues.length > 0 && (
              <Alert className="border-destructive/30 bg-destructive/10">
                <XCircle className="w-4 h-4 text-destructive" />
                <AlertTitle className="text-sm font-semibold">Critical</AlertTitle>
                <AlertDescription className="text-2xl font-bold text-destructive">
                  {criticalIssues.length}
                </AlertDescription>
              </Alert>
            )}
            {majorIssues.length > 0 && (
              <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <AlertTitle className="text-sm font-semibold">Major</AlertTitle>
                <AlertDescription className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {majorIssues.length}
                </AlertDescription>
              </Alert>
            )}
            {minorIssues.length > 0 && (
              <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-sm font-semibold">Minor</AlertTitle>
                <AlertDescription className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {minorIssues.length}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Strengths */}
        {validation.strengths.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Strengths
            </h3>
            <div className="space-y-1">
              {validation.strengths.map((strength, index) => (
                <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues */}
        {validation.issues.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Issues Detected</h3>
            <ScrollArea className="h-[400px] pr-4">
              <Accordion type="multiple" className="space-y-2">
                {validation.issues.map((issue, index) => {
                  const config = SEVERITY_CONFIG[issue.severity];
                  const IconComponent = config.icon;

                  return (
                    <AccordionItem
                      key={index}
                      value={`issue-${index}`}
                      className={`border ${config.border} ${config.bg} rounded-lg overflow-hidden`}
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-start gap-3 text-left w-full">
                          <IconComponent className={`w-5 h-5 mt-0.5 ${config.color} shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {CATEGORY_LABELS[issue.category]}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${config.color}`}>
                                {issue.severity}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Slide {issue.slideNumber}
                              </Badge>
                            </div>
                            <div className={`mt-1 font-medium ${config.color}`}>
                              {issue.issue}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 space-y-3">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-semibold text-foreground">Suggestion:</span>
                            <p className="text-muted-foreground mt-1">{issue.suggestion}</p>
                          </div>
                          {issue.example && (
                            <div>
                              <span className="font-semibold text-foreground">Original:</span>
                              <p className="text-muted-foreground mt-1 italic">"{issue.example}"</p>
                            </div>
                          )}
                          {issue.correction && (
                            <div>
                              <span className="font-semibold text-green-600 dark:text-green-400">Correction:</span>
                              <p className="text-muted-foreground mt-1 italic">"{issue.correction}"</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </ScrollArea>
          </div>
        )}

        {/* Recommendations */}
        {validation.recommendations.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Recommendations</h3>
            <div className="space-y-2">
              {validation.recommendations.map((rec, index) => (
                <Alert key={index}>
                  <Info className="w-4 h-4" />
                  <AlertDescription>{rec}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
