import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import confetti from 'canvas-confetti';
import apiClient from '@/services/apiClient';
import carritoService from '@/services/carritoService'; 

const SuccessPay = () => {
    const {  slug } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    // Estados de la verificación
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [error, setError] = useState(null);

    // --- ¡NUEVO SEGURO! ---
    // Esto previene la doble ejecución del useEffect en Modo Estricto
    const verificationStarted = useRef(false);

    useEffect(() => {
        // Si no hay session_id, marcamos error
        if (!sessionId) {
            setError('No se encontró un ID de sesión de pago.');
            setStatus('error');
            setTimeout(() => navigate(`/tienda/${ slug}`), 3000);
            return;
        }

        // --- ¡CONTROL DEL SEGURO! ---
        // Si la verificación ya se inició, no hacemos nada en este render.
        if (verificationStarted.current === true) {
            return;
        }
        // Marcamos que la verificación se va a iniciar.
        verificationStarted.current = true;

        const verifyPayment = async () => {
            try {
                // 1. Llamar a nuestro endpoint del backend
                await apiClient.post(`/ventas/pagos/verificar-sesion/`, { 
                    session_id: sessionId 
                });

                // 2. Si tiene éxito (no hay error 500)
                setStatus('success');
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                
                // 3. Limpiar el carrito localmente
                try {
                    carritoService.limpiarCarritoTienda( slug);
                } catch (cartError) {
                    console.warn("El pago fue exitoso, pero hubo un error al limpiar el carrito local:", cartError);
                }
                
                // 4. Redirigir al usuario después de unos segundos
                setTimeout(() => {
                    navigate(`/tienda/${ slug}`);
                }, 5000);

            } catch (err) {
                // 5. Si el backend falla (ej. error en la transacción)
                console.error("Error al verificar el pago:", err);
                setError(err.response?.data?.error || 'No pudimos confirmar tu pedido. Por favor, contacta a soporte.');
                setStatus('error');
            }
        };

        if (sessionId) {
            verifyPayment();
        }

    }, [sessionId,  slug, navigate]); 

    if (status === 'verifying') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl text-center">
                    <ArrowPathIcon className="mx-auto h-24 w-24 text-blue-500 animate-spin" />
                    <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Verificando tu pago...
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Por favor, no cierres esta ventana. Estamos confirmando tu pedido.
                    </p>
                </div>
            </div>
        );
    }
    
    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl text-center">
                    <CheckCircleIcon className="mx-auto h-24 w-24 text-green-500" />
                    <h1 className="mt-6 text-4xl font-extrabold text-gray-900">
                        ¡Pago Exitoso!
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Tu pedido ha sido creado y está siendo procesado. 
                        ¡Gracias por tu compra!
                    </p>
                    <p className="mt-2 text-md text-gray-500">
                        Serás redirigido en 5 segundos...
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
             <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl text-center">
                    <ExclamationCircleIcon className="mx-auto h-24 w-24 text-red-500" />
                    <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Hubo un problema
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        {error}
                    </p>
                    <p className="mt-2 text-md text-gray-500">
                        Si el cobro fue realizado, tu pedido está seguro. Contacta a soporte con el ID: <br />
                        <span className="text-sm font-mono bg-gray-100 p-1 rounded">{sessionId}</span>
                    </p>
                </div>
            </div>
        );
    }

    return null;
};

export default SuccessPay;