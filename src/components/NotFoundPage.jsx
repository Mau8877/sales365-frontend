import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          navigate("/", { replace: true });
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 relative overflow-hidden">
      {/* Fondo animado con Framer Motion (no necesita CSS extra) */}
      <motion.div
        className="absolute w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-xl opacity-20"
        animate={{
          x: [-100, 100, -100],
          y: [-50, 50, -50],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute w-72 h-72 bg-indigo-400 rounded-full mix-blend-screen filter blur-xl opacity-20"
        animate={{
          x: [100, -100, 100],
          y: [50, -50, 50],
          rotate: [360, 180, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Ícono SVG simple y robusto */}
        <motion.div
          className="mb-8"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 12L12 17L3 12M21 12L12 7L3 12M21 12V17C21 17.5304 20.7893 18.0391 20.4142 18.4142C20.0391 18.7893 19.5304 19 19 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17V12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 22V17"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.5 4.5L12 7L7.5 4.5L12 2L16.5 4.5Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 7L16.5 4.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 7L7.5 4.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-extrabold mb-4 drop-shadow-lg">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-semibold mb-3">
          Página No Encontrada
        </h2>
        <p className="text-lg md:text-xl text-blue-100 max-w-xl mb-8">
          Parece que te has desviado de la ruta. El enlace puede estar roto o la
          página fue movida.
        </p>

        <motion.button
          onClick={handleGoHome}
          className="bg-white text-blue-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-100 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Volver al Inicio ({countdown}s)
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
