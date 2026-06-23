interface ProjectButton {
    text: string;
    link: string;
}

export default function ProjectButton({text, link}: ProjectButton) {
    return (
        <a className="flex items-center justify-center gap-2 max-w-2xl rounded-2xl border p-8 h-20 w-32 hover:border-red-500
            transition-all duration-300 hover:scale-[1.25]" href={link} target="_blank" rel="noopener noreferrer"> {text} </a>
        
    );
}