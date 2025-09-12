import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Target, 
  Brain,
  FileText,
  ArrowLeft,
  Share2,
  Lightbulb,
  Star,
  Trophy,
  Zap
} from 'lucide-react';
import { mockAnalysisResult } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const ResultsPage = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const result = mockAnalysisResult;

  const handleExportPDF = async () => {
    setIsExporting(true);
    // Simulate PDF generation
    setTimeout(() => {
      setIsExporting(false);
      
      // Create a fake PDF download
      const element = document.createElement('a');
      const file = new Blob(['This is a sample PDF report for your resume analysis. In production, this would be a real PDF with detailed insights.'], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `Elevatr_Resume_Analysis_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast({
        title: "Report exported!",
        description: "Your resume analysis report has been downloaded.",
      });
    }, 2000);
  };

  const handleShare = () => {
    toast({
      title: "Sharing functionality",
      description: "Share feature will be available soon!",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link to="/upload">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Upload
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                <Trophy className="h-4 w-4 mr-2" />
                Analysis Complete
              </Badge>
              <h1 className="text-4xl font-bold mb-2">Resume Analysis Results</h1>
              <p className="text-muted-foreground">
                Generated on {result.reportDate} • {result.jobRole} at {result.company}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </Button>
              <Button 
                variant="gradient" 
                onClick={handleExportPDF}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="card-elevated border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Match Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(result.matchPercentage)}`}>
                    {result.matchPercentage}%
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getScoreBg(result.matchPercentage)}/10`}>
                  <Target className={`h-6 w-6 ${getScoreColor(result.matchPercentage)}`} />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={result.matchPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time Saved</p>
                  <p className="text-3xl font-bold text-primary">{result.timeSaved}</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                vs manual optimization
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Skills Matched</p>
                  <p className="text-3xl font-bold text-success">{result.matchedSkills.length}</p>
                </div>
                <div className="p-3 rounded-full bg-success/10">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                out of {result.matchedSkills.length + result.missingSkills.length} required
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Missing Skills</p>
                  <p className="text-3xl font-bold text-warning">{result.missingSkills.length}</p>
                </div>
                <div className="p-3 rounded-full bg-warning/10">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                opportunities for growth
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Skills Analysis */}
          <div className="lg:col-span-2 space-y-8">
            {/* Matched Skills */}
            <Card className="card-elevated border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-success">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Matched Skills ({result.matchedSkills.length})
                </CardTitle>
                <CardDescription>
                  Skills from your resume that match the job requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {result.matchedSkills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-success-light rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-success mr-3" />
                        <div>
                          <p className="font-medium">{skill.skill}</p>
                          <p className="text-xs text-muted-foreground">{skill.proficiency}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={skill.importance === 'High' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {skill.importance}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Missing Skills */}
            <Card className="card-elevated border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-warning">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Skills to Develop ({result.missingSkills.length})
                </CardTitle>
                <CardDescription>
                  Skills mentioned in the job description that could strengthen your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.missingSkills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-warning-light rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-warning mr-3" />
                        <div>
                          <p className="font-medium">{skill.skill}</p>
                          <p className="text-xs text-muted-foreground">
                            Current: {skill.proficiency}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={skill.importance === 'High' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {skill.importance}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Overall Scores */}
            <Card className="card-elevated border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-primary" />
                  Overall Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(result.overallScore).map(([category, score]) => (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium capitalize">{category}</span>
                      <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                        {score}%
                      </span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-elevated border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Detailed Report
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Track Progress
                </Button>
                <Link to="/upload" className="block">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Target className="h-4 w-4 mr-2" />
                    Analyze Another Role
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendations */}
        <Card className="card-elevated border-0 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-primary" />
              Personalized Recommendations
            </CardTitle>
            <CardDescription>
              AI-generated insights to improve your chances of landing this role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {result.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps CTA */}
        <Card className="card-elevated border-0 mt-8 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Optimize Another Resume?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Try analyzing your resume for different positions to maximize your job search success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/upload">
                <Button variant="gradient" size="lg">
                  <Target className="h-5 w-5 mr-2" />
                  Analyze New Position
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <Star className="h-5 w-5 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultsPage;