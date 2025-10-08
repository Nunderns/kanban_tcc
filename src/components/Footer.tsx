import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-bg transition-border">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-8 text-center md:text-left md:mb-0">
            <div className="flex items-center justify-center space-x-2 md:justify-start">
              <span className="text-xl font-semibold text-gray-900 dark:text-white transition-text">TaskFlow</span>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-text">
              Simplificando sua produtividade
            </p>
          </div>

          <div className="w-full md:w-auto">
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 md:mt-0 md:pt-0 md:border-t-0">
              <div className="flex flex-col items-center space-y-4 md:items-end">
                <div className="flex space-x-6">
                  <a href="https://github.com/Nunderns" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-text">
                    <span className="sr-only">GitHub</span>
                    <FaGithub className="h-5 w-5" />
                  </a>
                  <a href="https://x.com/" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-text">
                    <span className="sr-only">Twitter</span>
                    <FaTwitter className="h-5 w-5" />
                  </a>
                  <a href="https://linkedin.com/" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-text">
                    <span className="sr-only">LinkedIn</span>
                    <FaLinkedin className="h-5 w-5" />
                  </a>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-text">
                  &copy; {currentYear} TaskFlow. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
  