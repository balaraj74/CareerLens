import { Mail, Phone, Linkedin, Github } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  summary: string;
  experience: {
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    description?: string;
  }[];
  skills: string[];
}

export function ResumePreview({ data }: { data: ResumeData }) {
  // Basic validation to prevent rendering with incomplete data
  if (!data || !data.name || !data.experience || !data.education) {
    return (
        <div className="bg-card text-card-foreground rounded-lg border-2 border-dashed border-destructive p-8 max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-destructive">Incomplete Data</h2>
            <p className="text-muted-foreground mt-2">The AI failed to generate a complete resume. Please try again.</p>
        </div>
    );
  }
  
  return (
    <div className="bg-card text-card-foreground rounded-lg border shadow-lg p-8 max-w-4xl mx-auto printable-area">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">{data.name}</h1>
        <div className="flex justify-center items-center gap-x-6 gap-y-2 mt-2 text-sm text-muted-foreground flex-wrap">
          {data.email && (
            <a href={`mailto:${data.email}`} className="flex items-center gap-2 hover:text-primary">
              <Mail className="w-4 h-4" />
              {data.email}
            </a>
          )}
          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {data.phone}
            </div>
          )}
          {data.linkedin && (
            <a href={!data.linkedin.startsWith('http') ? `https://${data.linkedin}` : data.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary">
              <Linkedin className="w-4 h-4" />
              {data.linkedin.replace(/https?:\/\//, '')}
            </a>
          )}
          {data.github && (
            <a href={!data.github.startsWith('http') ? `https://${data.github}` : data.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary">
              <Github className="w-4 h-4" />
              {data.github.replace(/https?:\/\//, '')}
            </a>
          )}
        </div>
      </header>
      
      <Separator className="my-6" />

      {data.summary && (
        <>
          <section>
            <h2 className="text-2xl font-bold font-headline mb-3 text-primary">Summary</h2>
            <p className="text-muted-foreground">{data.summary}</p>
          </section>
          <Separator className="my-6" />
        </>
      )}

      {data.experience?.length > 0 && (
        <>
          <section>
            <h2 className="text-2xl font-bold font-headline mb-4 text-primary">Experience</h2>
            <div className="space-y-6">
              {data.experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline flex-wrap">
                    <h3 className="text-lg font-semibold">{exp.title}</h3>
                    <p className="text-sm text-muted-foreground">{exp.startDate} - {exp.endDate}</p>
                  </div>
                  <h4 className="font-medium text-md text-primary">{exp.company}</h4>
                  <p className="mt-2 text-muted-foreground whitespace-pre-line text-sm">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
          <Separator className="my-6" />
        </>
      )}
      
      {data.education?.length > 0 && (
         <>
          <section>
            <h2 className="text-2xl font-bold font-headline mb-4 text-primary">Education</h2>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                 <div key={index}>
                  <div className="flex justify-between items-baseline flex-wrap">
                    <h3 className="text-lg font-semibold">{edu.institution}</h3>
                    <p className="text-sm text-muted-foreground">{edu.startDate} - {edu.endDate}</p>
                  </div>
                  <h4 className="font-medium text-md text-primary">{edu.degree}</h4>
                   {edu.description && <p className="mt-2 text-muted-foreground text-sm">{edu.description}</p>}
                </div>
              ))}
            </div>
          </section>
          <Separator className="my-6" />
         </>
      )}

      {data.skills?.length > 0 && (
        <section>
           <h2 className="text-2xl font-bold font-headline mb-4 text-primary">Skills</h2>
           <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-base py-1 px-3">{skill}</Badge>
              ))}
           </div>
        </section>
      )}

    </div>
  );
}
