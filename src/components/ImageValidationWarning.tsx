import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ImageValidation {
  isValid: boolean;
  confidence: number;
  issues: string[];
  recommendation: string;
}

interface ImageValidationWarningProps {
  validation: ImageValidation;
  slideNumber: number;
  slideTitle: string;
}

export const ImageValidationWarning = ({ 
  validation, 
  slideNumber, 
  slideTitle 
}: ImageValidationWarningProps) => {
  // Don't show anything if valid and high confidence
  if (validation.isValid && validation.confidence > 80) {
    return null;
  }

  const getAlertVariant = () => {
    if (!validation.isValid) return "destructive";
    if (validation.confidence < 60) return "default";
    return "default";
  };

  const getIcon = () => {
    if (!validation.isValid) {
      return <XCircle className="h-4 w-4" />;
    }
    if (validation.confidence < 60) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <CheckCircle className="h-4 w-4" />;
  };

  const getTitle = () => {
    if (!validation.isValid) {
      return "Image Mismatch Detected";
    }
    if (validation.confidence < 60) {
      return "Low Confidence Match";
    }
    return "Image May Need Review";
  };

  return (
    <Alert variant={getAlertVariant()} className="mt-3">
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 space-y-2">
          <AlertTitle className="flex items-center gap-2">
            {getTitle()}
            <Badge variant="outline" className="text-xs">
              Slide {slideNumber}
            </Badge>
          </AlertTitle>
          <AlertDescription>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{slideTitle}</p>
              
              {validation.issues.length > 0 && (
                <div>
                  <p className="font-semibold mb-1">Issues found:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {validation.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validation.recommendation && (
                <div className="mt-2 p-2 bg-background/50 rounded border">
                  <p className="font-semibold text-xs">Recommendation:</p>
                  <p className="text-muted-foreground">{validation.recommendation}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  Confidence: {validation.confidence}%
                </Badge>
              </div>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};
