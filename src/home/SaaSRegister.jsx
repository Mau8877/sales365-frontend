import { useState } from "react";
import RegisterTienda from "./components/SaaS/RegisterTienda";
import RegisterAdmin from "./components/SaaS/RegisterAdmin";
import RegisterPago from "./components/SaaS/RegisterPago";

const SaaSRegister = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    plan: null,
    tienda: {
      nombre: "",
    },
    admin: {
      nombre: "",
      apellido: "",
      ci: "",
      email: "",
      password: "",
      telefono: "",
    },
  });

  // Navegación entre pasos
  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  // Actualizar datos de cada paso
  const updateFormData = (step, data) => {
    setFormData((prev) => ({
      ...prev,
      [step]: { ...prev[step], ...data },
    }));
  };

  // Cuando se completa el registro
  const handleRegistrationComplete = (finalData) => {
    console.log("Registro completado:", finalData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Stepper */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            {[
              {
                number: 1,
                title: "Tienda",
                active: currentStep === 1,
                completed: currentStep > 1,
              },
              {
                number: 2,
                title: "Administrador",
                active: currentStep === 2,
                completed: currentStep > 2,
              },
              {
                number: 3,
                title: "Pago",
                active: currentStep === 3,
                completed: currentStep > 3,
              },
            ].map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${
                    step.completed
                      ? "bg-green-500 text-white"
                      : step.active
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }
                `}
                >
                  {step.completed ? "✓" : step.number}
                </div>
                <span
                  className={`
                  ml-2 font-medium
                  ${
                    step.active || step.completed
                      ? "text-gray-900"
                      : "text-gray-500"
                  }
                `}
                >
                  {step.title}
                </span>
                {index < 2 && (
                  <div
                    className={`
                    w-16 h-0.5 mx-4
                    ${step.completed ? "bg-green-500" : "bg-gray-200"}
                  `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenido del paso actual */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {currentStep === 1 && (
            <RegisterTienda
              data={formData.tienda}
              plan={formData.plan}
              onNext={nextStep}
              onUpdate={(data) => updateFormData("tienda", data)}
              onPlanSelect={(plan) =>
                setFormData((prev) => ({ ...prev, plan }))
              }
            />
          )}

          {currentStep === 2 && (
            <RegisterAdmin
              data={formData.admin}
              onNext={nextStep}
              onBack={prevStep}
              onUpdate={(data) => updateFormData("admin", data)}
            />
          )}

          {currentStep === 3 && (
            <RegisterPago
              data={formData}
              onBack={prevStep}
              onSubmit={handleRegistrationComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SaaSRegister;