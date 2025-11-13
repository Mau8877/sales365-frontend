import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "./Container";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
    setIsMenuOpen(false);
  };

  const handleTiendasClick = () => {
    navigate("/tiendas");
    setIsMenuOpen(false);
  };

  const handleLoginClick = () => {
    navigate("/saas-login");
    setIsMenuOpen(false);
  };

  const handleRegisterClick = () => {
    navigate("/saas-register");
    setIsMenuOpen(false);
  };

  const handleSectionClick = (sectionId) => {
    setIsMenuOpen(false);

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 100);
    } else {
      scrollToSection(sectionId);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-blue-600/95 backdrop-blur-md border-b border-blue-500">
      <Container>
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.button
            onClick={handleLogoClick}
            className="flex items-center space-x-3 hover:opacity-75 transition-opacity"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src="/Icono365white.png"
              alt="SmartSales365"
              className="w-22 h-22 object-contain"
              onError={(e) => {
                e.target.src = "/Icono365small.png";
              }}
            />
            <span className="text-2xl font-bold text-white">SmartSales365</span>
          </motion.button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <motion.button
              onClick={handleTiendasClick}
              className="text-white/90 hover:text-white transition-colors font-medium"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Tiendas
            </motion.button>
            <motion.button
              onClick={() => handleSectionClick("features")}
              className="text-white/90 hover:text-white transition-colors font-medium"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Funcionalidades
            </motion.button>
            <motion.button
              onClick={() => handleSectionClick("pricing")}
              className="text-white/90 hover:text-white transition-colors font-medium"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Planes
            </motion.button>

            {/* Botones */}
            <div className="flex items-center space-x-4 ml-4">
              <motion.button
                onClick={handleLoginClick}
                className="
                text-white 
                hover:text-blue-50 
                font-semibold 
                transition-all 
                duration-200
                ease-out
                border border-white/30 
                hover:border-white
                px-4 py-2 
                rounded-lg 
                hover:bg-white/10
                active:bg-white/20
              "
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Iniciar Sesión
              </motion.button>
              <motion.button
                onClick={handleRegisterClick}
                className="
                bg-white 
                text-blue-600
                hover:text-blue-700
                px-6 py-2 
                rounded-lg 
                hover:bg-blue-50
                active:bg-blue-100
                transition-all 
                duration-200
                ease-out
                font-semibold 
                border border-white
                hover:border-blue-200
                shadow-md
                hover:shadow-lg
              "
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Registrar Tienda
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-6 h-0.5 bg-white mb-1.5"
              animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 8 : 0 }}
            />
            <motion.div
              className="w-6 h-0.5 bg-white mb-1.5"
              animate={{ opacity: isMenuOpen ? 0 : 1 }}
            />
            <motion.div
              className="w-6 h-0.5 bg-white"
              animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -8 : 0 }}
            />
          </motion.button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden py-4 border-t border-blue-500 bg-blue-600"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-4 px-4">
                <motion.button
                  onClick={handleTiendasClick}
                  className="text-white/90 hover:text-white py-2 font-medium text-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Tiendas
                </motion.button>
                <motion.button
                  onClick={() => handleSectionClick("features")}
                  className="text-white/90 hover:text-white py-2 font-medium text-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Funcionalidades
                </motion.button>
                <motion.button
                  onClick={() => handleSectionClick("pricing")}
                  className="text-white/90 hover:text-white py-2 font-medium text-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Planes
                </motion.button>

                {/* Botones mobile */}
                <div className="pt-4 border-t border-blue-500 space-y-3">
                  <motion.button
                    onClick={handleLoginClick}
                    className="
                      w-full 
                      text-white 
                      hover:text-blue-50 
                      font-semibold 
                      py-3 
                      text-center 
                      border border-white/30 
                      rounded-lg 
                      hover:bg-white/10
                    "
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Iniciar Sesión
                  </motion.button>
                  <motion.button
                    onClick={handleRegisterClick}
                    className="
                      w-full 
                      bg-white 
                      text-blue-600
                      hover:text-blue-700
                      py-3 
                      rounded-lg 
                      font-semibold 
                      text-center 
                      hover:bg-blue-50
                      border border-white
                      shadow-md
                    "
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Registrar Tienda
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </header>
  );
};

export default Header;
