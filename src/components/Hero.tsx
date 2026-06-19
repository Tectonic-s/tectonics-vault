export default function Hero() {
  return (
    <section className="h-screen flex flex-col justify-center items-center gap-10">
        <h1 className="text-8xl font-bold">Hello I'm Tharun</h1>
        <h2 className="text-2xl font-bold">Software Developer.
Building experiences, not just applications.</h2>

        <p className="max-w-2xl text-center text-gray-300 leading-relaxed">Aspiring software developer passionate about building intuitive experiences and understanding systems deeply. Currently exploring modern web development and mobile applications.</p>

        <button className=" rounded-full transition-all bg-gray-500 text-white px-4 py-2 rounded hover:bg-red-600">View Projects</button>
    </section>
  );
}