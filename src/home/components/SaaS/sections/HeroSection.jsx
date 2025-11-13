import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Container from "../layouts/Container";
import AnimatedSection from "../../AnimatedSection";

const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleComenzarGratis = () => {
    navigate("/saas-register");
  };

  const handleVerPlanes = () => {
    scrollToSection('pricing');
  };

  return (
    <section className="min-h-screen flex items-start justify-center bg-white relative overflow-hidden">
      <Container>
        <div className="text-center pt-12 md:pt-20">
          {/* Titulo */}
          <AnimatedSection direction="up" delay={0.2}>
            <div className="flex items-center justify-center space-x-4 mb-6">
              <img
                src="/Icono365small.png"
                alt="SmartSales365"
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
                onError={(e) => {
                  e.target.src = "/Icono365.png";
                }}
              />
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900">
                Smart
                <span className="text-blue-600">Sales</span>
                365
              </h1>
            </div>
          </AnimatedSection>

          {/* Subtitle */}
          <AnimatedSection direction="up" delay={0.4}>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              El sistema todo en uno que automatiza la gestión de ventas, analiza
              resultados y anticipa tendencias para que tomes las decisiones
              correctas.
              <span className="font-semibold text-blue-600">
                {" "}
                Tu Tienda, Más Rentable.
              </span>
            </p>
          </AnimatedSection>

          {/* CTA Buttons */}
          <AnimatedSection direction="up" delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Botón Primario */}
              <button
                onClick={handleComenzarGratis}
                className="
                bg-blue-600 
                hover:bg-blue-700 
                active:bg-blue-800
                text-white 
                px-8 py-4 
                rounded-xl 
                text-lg font-semibold 
                transition-all 
                duration-200
                ease-out
                transform
                hover:-translate-y-1
                hover:shadow-xl
                active:translate-y-0
                active:shadow-lg
                active:scale-95
                shadow-lg
                border border-blue-700
              "
              >
                Comenzar Gratis
              </button>

              {/* Botón Secundario */}
              <button
                onClick={handleVerPlanes}
                className="
                border-2 
                border-gray-300 
                hover:border-blue-400 
                active:border-blue-500
                text-gray-700 
                hover:text-blue-600
                active:text-blue-700
                bg-gray-50
                hover:bg-blue-50
                active:bg-blue-100
                px-8 py-4 
                rounded-xl 
                text-lg font-semibold 
                transition-all 
                duration-200
                ease-out
                transform
                hover:-translate-y-1
                hover:shadow-lg
                active:translate-y-0
                active:shadow-md
                active:scale-95
              "
              >
                Ver Planes
              </button>
            </div>
          </AnimatedSection>

          {/* Stats Preview */}
          <AnimatedSection direction="up" delay={0.8}>
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600">
                  +500
                </div>
                <div className="text-gray-500">Tiendas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-600">
                  +50K
                </div>
                <div className="text-gray-500">Ventas/día</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-600">
                  99.9%
                </div>
                <div className="text-gray-500">Uptime</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;