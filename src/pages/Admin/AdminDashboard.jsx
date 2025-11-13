import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area,      
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ReferenceLine 
} from 'recharts';

const dataPrediccion = {
    "status": "ok",
    "mensaje": "Predicción generada exitosamente para 10 días",
    "fecha_inicio": "2025-11-13",
    "fecha_fin": "2025-11-22",
    "dias_predichos": 10,
    "predicciones": [
        {
            "fecha": "2025-11-13",
            "dia_semana": "Jueves",
            "total_productos_predichos": 5,
            "productos": [
                {
                    "producto_id": 35,
                    "probabilidad_venta": 0.46,
                    "se_vendera": false
                },
                {
                    "producto_id": 10,
                    "probabilidad_venta": 0.22,
                    "se_vendera": false
                },
                {
                    "producto_id": 17,
                    "probabilidad_venta": 0.15,
                    "se_vendera": false
                },
                {
                    "producto_id": 33,
                    "probabilidad_venta": 0.14,
                    "se_vendera": false
                },
                {
                    "producto_id": 1,
                    "probabilidad_venta": 0.13,
                    "se_vendera": false
                }
            ]
        },
        {
            "fecha": "2025-11-14",
            "dia_semana": "Viernes",
            "total_productos_predichos": 5,
            "productos": [
                {
                    "producto_id": 33,
                    "probabilidad_venta": 0.34,
                    "se_vendera": false
                },
                {
                    "producto_id": 4,
                    "probabilidad_venta": 0.29,
                    "se_vendera": false
                },
                {
                    "producto_id": 1,
                    "probabilidad_venta": 0.26,
                    "se_vendera": false
                },
                {
                    "producto_id": 6,
                    "probabilidad_venta": 0.21,
                    "se_vendera": false
                },
                {
                    "producto_id": 8,
                    "probabilidad_venta": 0.19,
                    "se_vendera": false
                }
            ]
        },
        {
            "fecha": "2025-11-15",
            "dia_semana": "Sabado",
            "total_productos_predichos": 5,
            "productos": [
                {
                    "producto_id": 8,
                    "probabilidad_venta": 0.24,
                    "se_vendera": false
                },
                {
                    "producto_id": 4,
                    "probabilidad_venta": 0.21,
                    "se_vendera": false
                },
                {
                    "producto_id": 7,
                    "probabilidad_venta": 0.21,
                    "se_vendera": false
                },
                {
                    "producto_id": 3,
                    "probabilidad_venta": 0.2,
                    "se_vendera": false
                },
                {
                    "producto_id": 9,
                    "probabilidad_venta": 0.17,
                    "se_vendera": false
                }
            ]
        },
        {
            "fecha": "2025-11-16",
            "dia_semana": "Domingo",
            "total_productos_predichos": 5,
            "productos": [
                {
                    "producto_id": 8,
                    "probabilidad_venta": 0.43,
                    "se_vendera": false
                },
                {
                    "producto_id": 20,
                    "probabilidad_venta": 0.16,
                    "se_vendera": false
                },
                {
                    "producto_id": 28,
                    "probabilidad_venta": 0.16,
                    "se_vendera": false
                },
                {
                    "producto_id": 16,
                    "probabilidad_venta": 0.11,
                    "se_vendera": false
                },
                {
                    "producto_id": 19,
                    "probabilidad_venta": 0.11,
                    "se_vendera": false
                }
            ]
        },
        {
            "fecha": "2025-11-17",
            "dia_semana": "Lunes",
            "total_productos_predichos": 5,
            "productos": [
                {
                    "producto_id": 8,
                    "probabilidad_venta": 0.23,
                    "se_vendera": false
                },
                {
                    "producto_id": 1,
                    "probabilidad_venta": 0.22,
                    "se_vendera": false
                },
                {
                    "producto_id": 3,
                    "probabilidad_venta": 0.21,
                    "se_vendera": false
                },
                {
                    "producto_id": 4,
                    "probabilidad_venta": 0.15,
                    "se_vendera": false
                },
                {
                    "producto_id": 19,
                    "probabilidad_venta": 0.15,
                    "se_vendera": false
                }
            ]
        },
        {
            "fecha": "2025-11-18",
            "dia_semana": "Martes",
            "total_productos_predichos": 5,
            "productos": [
                {
                    "producto_id": 6,
                    "probabilidad_venta": 0.58,
                    "se_vendera": true
                },
                {
                    "producto_id": 7,
                    "probabilidad_venta": 0.45,
                    "se_vendera": false
                },
                {
                    "producto_id": 19,
                    "probabilidad_venta": 0.4,
                    "se_vendera": false
                },
                {
                    "producto_id": 4,
                    "probabilidad_venta": 0.24,
                    "se_vendera": false
                },
                {
                    "producto_id": 16,
                    "probabilidad_venta": 0.22,
                    "se_vendera": false
                }
            ]
        },
        {
            "fecha": "2025-11-19",
            "dia_semana": "Miercoles",
            "total_productos_predichos": 5,
            "productos": [
                {
                    "producto_id": 20,
                    "probabilidad_venta": 0.21,
                    "se_vendera": false
                },
                {
                    "producto_id": 8,
                    "probabilidad_venta": 0.2,
                    "se_vendera": false
                },
                {
                    "producto_id": 6,
                    "probabilidad_venta": 0.18,
                    "se_vendera": false
                },
                {
                    "producto_id": 7,
                    "probabilidad_venta": 0.16,
                    "se_vendera": false
                },
                {
                    "producto_id": 15,
                    "probabilidad_venta": 0.16,
                    "se_vendera": false
                }
            ]
        },
        {
            "fecha": "2025-11-20",
            "dia_semana": "Jueves",
            "total_productos_predichos": 5,
            "productos": [
                {
                    "producto_id": 6,
                    "probabilidad_venta": 0.18,
                    "se_vendera": false
                },
                {
                    "producto_id": 7,
                    "probabilidad_venta": 0.17,
                    "se_vendera": false
                },
                {
                    "producto_id": 15,
                    "probabilidad_venta": 0.17,
                    "se_vendera": false
                },
                {
                    "producto_id": 8,
                    "probabilidad_venta": 0.15,
                    "se_vendera": false
                },
                {
                    "producto_id": 19,
                    "probabilidad_venta": 0.13,
                    "se_vendera": false
                }
            ]
        },
        {
            "fecha": "2025-11-21",
            "dia_semana": "Viernes",
            "total_productos_predichos": 5,
            "productos": [
                {
                    "producto_id": 20,
                    "probabilidad_venta": 0.22,
                    "se_vendera": false
                },
                {
                    "producto_id": 8,
                    "probabilidad_venta": 0.18,
                    "se_vendera": false
                },
                {
                    "producto_id": 31,
                    "probabilidad_venta": 0.18,
                    "se_vendera": false
                },
                {
                    "producto_id": 11,
                    "probabilidad_venta": 0.17,
                    "se_vendera": false
                },
                {
                    "producto_id": 18,
                    "probabilidad_venta": 0.16,
                    "se_vendera": false
                }
            ]
        },
        {
            "fecha": "2025-11-22",
            "dia_semana": "Sabado",
            "total_productos_predichos": 5,
            "productos": [
                {
                    "producto_id": 8,
                    "probabilidad_venta": 0.17,
                    "se_vendera": false
                },
                {
                    "producto_id": 33,
                    "probabilidad_venta": 0.17,
                    "se_vendera": false
                },
                {
                    "producto_id": 6,
                    "probabilidad_venta": 0.13,
                    "se_vendera": false
                },
                {
                    "producto_id": 7,
                    "probabilidad_venta": 0.13,
                    "se_vendera": false
                },
                {
                    "producto_id": 11,
                    "probabilidad_venta": 0.13,
                    "se_vendera": false
                }
            ]
        }
    ]
};

const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconChartLine = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const IconStar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 9.096c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);
const IconExclamation = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.876c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const formatDate = (date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
};

/**
 * 1. Tarjetas de KPIs (Indicadores Clave)
 */
const KpiCard = ({ titulo, valor, icono, color }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
      <div className={`rounded-full p-3 ${color.bg} ${color.text}`}>
        {icono}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{titulo}</p>
        <p className="text-2xl font-bold text-gray-900">{valor}</p>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-800">{label}</p>
        <p className="text-sm" style={{ color: payload[0].stroke }}>
          {`Prob. Máx: ${(payload[0].value * 100).toFixed(0)}%`}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * 2. Gráfico de Línea
 */
const GraficoPredicciones = ({ datos }) => {

  const dataGrafico = useMemo(() => datos.map(dia => ({
    fecha: new Date(dia.fecha + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    probabilidad: dia.productos[0].probabilidad_venta, 
  })), [datos]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md col-span-12 lg:col-span-7">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Confianza de Predicción (Producto Top de cada día)
      </h3>
      <div className="h-72 w-full">
        {/* --- GRÁFICO DINÁMICO RECHARTS --- */}
        <ResponsiveContainer width="100%" height="100%">
          {/* ¡MODIFICADO! Cambiado a AreaChart */}
          <AreaChart 
            data={dataGrafico}
            margin={{
              top: 5,
              right: 20,
              left: -20,
              bottom: 5,
            }}
          >
            {/* ¡NUEVO! Definición del gradiente */}
            <defs>
              <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="fecha" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Línea de referencia al 50% */}
            <ReferenceLine 
                y={0.5} 
                stroke="#f43f5e" 
                strokeDasharray="4 4" 
                strokeWidth={2} 
            />
            
            {/* Cambiado a <Area> */}
            <Area 
              type="monotone" 
              dataKey="probabilidad" 
              name="Probabilidad Máx"
              stroke="#10b981"
              strokeWidth={3} 
              fill="url(#colorProb)" 
              dot={{ r: 4, fill: "#10b981" }}
              activeDot={{ r: 6, fill: "#10b981", stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        {/* --- FIN GRÁFICO DINÁMICO --- */}
      </div>
    </div>
  );
};

/**
 * 3. Lista de Productos Top
 */
const TopProductosResumen = ({ datos }) => {
  const productosTop = useMemo(() => {
    const productosMap = new Map();
    datos.forEach(dia => {
      dia.productos.forEach(prod => {
        const probActual = productosMap.get(prod.producto_id) || 0;
        if (prod.probabilidad_venta > probActual) {
          productosMap.set(prod.producto_id, prod.probabilidad_venta);
        }
      });
    });
    
    return Array.from(productosMap.entries())
      .map(([id, prob]) => ({ id, prob }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, 5);
  }, [datos]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md col-span-12 lg:col-span-5">
      {/* ¡TÍTULO MODIFICADO! */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Productos Clave (Top 5 del Período)
      </h3>
      {/* ¡DESCRIPCIÓN MODIFICADA! */}
      <p className="text-sm text-gray-500 mb-4">
        Estos son los 5 productos que alcanzan el <strong>pico de probabilidad más alto</strong> en cualquier día del período.
      </p>
      <div className="space-y-4">
        {productosTop.map(prod => (
          <div key={prod.id} className="flex items-center space-x-3">
            <div className="flex-1">
              <p className="font-semibold text-gray-800">Producto ID: {prod.id}</p>
              {/* ¡TEXTO MODIFICADO! */}
              <p className="text-sm text-gray-500">Pico de Prob. {(prod.prob * 100).toFixed(0)}%</p>
            </div>
            <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${prod.prob > 0.5 ? 'bg-emerald-500' : (prod.prob > 0.3 ? 'bg-amber-400' : 'bg-red-400')}`} 
                style={{ width: `${prod.prob * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


/**
 * 4. Detalle Interactivo por Día
 */
const DetalleDiario = ({ predicciones }) => {
  const [diaActivo, setDiaActivo] = useState(0); 
  const diaSeleccionado = predicciones[diaActivo];

  return (
    <div className="bg-white rounded-xl shadow-md col-span-12 overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Plan de Acción Diario
        </h3>
        <p className="text-sm text-gray-500">
          Selecciona un día para ver la predicción detallada de productos.
        </p>
      </div>

      {/* Selector de Días (Tabs) */}
      <div className="flex space-x-1 p-2 bg-gray-100 overflow-x-auto">
        {predicciones.map((dia, index) => (
          <button
            key={dia.fecha}
            onClick={() => setDiaActivo(index)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold text-sm transition-all
              ${diaActivo === index
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {new Date(dia.fecha + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
          </button>
        ))}
      </div>

      {/* Tabla de Contenido del Día Seleccionado */}
      <div className="p-6">
        <h4 className="text-xl font-bold text-gray-800 mb-1">
          {diaSeleccionado.dia_semana}, {new Date(diaSeleccionado.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
        </h4>

        {/* Alerta de Acción Urgente (BASADA EN `se_vendera: true`) */}
        {diaSeleccionado.productos.some(p => p.se_vendera) ? (
            <div className="my-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg">
                <div className="flex items-center">
                    {/* --- ¡MODIFICADO! SVG en línea --- */}
                    <IconExclamation />
                    <p className="font-semibold text-emerald-700 ml-3">
                        ¡Acción Requerida! Hay {diaSeleccionado.productos.filter(p => p.se_vendera).length} producto(s) con alta probabilidad de venta este día.
                    </p>
                </div>
            </div>
        ) : (
             <div className="my-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <div className="flex items-center">
                    <p className="text-sm text-blue-700">
                        No se detecta demanda urgente para este día. Monitorear productos con mayor probabilidad.
                    </p>
                </div>
            </div>
        )}

        {/* Tabla de Productos del día */}
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Producto ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Probabilidad</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Acción Recomendada</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {diaSeleccionado.productos.map(prod => (
                <tr key={prod.producto_id} className={prod.se_vendera ? 'bg-emerald-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Producto #{prod.producto_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className={`font-bold ${
                        prod.probabilidad_venta > 0.5 ? 'text-emerald-600' :
                        (prod.probabilidad_venta > 0.3 ? 'text-amber-600' : 'text-gray-500')
                    }`}>
                        {(prod.probabilidad_venta * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {prod.se_vendera ? (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Asegurar Stock
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-700">
                        Monitorear
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL DEL DASHBOARD ---

const AdminDashboard = () => {
  const [predictionData, setPredictionData] = useState(dataPrediccion);
  const [fechaInicio, setFechaInicio] = useState(new Date(predictionData.fecha_inicio + 'T00:00:00'));
  const [fechaFin, setFechaFin] = useState(new Date(predictionData.fecha_fin + 'T00:00:00'));

  const kpiData = useMemo(() => {
    let maxProb = 0;
    let productoEstrellaId = null;
    let diaPico = null;
    let diaPicoSemana = null;

    predictionData.predicciones.forEach(dia => {
        dia.productos.forEach(prod => {
            if (prod.probabilidad_venta > maxProb) {
                maxProb = prod.probabilidad_venta;
                productoEstrellaId = prod.producto_id;
                diaPico = new Date(dia.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                diaPicoSemana = dia.dia_semana;
            }
        });
    });

    return {
        maxProb: (maxProb * 100).toFixed(0) + '%',
        productoEstrella: `Producto #${productoEstrellaId}`,
        diaPico: `${diaPicoSemana} ${diaPico}`,
    };
  }, [predictionData]);

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      
      {/* --- Cabecera y Filtro de Fecha --- */}
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold text-gray-800">
          Dashboard de Predicciones
        </h1>
        {/* --- Se reemplaza DatePicker por <input type="date"> --- */}
        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm border">
            <IconCalendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={formatDate(fechaInicio)}
              onChange={(e) => setFechaInicio(new Date(e.target.value + 'T00:00:00'))}
              className="w-32 font-medium text-gray-700 focus:outline-none bg-white"
            />
            <IconArrowRight />
            <input
              type="date"
              value={formatDate(fechaFin)}
              onChange={(e) => setFechaFin(new Date(e.target.value + 'T00:00:00'))}
              min={formatDate(fechaInicio)}
              className="w-32 font-medium text-gray-700 focus:outline-none bg-white"
            />
        </div>
      </div>

      {/* --- Contenedor Principal (Grid) --- */}
      <div className="grid grid-cols-12 gap-6">

        {/* Fila 1: KPIs (CORREGIDOS) */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            titulo="Rango de Predicción"
            valor={`${new Date(predictionData.fecha_inicio + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${new Date(predictionData.fecha_fin + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`}
            icono={<IconCalendar />}
            color={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
          />
          <KpiCard 
            titulo="Probabilidad Máxima"
            valor={kpiData.maxProb}
            icono={<IconChartLine />}
            color={{ bg: 'bg-emerald-100', text: 'text-emerald-600' }}
          />
          <KpiCard 
            titulo="Producto Clave"
            valor={kpiData.productoEstrella}
            icono={<IconStar />}
            color={{ bg: 'bg-amber-100', text: 'text-amber-600' }}
          />
          <KpiCard 
            titulo="Día Pico de Demanda"
            valor={kpiData.diaPico}
            icono={<IconExclamation />}
            color={{ bg: 'bg-red-100', text: 'text-red-600' }}
          />
        </div>

        {/* Fila 2: Gráfico y Resumen */}
        <GraficoPredicciones datos={predictionData.predicciones} />
        <TopProductosResumen datos={predictionData.predicciones} />
        
        {/* Fila 3: Detalle Interactivo */}
        <DetalleDiario predicciones={predictionData.predicciones} />
        
      </div>
    </div>
  );
};

export default AdminDashboard;