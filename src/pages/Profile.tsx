import { SidebarLayout } from "@/components/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Briefcase, Code, Sparkles } from "lucide-react";

const Profile = () => {
  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-card border-2 border-primary/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-ai opacity-5 pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle className="text-3xl text-primary font-bold">About Me</CardTitle>
            <CardDescription className="text-base">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Full Stack Developer & AI Enthusiast
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            {/* Profile Image and Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-gradient-upload/20 rounded-xl border-2 border-primary/20">
              <div className="relative">
                <img
                  src="https://mdmustafa-portfolio.netlify.app/profile.jpg"
                  alt="Profile"
                  className="h-32 w-32 sm:h-40 sm:w-40 rounded-full object-cover border-4 border-primary/30 shadow-lg"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-ai opacity-20" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                  Full Stack Developer
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="text-base">Hyderabad, India</span>
                </div>
                <p className="text-base text-foreground leading-relaxed">
                  A passionate Full Stack Developer based in Hyderabad, India
                </p>
              </div>
            </div>

            {/* About Section */}
            <div className="p-6 bg-gradient-card rounded-xl border border-primary/20 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Code className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold text-primary">About</h3>
              </div>
              <p className="text-base text-foreground leading-relaxed">
                Passionate Software Engineer with a strong foundation in full-stack development and emerging AI technologies. 
                Experienced in React, JavaScript, and modern web development practices through internship and client projects.
              </p>
            </div>

            {/* Experience Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold text-primary">Experience</h3>
              </div>

              {/* Current Role */}
              <Card className="border-2 border-primary/20 bg-gradient-upload/10">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gradient-ai text-white">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-primary mb-1">
                        Frontend Developer
                      </h4>
                      <p className="text-sm font-semibold text-accent mb-2">
                        68M Hospitality Pvt. Ltd.
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Current Role</span>
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        Developing travel websites with hotel ranking and admin dashboards. 
                        Building responsive and user-friendly interfaces using modern web technologies.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Previous Role */}
              <Card className="border-2 border-accent/20 bg-gradient-upload/10">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-accent to-primary text-white">
                      <Code className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-accent mb-1">
                        React Developer Intern
                      </h4>
                      <p className="text-sm font-semibold text-primary mb-2">
                        Outright Creators
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Previous Experience</span>
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        Developed and deployed company websites using React and modern web technologies. 
                        Gained hands-on experience in building scalable web applications and implementing 
                        best practices in frontend development.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills/Technologies */}
            <div className="p-6 bg-muted/50 rounded-xl border border-primary/10">
              <h3 className="text-lg font-bold text-primary mb-4">Technologies & Skills</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'JavaScript', 'TypeScript', 'Full Stack Development', 'AI Technologies', 'Web Development'].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default Profile;
