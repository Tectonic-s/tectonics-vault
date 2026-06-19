export default function Navbar() {
    return (
        <nav className="flex justify-between items-center p-6 bg-gray-500 text-white">
            <h1 className="text-2xl font-bold">Tharun's Vault</h1>

            <div className="flex gap-10">
            <p className="cursor-pointer hover:text-red-600">About</p>
            <p className="cursor-pointer hover:text-red-600">Projects</p>
            <p className="cursor-pointer hover:text-red-600">Contact</p>
            </div>
            
        </nav>
    );
}