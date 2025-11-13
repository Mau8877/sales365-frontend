import Container from "../layouts/Container";
import AnimatedSection from "../../AnimatedSection";
import { FileText, Brain, Heart } from "lucide-react";

const MoreFeaturesSection = () => {
  const features = [
    {
      icon: FileText,
      title: "Reportes Avanzados",
      description:
        "Genera reportes personalizados de ventas, ganancias y rendimiento por vendedor.",
      items: [
        "Análisis de tendencias",
        "Reportes exportables",
        "Métricas en tiempo real",
      ],
    },
    {
      icon: Brain,
      title: "IA Predictiva",
      description:
        "Algoritmos de IA que anticipan tendencias y optimizan tus ventas.",
      items: [
        "Predicción de ventas",
        "Recomendaciones inteligentes",
        "Optimización de inventario",
      ],
    },
    {
      icon: Heart,
      title: "Fidelización Inteligente",
      description:
        "Programas de lealtad que convierten clientes en promotores de tu marca.",
      items: [
        "Programas de puntos",
        "Beneficios exclusivos",
        "Recompensas personalizadas",
      ],
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <Container>
        {/* Section Header - Texto más grande */}
        <AnimatedSection
          direction="up"
          delay={0.2}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Y mucho
            <span className="text-blue-600"> más...</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Características avanzadas que te dan ventaja competitiva en el
            mercado.
          </p>
        </AnimatedSection>

        {/* Feature Cards - Con efecto hover de elevación y borde azul */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <AnimatedSection
              key={index}
              direction={index % 2 === 0 ? "left" : "right"}
              delay={0.3 * (index + 1)}
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 transition-all duration-300 h-full transform hover:-translate-y-2 hover:shadow-xl hover:border-blue-400">
                {/* Diseño compacto con icono mejor alineado */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {feature.description}
                    </p>

                    {/* Lista de items con puntos azules */}
                    <ul className="space-y-2">
                      {feature.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center text-gray-600 text-sm"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default MoreFeaturesSection;
