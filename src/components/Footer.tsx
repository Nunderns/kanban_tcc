import Link from "next/link";
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const footerLinks = {
  support: [
    { name: "Ajuda", href: "#" },
    { name: "Documentação", href: "#" },
    { name: "Tutoriais", href: "#" },
  ],
  company: [
    { name: "Sobre", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Contato", href: "#" },
  ],
  legal: [
    { name: "Termos", href: "#" },
    { name: "Privacidade", href: "#" },
  ]
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <div className="md:flex md:justify-between">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-semibold text-gray-900">TaskFlow</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Simplificando sua produtividade
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  {section}
                </h3>
                <ul className="mt-3 space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href}
                        className="text-sm text-gray-600 hover:text-pink-500"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <FaGithub className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">LinkedIn</span>
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-500 md:mt-0">
              &copy; {currentYear} TaskFlow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
  