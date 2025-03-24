export default function Footer() {
    return (
      <footer className="bg-white text-gray-700 py-10 border-t">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <img src="/logo.png" alt="TaskFlow Logo" className="h-10 mb-2 mx-auto md:mx-0" />
            <p className="text-sm">info@taskflow.com.br</p>
            <p className="text-sm mt-2">Copyright © 2025 TaskFlow</p>
            <p className="text-sm">Powered by TaskFlow</p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-12">
            <div>
              <h3 className="font-semibold">Suporte</h3>
              <ul className="text-sm space-y-2 mt-2">
                <li><a href="#" className="hover:underline">Central de Ajuda</a></li>
                <li><a href="#" className="hover:underline">Changelog</a></li>
                <li><a href="#" className="hover:underline">Comunidade</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">TaskFlow</h3>
              <ul className="text-sm space-y-2 mt-2">
                <li><a href="#" className="hover:underline">Funcionalidades</a></li>
                <li><a href="#" className="hover:underline">Planos e Preços</a></li>
                <li><a href="#" className="hover:underline">Sobre TaskFlow</a></li>
                <li><a href="#" className="hover:underline">Cases</a></li>
              </ul>
            </div>
          </div>
  
          <div className="mt-6 md:mt-0 text-center md:text-left">
            <h3 className="font-semibold">Newsletter</h3>
            <form className="mt-2 flex">
              <input 
                type="email" 
                placeholder="Email address" 
                className="px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button 
                type="submit" 
                className="bg-pink-500 text-white px-4 py-2 rounded-r-md hover:bg-pink-600"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="text-center mt-6 text-sm">
          <a href="#" className="hover:underline">Termos e condições gerais</a>
        </div>
      </footer>
    );
  }
  