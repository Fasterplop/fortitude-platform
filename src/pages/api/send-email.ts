// src/pages/api/send-email.ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// Importante: Esto fuerza a que esta ruta sea SSR (Server Side Rendering) en Cloudflare
export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

  // 1. SEGURIDAD: HONEYPOT
  // Si este campo (invisible para humanos) tiene valor, es un bot.
  const honey = data.get('_honey');
  if (honey) {
    // Respondemos con éxito falso para confundir al bot
    return new Response(JSON.stringify({ message: 'Enviado' }), { status: 200 });
  }

  // Extracción de datos
  const name = data.get('name');
  const email = data.get('email');
  const phone = data.get('phone');
  
  // Normalizamos: 'interest' viene del Home, 'subject' viene de Contacto
  const rawInterest = data.get('interest');
  const rawSubject = data.get('subject');
  const type = rawInterest || rawSubject || 'Consulta General';
  
  const message = data.get('message');

  // Validación básica
  if (!name || !email || !message) {
    return new Response(
      JSON.stringify({ message: 'Faltan campos requeridos' }),
      { status: 400 }
    );
  }

  try {
    const send = await resend.emails.send({
      from: 'Fortitude Website <support@fortitudeins.us>',
      to: ['support@fortitudeins.us'], // Destinatario final
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

    if (send.error) {
      console.error(send.error);
      return new Response(JSON.stringify({ message: 'Error al enviar el correo' }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({ message: 'Correo enviado con éxito' }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'Error interno del servidor' }),
      { status: 500 }
    );
  }
};