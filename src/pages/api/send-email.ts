// src/pages/api/send-email.ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// Importante: Esto fuerza a que esta ruta sea SSR en Cloudflare
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // CAMBIO 1 (Estilo Hikevo): Acceso robusto a variables de entorno
    // Usamos (locals as any) para evitar problemas de tipado estricto en runtime de Cloudflare
    const RESEND_API_KEY = (locals as any).runtime?.env?.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;

    // Validación explícita que lanza error para que caiga en el catch
    if (!RESEND_API_KEY) {
      throw new Error("La variable RESEND_API_KEY no está configurada o no es accesible.");
    }

    const resend = new Resend(RESEND_API_KEY);
    const data = await request.formData();

    // 1. SEGURIDAD: HONEYPOT
    const honey = data.get('_honey');
    if (honey) {
      return new Response(JSON.stringify({ message: 'Enviado' }), { status: 200 });
    }

    // Extracción de datos
    const name = data.get('name');
    const email = data.get('email');
    const phone = data.get('phone');
    const rawInterest = data.get('interest');
    const rawSubject = data.get('subject');
    const type = rawInterest || rawSubject || 'Consulta General';
    const message = data.get('message');

    // Validación básica
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ message: 'Faltan campos requeridos (Nombre, Email o Mensaje)' }),
        { status: 400 }
      );
    }

    // Configuración del correo
    // NOTA: Asegúrate que 'web.fortitudeins.us' esté verificado en Resend o usa el dominio raíz
    const fromEmail = 'Fortitude Website <support@web.fortitudeins.us>'; 

    const send = await resend.emails.send({
      from: fromEmail,
      to: ['support@fortitudeins.us'], 
      replyTo: email as string,
      subject: `Nuevo Lead Web: ${name} - ${type}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Nuevo Mensaje de Contacto</h2>
          <p>Se ha recibido una nueva solicitud desde la web.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Nombre:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Teléfono:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Asunto/Interés:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${type}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
            <strong>Mensaje:</strong><br/>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    });

    // CAMBIO 2 (Estilo Hikevo): Reportar el error específico de Resend
    if (send.error) {
      console.error("Resend API Error:", send.error);
      return new Response(JSON.stringify({ 
        message: `Error de Resend: ${send.error.message}`,
        type: send.error.name 
      }), { status: 500 });
    }

    return new Response(
      JSON.stringify({ message: 'Correo enviado con éxito' }),
      { status: 200 }
    );

  } catch (error: any) {
    // CAMBIO 3 (Estilo Hikevo): Visibilidad total del error
    // Esto es lo que te permitirá ver en el navegador POR QUÉ falla
    console.error("Server Error Full:", error);
    return new Response(
      JSON.stringify({ 
        message: error.message || 'Error interno desconocido',
        type: error.name || 'UnknownError',
        // Opcional: stack trace solo si ayuda a depurar, quitar en prod si se desea privacidad total
        // stack: error.stack 
      }),
      { status: 500 }
    );
  }
};