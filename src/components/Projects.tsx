import ProjectCard from "./ProjectCard";

const projects = [ 
    {
        id:1,
        title: "RepayIQ",
        description: "A financial management app for tracking and managing repayments.",
        date: "2026"
    },
    {   
        id:2,
        title: "Samruthi One",
        description: "Webpage for samruthi one, chennai based fintech company",
        date: "2026"
    },
    {
        id:3,
        title: "Tectonic's Vault",
        description: "Personal portfolio website showcasing projects and skills.",
        date: "2026"
    },
    {   
        id:4,
        title: "Smart Progress Tracker",
        description: "A tool for tracking and visualizing progress.",
        date: "Yet to be Started"
    }
]

export default function About() {
    return (
        <section className="h-screen flex items-center flex-col gap-20 p-6 ">
            <h2 className="flex text-5xl md:text-8xl font-bold">Projects</h2>

            <div className="grid grid-cols-2 gap-10">   
                
                {
                    projects.map((project) => ( 
                        <ProjectCard 

                        key={project.id}
                        title={project.title} 
                        description={project.description} 
                        date={project.date} />

                    ))
                }

            </div>
            
        </section>
    );
}