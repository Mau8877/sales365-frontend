import Container from "../layouts/Container";
import AnimatedSection from "../../AnimatedSection";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star, Mail, Zap, Crown, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PricingSection = () => {
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const navigate = useNavigate();

  const handlePlanSelect = () => {
    // Navegar simple a la página de registro
    navigate("/saas-register");
  };

  const plans = [
    {
      name: "Prueba",
      description: "Perfecto para empezar",
      price: {
        monthly: "Gratis",
        yearly: "Gratis",
      },
      period: "14 días",
      features: [
        "Hasta 100 ventas/mes",
        "1 usuario incluido",
        "Dashboard básico",
        "Soporte por email",
        "Inventario limitado",
      ],
      cta: "Comenzar Prueba",
      popular: false,
      color: "border-gray-300",
      button: "bg-gray-600 hover:bg-gray-700",
    },
    {
      name: "Básico",
      description: "Para pequeñas tiendas",
      price: {
        monthly: "Bs. 199",
        yearly: "Bs. 1,990",
      },
      period: billingPeriod === "monthly" ? "por mes" : "por año",
      features: [
        "Ventas ilimitadas",
        "3 usuarios incluidos",
        "Dashboard completo",
        "Soporte prioritario",
        "Inventario completo",
        "App móvil",
        "Reportes básicos",
      ],
      cta: "Elegir Básico",
      popular: true,
      color: "border-blue-500",
      button: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Profesional",
      description: "Para negocios en crecimiento",
      price: {
        monthly: "Bs. 399",
        yearly: "Bs. 3,990",
      },
      period: billingPeriod === "monthly" ? "por mes" : "por año",
      features: [
        "Todo en Básico +",
        "10 usuarios incluidos",
        "Reportes avanzados",
        "Multi-tienda (hasta 3)",
        "CRM completo",
        "Integraciones API",
        "Soporte 24/7",
        "Backup automático",
      ],
      cta: "Elegir Profesional",
      popular: false,
      color: "border-purple-500",
      button: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  const savings = {
    basic: "Ahorras Bs. 398",
    pro: "Ahorras Bs. 798",
  };

  return (
    <section id="pricing" className="py-20 bg-white">
      <Container>
        {/* Section Header */}
        <AnimatedSection
          direction="up"
          delay={0.2}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Planes que se adaptan a
            <span className="text-blue-600"> tu crecimiento</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Sin sorpresas, sin contratos largos. Cambia o cancela cuando
            quieras.
          </p>

          {/* Billing Toggle con animaciones */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <span
                className={`text-lg ${
                  billingPeriod === "monthly"
                    ? "text-gray-900 font-semibold"
                    : "text-gray-500"
                }`}
              >
                Mensual
              </span>

              <button
                onClick={() =>
                  setBillingPeriod(
                    billingPeriod === "monthly" ? "yearly" : "monthly"
                  )
                }
                className="relative w-14 h-7 bg-blue-600 rounded-full transition-colors duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <motion.div
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                  animate={{ x: billingPeriod === "monthly" ? 4 : 28 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>

              <div className="flex items-center">
                <span
                  className={`text-lg ${
                    billingPeriod === "yearly"
                      ? "text-gray-900 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  Anual
                </span>
              </div>
            </div>

            {/* Badge de ahorro debajo del switch */}
            <AnimatePresence>
              {billingPeriod === "yearly" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Ahorra 20% con el plan anual</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </AnimatedSection>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <AnimatedSection
              key={index}
              direction="up"
              delay={0.3 * (index + 1)}
              className="relative"
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center space-x-1">
                    <Crown className="w-4 h-4" />
                    <span>MÁS POPULAR</span>
                  </span>
                </div>
              )}

              <div
                className={`bg-white rounded-2xl border-2 ${
                  plan.color
                } p-8 h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:border-blue-400 ${
                  plan.popular ? "scale-105 relative z-10" : ""
                }`}
              >
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                {/* Price con animación */}
                <div className="text-center mb-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={plan.price[billingPeriod]}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-4xl font-bold text-gray-900 mb-1">
                        {plan.price[billingPeriod]}
                      </div>
                      <div className="text-gray-600">{plan.period}</div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Savings mejorado */}
                  {billingPeriod === "yearly" && plan.name !== "Prueba" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3"
                    >
                      <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                        <div className="flex items-center justify-center space-x-2">
                          <Rocket className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 text-sm font-semibold">
                            {plan.name === "Básico"
                              ? savings.basic
                              : savings.pro}
                          </span>
                        </div>
                        <div className="text-green-500 text-xs mt-1">
                          vs plan mensual
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Features con iconos Lucide */}
                <div className="flex-grow mb-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button - SIMPLIFICADO: solo navega a /saas-register */}
                <motion.button
                  onClick={handlePlanSelect}
                  className={`w-full ${plan.button} text-white py-4 rounded-xl font-semibold transition-all duration-200 mt-auto border-2 border-transparent`}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                >
                  {plan.cta}
                </motion.button>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default PricingSection;