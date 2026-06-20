export default function Skills() {
    return (
        <section className="h-screen flex items-center flex-col gap-10">
            <h1 className="text-8xl font-bold">Skills</h1>
            <ul className="max-w-2xl text-center text-gray-300 list-inside grid grid-cols-2 gap-20">
                <li className="flex flex-col gap-10 items-center max-w-2xl rounded-3xl border p-8 hover:border-red-500 transition-all duration-300">Programming Languages: Java, Python, JavaScript</li>
                <li className="flex flex-col gap-10 items-center max-w-2xl rounded-3xl border p-8 hover:border-red-500 transition-all duration-300">Frameworks: Flutter, Next.js</li>
                <li className="flex flex-col gap-10 items-center max-w-2xl rounded-3xl border p-8 hover:border-red-500 transition-all duration-300">Databases: MongoDB, PostgreSql</li>
                <li className="flex flex-col gap-10 items-center max-w-2xl rounded-3xl border p-8 hover:border-red-500 transition-all duration-300">Version Control: Git, GitHub</li>
                <li className="flex flex-col gap-10 items-center max-w-2xl rounded-3xl border p-8 hover:border-red-500 transition-all duration-300">Other: HTML, CSS, RESTful APIs, Figma</li>
            </ul>
        </section>
    );
}