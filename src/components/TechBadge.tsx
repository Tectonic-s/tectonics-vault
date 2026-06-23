interface TechBadgeProps {
    tech : string;
}

export default function TechBadge({tech} : TechBadgeProps) {
    return (
        <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full px-3 py-1 text-sm">
            {tech}
        </span>
    );
}