import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { useToast } from '@/hooks/use-toast';
import { exportPdf } from '@/lib/api';

const ResultsPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const techCourses: Record<string, { level: 'Beginner' | 'Intermediate'; url: string }> = {
    // Python and Frameworks
    "Python": {
      level: "Beginner",
      url: "https://www.coursera.org/learn/python"
    },
    "Django": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/python-django-the-practical-guide/"
    },
    "Flask": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/python-and-flask-bootcamp-create-websites-using-flask/"
    },
    "FastAPI": {
      level: "Intermediate",
      url: "https://fastapi.tiangolo.com/tutorial/"
    },

    // Data Science / ML Libraries
    "NumPy": {
      level: "Beginner",
      url: "https://www.datacamp.com/courses/intro-to-python-for-data-science"
    },
    "Pandas": {
      level: "Beginner",
      url: "https://www.datacamp.com/courses/pandas-foundations"
    },
    "SciPy": {
      level: "Intermediate",
      url: "https://www.coursera.org/learn/scipy-python"
    },
    "Matplotlib": {
      level: "Beginner",
      url: "https://www.udemy.com/course/matplotlib-for-data-visualization-in-python/"
    },
    "Seaborn": {
      level: "Beginner",
      url: "https://www.udemy.com/course/data-visualization-with-python-seaborn/"
    },
    "TensorFlow": {
      level: "Intermediate",
      url: "https://www.coursera.org/professional-certificates/tensorflow-in-practice"
    },
    "Keras": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/deep-learning-keras/"
    },
    "PyTorch": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/deep-learning-with-pytorch/"
    },

    // DevOps Tools
    "Jenkins": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/jenkins-from-zero-to-hero/"
    },
    "Docker": {
      level: "Beginner",
      url: "https://www.coursera.org/learn/docker-for-the-absolute-beginner"
    },
    "Kubernetes": {
      level: "Intermediate",
      url: "https://www.edx.org/course/introduction-to-kubernetes"
    },
    "Ansible": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/ansible-for-the-absolute-beginner/"
    },
    "Terraform": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/learn-hashicorp-terraform/"
    },

    // Cloud Platforms
    "AWS": {
      level: "Intermediate",
      url: "https://learn.cantrill.io/"
    },
    "Azure": {
      level: "Intermediate",
      url: "https://docs.microsoft.com/en-us/learn/paths/azure-fundamentals/"
    },
    "Google Cloud": {
      level: "Intermediate",
      url: "https://www.coursera.org/specializations/gcp-architecture"
    },
    "GCP": {
      level: "Intermediate",
      url: "https://www.coursera.org/specializations/gcp-architecture"
    },
    "Oracle Cloud": {
      level: "Intermediate",
      url: "https://www.oracle.com/cloud/education/cloud-certification.html"
    },

    // Databases
    "PostgreSQL": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/postgresql-for-beginners/"
    },
    "MySQL": {
      level: "Beginner",
      url: "https://www.coursera.org/learn/sql-basics"
    },
    "MongoDB": {
      level: "Intermediate",
      url: "https://university.mongodb.com/courses/M001/about"
    },
    "SQLite": {
      level: "Beginner",
      url: "https://www.udemy.com/course/sqlite-database-for-beginners/"
    },
    "Redis": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/redis-the-complete-developers-guide/"
    },

    // APIs & Web
    "GraphQL": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/graphql-with-react-course/"
    },
    "REST API": {
      level: "Beginner",
      url: "https://www.udemy.com/course/rest-api-design/"
    },
    "SOAP API": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/soap-api/"
    },

    // Version Control
    "Git": {
      level: "Beginner",
      url: "https://www.udacity.com/course/how-to-use-git-and-github--ud775"
    },
    "GitHub": {
      level: "Beginner",
      url: "https://lab.github.com/githubtraining/introduction-to-github"
    },
    "GitLab": {
      level: "Beginner",
      url: "https://www.udemy.com/course/gitlab-ci-pipeline/"
    },
    "Bitbucket": {
      level: "Beginner",
      url: "https://www.udemy.com/course/bitbucket-version-control/"
    },

    // Messaging / Queues
    "Celery": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/celery-with-django/"
    },
    "RabbitMQ": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/rabbitmq-for-developers/"
    },

    // ELK Stack
    "Elasticsearch": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/elasticsearch-complete-guide/"
    },
    "Logstash": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/logstash/"
    },
    "Kibana": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/kibana/"
    },

    // Servers & OS
    "Apache": {
      level: "Beginner",
      url: "https://www.udemy.com/course/apache-http-server/"
    },
    "Nginx": {
      level: "Beginner",
      url: "https://www.udemy.com/course/nginx-fundamentals/"
    },
    "Linux": {
      level: "Beginner",
      url: "https://www.edx.org/learn/linux/red-hat-fundamentals-of-red-hat-enterprise-linux"
    },
    "Ubuntu": {
      level: "Beginner",
      url: "https://www.udemy.com/course/ubuntu-essentials/"
    },
    "CentOS": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/centos-linux-for-beginners/"
    },

    // Development Practices
    "Microservices": {
      level: "Intermediate",
      url: "https://www.coursera.org/learn/microservices-development"
    },
    "CI/CD": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/ci-cd-pipeline/"
    },
    "TDD": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/test-driven-development/"
    },
    "BDD": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/bdd-with-cucumber-and-specflow/"
    },

    // Security & Authentication
    "OAuth": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/oauth-2/"
    },
    "JWT": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/json-web-token/"
    },
    "SSL": {
      level: "Beginner",
      url: "https://www.udemy.com/course/ssl-tls/"
    },

    // Programming Paradigms & Concepts
    "Object-Oriented Programming": {
      level: "Beginner",
      url: "https://www.udemy.com/course/object-oriented-programming/"
    },
    "OOP": {  // Alias for Object-Oriented Programming
      level: "Beginner",
      url: "https://www.udemy.com/course/object-oriented-programming/"
    },
    "Multithreading": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/java-multithreading-concurrency-performance-optimization/"
    },
    "Asyncio": {
      level: "Intermediate",
      url: "https://realpython.com/async-io-python/"
    },

    // Frontend Frameworks and Languages
    "React": {
      level: "Beginner",
      url: "https://reactjs.org/docs/getting-started.html"
    },
    "Angular": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/the-complete-guide-to-angular-2/"
    },
    "Vue.js": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/vuejs-2-the-complete-guide/"
    },
    "TypeScript": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/understanding-typescript/"
    },
    "JavaScript": {
      level: "Beginner",
      url: "https://www.udemy.com/course/the-complete-javascript-course/"
    },

    // Languages
    "Java": {
      level: "Beginner",
      url: "https://www.udemy.com/course/java-the-complete-java-developer-course/"
    },
    "C++": {
      level: "Beginner",
      url: "https://www.udemy.com/course/free-learn-c-tutorial-beginners/"
    },
    "C#": {
      level: "Beginner",
      url: "https://www.udemy.com/course/csharp-tutorial-for-beginners/"
    },
    "PHP": {
      level: "Beginner",
      url: "https://www.udemy.com/course/php-for-complete-beginners-includes-mysql-object-oriented/"
    },
    "Ruby": {
      level: "Beginner",
      url: "https://www.udemy.com/course/the-complete-ruby-on-rails-developer-course/"
    },
    "Go": {
      level: "Intermediate",
      url: "https://www.udemy.com/course/learn-how-to-code-in-go/"
    }
  };

  useEffect(() => {
    if (!location.state || !location.state.result) {
      toast({
        title: 'No data found',
        description: 'Redirecting to upload page.',
        variant: 'destructive',
      });
      setTimeout(() => navigate('/upload'), 2000);
      return;
    }

    const fetchedResult = location.state.result;

    // Preprocess for dummy realistic values
    const matched_skills = fetchedResult.matched_skills || [];
    const missing_skills = fetchedResult.missing_skills || [];
    const match_percentage = fetchedResult.match_percentage ?? Math.round((matched_skills.length / (matched_skills.length + missing_skills.length)) * 100);
    const timeSaved = fetchedResult.timeSaved ?? `${Math.floor(Math.random() * 30 + 10)} mins`;

    // Dummy overallScore based on existing data
    const overallScore = fetchedResult.overallScore ?? {
      Experience: Math.min(match_percentage + 10, 100),
      Skills: match_percentage,
      Certifications: Math.min(match_percentage - 5, 100),
      Education: Math.min(match_percentage + 5, 100),
    };

    const recommendations = fetchedResult.recommendations && fetchedResult.recommendations.length > 0
      ? fetchedResult.recommendations
      : [
        'Update your resume with measurable achievements for each role.',
        'Consider learning advanced skills relevant to the job description.',
        'Highlight certifications and courses that align with this role.',
        'Ensure your LinkedIn profile matches your resume keywords.',
      ];

    setResult({
      ...fetchedResult,
      matched_skills,
      missing_skills,
      match_percentage,
      timeSaved,
      overallScore,
      recommendations,
    });
  }, [location.state, navigate, toast]);

  const handleExportPDF = async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      // Use the API abstraction for PDF export
      const pdfBlob = await exportPdf();

      // Create download link for the PDF blob
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OptiResume_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Report exported!',
        description: 'Your resume analysis report has been downloaded.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Export failed',
        description: 'Something went wrong while exporting the report.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
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

  if (!result) return null;

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
                Generated on {new Date().toLocaleDateString()}
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
                  <p className={`text-3xl font-bold ${getScoreColor(result.match_percentage)}`}>
                    {result.match_percentage}%
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getScoreBg(result.match_percentage)}/10`}>
                  <Target className={`h-6 w-6 ${getScoreColor(result.match_percentage)}`} />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={result.match_percentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time Saved</p>
                  <p className="text-3xl font-bold text-primary">{result.estimated_time_saved_minutes}</p>
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
                  <p className="text-3xl font-bold text-success">{result.matched_skills.length}</p>
                </div>
                <div className="p-3 rounded-full bg-success/10">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                out of {result.matched_skills.length + result.missing_skills.length} required
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Missing Skills</p>
                  <p className="text-3xl font-bold text-warning">{result.missing_skills.length}</p>
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
                  Matched Skills ({result.matched_skills.length})
                </CardTitle>
                <CardDescription>
                  Skills from your resume that match the job requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {result.matched_skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-success-light rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-success mr-3" />
                        <div>
                          <p className="font-medium">{skill}</p>
                          <p className="text-xs text-muted-foreground">Proficiency: Intermediate</p>
                        </div>
                      </div>
                      <Badge
                        variant={skill.importance === 'High' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        Medium
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
                  Skills to Develop ({result.missing_skills.length})
                </CardTitle>
                <CardDescription>
                  Skills mentioned in the job description that could strengthen your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.missing_skills.map((skill, index) => {
                    const courseInfo = techCourses[skill];

                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-warning-light rounded-lg">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-warning mr-3" />

                          {courseInfo ? (
                            <a
                              href={courseInfo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-primary hover:underline"
                            >
                              {skill}
                            </a>
                          ) : (
                            <p className="font-medium">{skill}</p>
                          )}

                          <p className="text-xs text-muted-foreground ml-2">
                            Current: Beginner
                          </p>
                        </div>

                        <Badge variant="secondary" className="text-xs">
                          High
                        </Badge>
                      </div>
                    );
                  })}
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
                {Object.entries(result.overallScore).map(([category, score]) => {
                  const numericScore = typeof score === 'number' ? Number(score.toFixed(1)) : 0;
                  return (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium capitalize">{category}</span>
                        <span className={`text-sm font-bold ${getScoreColor(numericScore)}`}>
                          {numericScore}%
                        </span>
                      </div>
                      <Progress value={numericScore} className="h-2" />
                    </div>
                  );
                })}
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