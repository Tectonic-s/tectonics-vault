export default function About() {
    return (
        <section className="h-screen flex items-center flex-col gap-20 p-6 ">
            <h2 className="flex text-8xl font-bold">Projects</h2>

            <div className="grid grid-cols-2 gap-10">   
                <div className="flex flex-col gap-10 items-center max-w-2xl rounded-3xl border p-8 hover:border-red-500 transition-all duration-300">
                <p className="text-3xl font-bold text-center">RepayIQ</p>
                <p className="max-w-2xl text-gray-300 text-justify">A mobile application for managing and tracking loan repayments.</p>
                <p className="max-w-2xl text-gray-300 text-center">Latest update : 2026-05-15</p>
                </div>

                <div className="flex flex-col gap-10 items-center max-w-2xl rounded-3xl border p-8 hover:border-red-500 transition-all duration-300">
                <p className="text-3xl font-bold text-center">Samruthi One Page</p>
                <p className="max-w-2xl text-gray-300 text-justify">A web application for an fintech company named Samruthi one where the 
                    company details are showcased and potential leads are secured through forms.</p>
                <p className="max-w-2xl text-gray-300 text-center">Latest update : 2026-06-20</p>
                </div>

                <div className="flex flex-col gap-10 items-center max-w-2xl rounded-3xl border p-8 hover:border-red-500 transition-all duration-300">
                <p className="text-3xl font-bold text-center">Smart Progress Tracker</p>
                <p className="max-w-2xl text-gray-300 text-justify">Web App to help users interactively track their progress and monitor the status of completion to achieve their goals.</p>
                <p className="max-w-2xl text-gray-300 text-center">Latest update : Yet to Start</p>
                </div>

                <div className="flex flex-col gap-10 items-center max-w-2xl rounded-3xl border p-8 hover:border-red-500 transition-all duration-300">
                <p className="text-3xl font-bold text-center">Tectonic's Vault</p>
                <p className="max-w-2xl text-gray-300 text-justify">Built from scratch after deciding to deeply understand web development instead of relying solely on AI-assisted development.</p>
                <p className="max-w-2xl text-gray-300 text-center">Latest update : 2026-07-10</p>
                </div>
            </div>
            
        </section>
    );
}