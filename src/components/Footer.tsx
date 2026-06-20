export default function Footer() {
    return (
        <footer className="flex justify-between items-center p-6 bg-gray-500 text-white">

            <div className="flex gap-5">
            <button className="cursor-pointer hover:text-red-600">Email</button>
            <p>|</p>
            <button className="cursor-pointer hover:text-red-600">GitHub </button>
            <p>|</p>
            <button className="cursor-pointer hover:text-red-600">LinkedIn</button>
            </div>
            
            <p>© 2026 Tectonic's Vault. Built by Tectonic.</p>
        </footer>
    );
}