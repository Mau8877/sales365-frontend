import Container from "../layouts/Container";
import AnimatedSection from "../../AnimatedSection";
import { motion } from "framer-motion";
import {
  Rocket,
  Calendar,
  UserPlus,
  Settings,
  TrendingUp,
  DollarSign,
  Smile,
  Zap,
} from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <Container>
        {/* Mission */}
        <AnimatedSection
          direction="up"
          delay={0.2}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Más que un software,
            <span className="text-blue-600"> tu aliado estratégico</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            En{" "}
            <span className="font-semibold text-blue-600">SmartSales365</span>{" "}
            creemos que cada negocio minorista merece herramientas poderosas y
            accesibles. Nuestra misión es democratizar la tecnología para que
            tiendas de todos los tamaños puedan competir y crecer en la era
            digital.
          </p>
        </AnimatedSection>

        {/* Métricas en Vivo */}
        <AnimatedSection direction="up" delay={0.4} className="mb-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Impacto en Tiempo Real
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              {
                metric: "2,847",
                label: "Ventas Hoy",
                color: "text-green-600",
                icon: <TrendingUp className="w-8 h-8" />,
              },
              {
                metric: "Bs. 154K",
                label: "Ingresos Diarios",
                color: "text-blue-600",
                icon: <DollarSign className="w-8 h-8" />,
              },
              {
                metric: "94%",
                label: "Clientes Satisfechos",
                color: "text-purple-600",
                icon: <Smile className="w-8 h-8" />,
              },
              {
                metric: "3.2s",
                label: "Tiempo por Venta",
                color: "text-orange-600",
                icon: <Zap className="w-8 h-8" />,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="flex justify-center mb-2 text-gray-700">
                  {stat.icon}
                </div>
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.metric}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Sección Unificada: Pasos + Transformación */}
        <AnimatedSection direction="up" delay={0.8}>
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Tu Próximo Paso Hacia el Crecimiento
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Más de{" "}
              <span className="font-semibold text-blue-600">500 retailers</span>{" "}
              ya transformaron sus negocios.{" "}
              <span className="font-semibold">¿Serás el próximo?</span>
            </p>

            {/* Contenedor Unificado */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
              {/* Timeline de Implementación Integrado */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-6">
                  Comienza en solo 3 pasos:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white/30">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Registro en 2 minutos</span>
                    <p className="text-blue-200 text-xs">Solo email y nombre</p>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white/30">
                      <Settings className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Configuración guiada</span>
                    <p className="text-blue-200 text-xs">
                      Asistente paso a paso
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white/30">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Tienda lista en 1 hora</span>
                    <p className="text-blue-200 text-xs">¿Listo para vender?</p>
                  </div>
                </div>
              </div>

              {/* CTA Final Integrado */}
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  ¿Listo para la Transformación?
                </h3>
                <p className="text-blue-100 text-lg mb-6">
                  Únete a la revolución retail hoy mismo. Sin compromisos, sin
                  complicaciones.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Rocket className="w-5 h-5" />
                    <span>Comenzar Gratis</span>
                  </motion.button>
                </div>
                <p className="text-blue-200 text-sm mt-4">
                  ✅ Prueba de 14 días • Sin tarjeta requerida • Soporte 24/7
                  incluido
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
};

export default AboutSection;
