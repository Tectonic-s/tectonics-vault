import ProjectCard, { Project } from "./ProjectCard";

const projects : Project[] = [ 
    {
        id:1,
        title: "RepayIQ",
        tech: ["Flutter" , "Firebase"],
        description: "A financial management app for tracking and managing repayments.",
        status: "Completed",
        date: "2026",
        github: "https://github.com/Tectonic-s/RepayIQ",
        demo: "demo-link"
    },
    {   
        id:2,
        title: "Samruthi One",
        tech: ["Next.js" , "Tailwind CSS", "Resend", "Neon"],
        description: "Fintech Company's offical website.",
        status: "In Progress",
        date: "2026",
        github: "https://github.com/Tectonic-s/samruthi-one",
        demo: "demo-link"
    },
    {
        id:3,
        title: "Tectonic's Vault",
        tech: ["Next.js" , "Tailwind CSS"],
        description: "Personal portfolio Project",
        status: "In Progress",
        date: "2026",
        github: "https://github.com/Tectonic-s/tectonics-vault",
        demo: "demo-link"
    },
    {   
        id:4,
        title: "Smart Progress Assitance and Tracking",
        tech: ["Next.js" , "Tailwind CSS", "Python"],
        description: "-Nil-",
        status: "Yet to Start",
        date: "2027",
        github: "git-link",
        demo: "demo-link"
    }
]

export default function About() {
    return (
        <section className="min-h-screen flex items-center flex-col gap-20 p-6 ">
            <h2 className="flex text-5xl md:text-8xl font-bold">Projects</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">   
                
                {
                    projects.map((project) => ( 
                        <ProjectCard 

                        key={project.id}
                        title={project.title} 
                        tech={project.tech}
                        description={project.description} 
                        status={project.status}
                        date={project.date}
                        github={project.github}
                        demo={project.demo} 

                        />

                    ))
                }

            </div>
            
        </section>
    );
}