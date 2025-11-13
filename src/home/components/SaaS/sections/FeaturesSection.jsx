import Container from "../layouts/Container";
import AnimatedSection from "../../AnimatedSection";
import { 
  BarChart3, ShoppingCart, Bell, 
  CreditCard, Smartphone, Shield 
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Dashboard Inteligente",
      description:
        "Métricas en tiempo real con análisis predictivo para decisiones basadas en datos.",
    },
    {
      icon: ShoppingCart,
      title: "Venta de Productos",
      description:
        "Sistema completo de ventas con gestión de productos y gestión de carrito.",
    },
    {
      icon: Bell,
      title: "Notificaciones Push",
      description:
        "Alertas inteligentes que te mantienen informado sobre eventos importantes en tu negocio.",
    },
    {
      icon: CreditCard,
      title: "POS Multicanales",
      description:
        "Terminal punto de venta integrado con e-commerce y marketplaces.",
    },
    {
      icon: Smartphone,
      title: "App Móvil",
      description:
        "Gestiona ventas, productos y clientes desde cualquier lugar.",
    },
    {
      icon: Shield,
      title: "Seguridad Enterprise",
      description:
        "Encriptación bancaria y backups automáticos nivel enterprise.",
    },
  ];

  return (
    <section id="features" className="py-16 bg-gray-50"> {/* Reducido py-20 a py-16 */}
      <Container>
        {/* Section Header más compacto */}
        <AnimatedSection
          direction="up"
          delay={0.2}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"> {/* Texto más pequeño */}
            <span className="text-gray-900">Todo lo que necesitas para</span>
            <span className="text-blue-600"> hacer crecer tu negocio</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto"> {/* Texto más pequeño */}
            Una plataforma versátil para todo tipo de comercios. Efectiva tanto
            para boutiques como para tiendas de electrónica y electrodomésticos.
          </p>
        </AnimatedSection>

        {/* Features Grid más compacta */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Reducido gap-8 a gap-6 */}
          {features.map((feature, index) => (
            <AnimatedSection
              key={index}
              direction="up"
              delay={0.1 * (index + 1)}
              className="group"
            >
              <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg h-full transform hover:-translate-y-1"> {/* Reducido p-8 a p-6 */}
                {/* Icono con fondo gray-900 */}
                <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg"> {/* Reducido tamaño y bg-gray-900 */}
                  <feature.icon className="w-6 h-6 text-white" /> {/* Icono más pequeño */}
                </div>
                
                {/* Texto más compacto */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center"> {/* Texto más pequeño */}
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed text-center"> {/* Texto más pequeño */}
                  {feature.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FeaturesSection;