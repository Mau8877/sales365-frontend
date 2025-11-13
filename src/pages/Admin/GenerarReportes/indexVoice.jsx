import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Loader, AlertCircle, FileText, Terminal, Download, BarChart3 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_WEBHOOK_URL = "https://leobm123.app.n8n.cloud/webhook/a160b622-9df5-4004-91fb-160ce92390d8";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'es-ES';
  recognition.interimResults = false;
}

const GenerarReportesVoz = () => {
  const [prompt, setPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState(null);

  const isSpeechSupported = !!SpeechRecognition;

  const handleSubmit = async (text) => {
    if (!text || text.trim().length === 0) {
      setError("El prompt no puede estar vacío.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    const toastId = toast.loading('Procesando solicitud de reporte...');

    try {
      const response = await fetch(API_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Error en el Webhook: ${response.statusText} ${errorData ? JSON.stringify(errorData) : ''}`);
      }

      const contentType = response.headers.get("content-type");
      const disposition = response.headers.get('content-disposition');

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setApiResponse(data);
        toast.success('Respuesta JSON recibida', { id: toastId });
      
      } else if (disposition && disposition.includes('attachment') || (contentType && (
          contentType.includes("application/pdf") ||
          contentType.includes("application/vnd") ||
          contentType.includes("sheet") ||
          contentType.includes("text/csv") ||
          contentType.includes("application/octet-stream")
      ))) {
        
        const blob = await response.blob(); 
        
        let filename = "reporte_descargado";

        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) { 
              filename = matches[1].replace(/['"]/g, '');
            }
        } else {
            const extension = contentType.includes("pdf") ? "pdf" :
                              contentType.includes("vnd.ms-excel") ? "xls" :
                              contentType.includes("spreadsheetml.sheet") ? "xlsx" :
                              contentType.includes("csv") ? "csv" : "dat";
            filename = `reporte_${new Date().getTime()}.${extension}`;
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(`Archivo '${filename}' descargado`, { id: toastId });
        setApiResponse({ status: "Descarga exitosa", filename: filename });

      } else {
         const textData = await response.text();
         setApiResponse({ response: textData });
         toast.success('Respuesta de texto recibida', { id: toastId });
      }

    } catch (err) {
      console.error("Error al enviar a la API:", err);
      setError(err.message || "Error al conectar con la API.");
      toast.error(err.message || "Error al procesar.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (!isSpeechSupported) {
      setError("Tu navegador no soporta reconocimiento de voz. Usa el campo de texto.");
      toast.error("Reconocimiento de voz no soportado.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setPrompt("");
      setError(null);
      recognition.start();
    }
  };

  useEffect(() => {
    if (!isSpeechSupported) return;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success('Escuchando...');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      toast.dismiss();
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
      handleSubmit(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Error de SpeechRecognition:", event.error);
      setError(`Error de voz: ${event.error}`);
      toast.error(`Error de voz: ${event.error}`);
    };

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [isSpeechSupported, handleSubmit]); // <- Añadido handleSubmit a las dependencias

  const handleTextSubmit = (e) => {
    e.preventDefault();
    handleSubmit(prompt);
  };

  const quickPrompts = [
    "Genera un reporte de ventas del último mes en PDF",
    "Genera un reporte de los Top 10 productos más vendidos en Excel",
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      
      {/* Header mejorado */}
      <div className="w-full max-w-4xl text-center mb-8 sm:mb-12">
        <div className="relative inline-block mb-4">
          <div className="absolute -inset-4 bg-blue-50 rounded-2xl transform rotate-3"></div>
          <div className="relative bg-white rounded-xl p-4 shadow-lg border border-blue-100">
            <FileText className="h-12 w-12 mx-auto text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Generador de <span className="text-blue-600">Reportes</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Pide tu reporte por voz o escríbelo. Obtén análisis detallados en segundos.
        </p>
      </div>

      {/* Quick prompts */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {quickPrompts.map((quickPrompt, index) => (
            <button
              key={index}
              onClick={() => {
                setPrompt(quickPrompt);
                handleSubmit(quickPrompt);
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 hover:border-blue-300"
            >
              {quickPrompt}
            </button>
          ))}
        </div>
      </div>

      {/* --- ESTE ES EL DIV MODIFICADO --- */}
      {/* Cambiamos 'items-start' por 'items-stretch' (o simplemente lo quitamos, ya que stretch es el default) */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Sección de voz */}
        {/* Añadimos 'flex flex-col' para que el div interno pueda crecer si es necesario */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 shadow-lg border border-blue-100 flex flex-col">
          <div className="text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <Mic className="w-6 h-6 text-blue-600" />
                Comando de Voz
              </h2>
              <p className="text-gray-600">Haz clic y habla para generar tu reporte</p>
            </div>

            {/* Añadimos 'my-auto' para centrar verticalmente el botón si hay espacio extra */}
            <div className="my-auto py-4">
              <button
                onClick={handleMicClick}
                disabled={!isSpeechSupported || isLoading}
                className={`
                  relative w-32 h-32 rounded-full flex items-center justify-center 
                  transition-all duration-300 ease-in-out mx-auto
                  focus:outline-none focus:ring-4 focus:ring-opacity-50
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-2xl transform hover:scale-105 active:scale-95
                  ${isListening
                    ? 'bg-gradient-to-br from-red-500 to-red-600 focus:ring-red-400 animate-pulse'
                    : isLoading
                      ? 'bg-gradient-to-br from-gray-500 to-gray-600 focus:ring-gray-400'
                      : 'bg-gradient-to-br from-blue-500 to-blue-600 focus:ring-blue-400 hover:from-blue-600 hover:to-blue-700'
                  }
                `}
              >
                {isLoading ? (
                  <Loader className="w-12 h-12 text-white animate-spin" />
                ) : (
                  <Mic className="w-12 h-12 text-white" />
                )}
                
                {isListening && (
                  <div className="absolute -inset-4 border-4 border-red-400 rounded-full animate-ping"></div>
                )}
              </button>

              {!isSpeechSupported && (
                <p className="text-red-500 text-sm mt-4 text-center">
                  Reconocimiento de voz no soportado en tu navegador.
                </p>
              )}

              {isListening && (
                <p className="text-blue-600 font-medium mt-4 animate-pulse">
                  🎤 Escuchando... Habla ahora
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sección de texto */}
        {/* Añadimos 'flex flex-col' para que el botón se alinee al fondo */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 sm:p-8 shadow-lg border border-blue-100 flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Solicitud por Texto
            </h2>
            <p className="text-gray-600">Describe el reporte que necesitas</p>
          </div>

          {/* Hacemos que el formulario ocupe el espacio restante */}
          <form onSubmit={handleTextSubmit} className="space-y-4 flex flex-col flex-grow">
            <div className="relative flex-grow">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Reporte de ventas de la última semana con análisis de tendencias..."
                // Quitamos la altura fija 'h-32' y hacemos que ocupe todo el espacio
                className="w-full h-full min-h-[128px] p-4 bg-white rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none text-lg shadow-sm"
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !prompt}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Generar Reporte
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Área de Respuesta/Error */}
      <div className="w-full max-w-4xl mt-8 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 animate-fade-in">
            <div className="flex-shrink-0 p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {apiResponse && (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-inner border border-blue-100 p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Terminal className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Respuesta del Sistema</h3>
            </div>
            
            {apiResponse.filename ? (
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Archivo descargado:</p>
                    <p className="text-sm text-gray-600">{apiResponse.filename}</p>
                  </div>
                </div>
              </div>
            ) : (
              <pre className="text-sm text-gray-700 overflow-x-auto bg-white p-4 rounded-xl border border-blue-200">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Footer con información */}
      <div className="w-full max-w-4xl mt-12 pt-8 border-t border-gray-200">
        <div className="text-center text-gray-500 text-sm">
          <p>💡 <strong>Tip:</strong> Sé específico en tus solicitudes para obtener mejores resultados y empieza con un "Genera..." "...en PDF, o Excel"</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default GenerarReportesVoz;