export default function ProjectCard({title, description, date}: {title: string; description: string; date: string}) {
    return (
        <div className="flex flex-col gap-10 items-center max-w-2xl rounded-3xl border p-8 hover:border-red-500 transition-all duration-300">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p>{description}</p>
            <p>{date}</p>
        </div>
    );
}