import TechBadge from "./TechBadge";
import ProjectButton from "./ProjectButton";

export type ProjectStatus =
    | "Completed"
    | "In Progress"
    | "Yet to Start";

export interface Project {
    id: number;
    title: string;
    tech: string[];
    description: string;
    status: ProjectStatus;
    date: string;
    github: string;
    demo: string;
}

type ProjectCardProps = Omit<Project, "id">;

const statusColor = {
    "Completed": "text-green-400",
    "In Progress": "text-yellow-400",
    "Yet to Start": "text-red-400"
}

export default function ProjectCard({title, tech, description, status, date, github, demo}: ProjectCardProps) {
    return (
        <div className="flex flex-col justify-between gap-10 items-center max-w-2xl rounded-4xl border p-8 hover:border-red-500 transition-all duration-300 hover:scale-[1.02] min-h-[450px]">
          <div className="flex flex-col justify-between items-center min-h-[450px]">
              <h1 className="text-3xl font-bold">{title}</h1>
              <div className="flex flex-wrap gap-2">
                  {tech.map((technology) => ( <TechBadge key={technology} tech={technology} />))}
              </div>
              <p>{description}</p>
              <p className={statusColor[status]}>{status}</p>
              <p>Updated: {date}</p>
          </div>
          <div className="flex gap-4 ">
              <ProjectButton link={github} text="GitHub" />
              <ProjectButton link={demo} text="Demo" />
          </div>
        </div>
    );
}