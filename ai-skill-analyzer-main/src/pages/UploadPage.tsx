import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Target, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  AlertCircle,
  Download,
  Link as LinkIcon
} from 'lucide-react';
import { jobDescriptionSample } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const UploadPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = (file: File) => {
    if (file.type === 'application/pdf') {
      setResumeFile(file);
      toast({
        title: "Resume uploaded successfully!",
        description: `${file.name} has been uploaded.`,
        variant: "default",
      });
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleUseSampleJob = () => {
    setJobRole('Senior Frontend Developer');
    setJobDescription(jobDescriptionSample);
    toast({
      title: "Sample job loaded!",
      description: "You can modify the job description as needed.",
    });
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !jobRole.trim() || !jobDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please upload a resume, enter a job role, and provide a job description.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      navigate('/results');
      toast({
        title: "Analysis complete!",
        description: "Your resume has been analyzed successfully.",
        variant: "default",
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Target className="h-4 w-4 mr-2" />
            Step 1: Upload & Setup
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Let's Optimize Your Resume
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your resume and provide job details to get personalized AI insights 
            that will help you land your dream role.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Resume Upload */}
          <div className="space-y-6">
            <Card className="card-elevated border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Upload Your Resume
                </CardTitle>
                <CardDescription>
                  Upload your current resume in PDF format for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : resumeFile
                      ? 'border-success bg-success-light'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {resumeFile ? (
                    <div className="space-y-4">
                      <CheckCircle className="h-12 w-12 text-success mx-auto" />
                      <div>
                        <p className="font-medium text-success">{resumeFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setResumeFile(null)}
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <p className="text-sm font-medium">
                          Drag and drop your resume here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF files only, max 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileInputChange}
                        className="hidden"
                        id="resume-upload"
                      />
                      <Label htmlFor="resume-upload" className="cursor-pointer">
                        <Button variant="outline" asChild>
                          <span>Choose File</span>
                        </Button>
                      </Label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Role Input */}
            <Card className="card-elevated border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Target Job Role
                </CardTitle>
                <CardDescription>
                  What position are you applying for?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="job-role">Job Title</Label>
                    <Input
                      id="job-role"
                      placeholder="e.g., Senior Frontend Developer, Product Manager"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Job Description */}
          <div className="space-y-6">
            <Card className="card-elevated border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-primary" />
                  Job Description
                </CardTitle>
                <CardDescription>
                  Paste the job description you're targeting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUseSampleJob}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Use Sample Job
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Fetch from URL
                  </Button>
                </div>
                
                <div>
                  <Label htmlFor="job-description">Job Description</Label>
                  <Textarea
                    id="job-description"
                    placeholder="Paste the complete job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={12}
                    className="mt-1 resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analysis Button */}
        <div className="mt-12 text-center">
          <Card className="card-elevated border-0 max-w-md mx-auto">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary mr-2" />
                  <span className="text-lg font-semibold">Ready to Analyze</span>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Our AI will analyze your resume against the job requirements 
                  and provide detailed insights in seconds.
                </p>
                
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !resumeFile || !jobRole.trim() || !jobDescription.trim()}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Analyze Resume
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
                
                {(!resumeFile || !jobRole.trim() || !jobDescription.trim()) && (
                  <p className="text-xs text-muted-foreground">
                    Please complete all fields above to proceed
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;