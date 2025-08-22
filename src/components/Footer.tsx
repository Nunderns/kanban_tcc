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
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-bg transition-border">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
        <div className="md:flex md:justify-between">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-semibold text-gray-900 dark:text-white transition-text">TaskFlow</span>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-text">
              Simplificando sua produtividade
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider transition-text">
                  {section}
                </h3>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href}
                        className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-foreground transition-text"
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

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-text">
                <span className="sr-only">GitHub</span>
                <FaGithub className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-text">
                <span className="sr-only">Twitter</span>
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-text">
                <span className="sr-only">LinkedIn</span>
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 md:mt-0 transition-text">
              &copy; {currentYear} TaskFlow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
  