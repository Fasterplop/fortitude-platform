import type { APIRoute } from "astro";
import { Resend } from 'resend';

export const prerender = false;

// === CORRECCIÓN TYPESCRIPT: Definimos la forma de las reglas ===
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedValues?: string[];
  mustBeEmpty?: boolean;
}

// Aplicamos el tipo Record<string, ValidationRule> para que TS sepa qué esperar
const validations: Record<string, ValidationRule> = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/ // Solo letras, espacios y guiones
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Formato email estándar
  },
  phone: {
    required: true,
    pattern: /^\+?[\d\s-]{10,15}$/ // Teléfonos internacionales o locales (10-15 dígitos)
  },
  interest: {
    required: true,
    allowedValues: ['Auto', 'Home', 'Commercial', 'Life', 'Health', 'Renters', 'Motorcycle', 'Boat/Watercraft', 'RV', 'Umbrella', 'General Liability', 'Workers Comp', 'Bonds', 'Cyber Liability', 'E&O', 'Commercial Auto']
  },
  message: {
    required: false,
    maxLength: 2000
  },
  _honey: {
    mustBeEmpty: true // Campo honeypot anti-spam
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  // 1. Obtener la API Key
  const RESEND_API_KEY = (locals as any).runtime?.env?.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;

  // 2. Inicializar cliente
  const resend = new Resend(RESEND_API_KEY);

  const fromEmail = 'Fortitude Website <support@fortitudeins.us>';
  const toEmail = 'support@fortitudeins.us';

  try {
    if (!RESEND_API_KEY) {
      throw new Error("La variable de entorno RESEND_API_KEY no está configurada en el servidor.");
    }

    const data = await request.formData();
    const values: Record<string, string> = {};
    const errors: Record<string, string> = {};

    const honeyValue = data.get('_honey')?.toString() || '';
    if (honeyValue) {
      console.warn('Bot detectado por honeypot.');
      return new Response(JSON.stringify({
        message: "Mensaje enviado correctamente.",
        type: "Success"
      }), { status: 200 });
    }

    // Validar campo por campo
    for (const [field, rules] of Object.entries(validations)) {
      if (field === '_honey') continue;

      const value = data.get(field)?.toString().trim() || '';
      values[field] = value;

      // Validación: Requerido
      if (rules.required && !value) {
        errors[field] = `El campo ${field} es obligatorio.`;
        continue;
      }

      if (!value) continue;

      // Validación: Longitud mínima
      // Ahora TS sabe que minLength es opcional (number | undefined)
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `El ${field} debe tener al menos ${rules.minLength} caracteres.`;
      }

      // Validación: Longitud máxima
      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `El ${field} no puede exceder los ${rules.maxLength} caracteres.`;
      }

      // Validación: Patrón Regex
      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = `El formato del ${field} no es válido.`;
      }

      // Validación: Valores permitidos
      if (rules.allowedValues && !rules.allowedValues.includes(value)) {
        errors[field] = `Por favor seleccione una opción válida de interés.`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return new Response(JSON.stringify({
        message: "Por favor corrija los errores en el formulario.",
        errors,
        type: "Error"
      }), { status: 400 });
    }

    // 3. Preparar contenido
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px; }
          .container { background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); max-width: 600px; margin: auto; }
          h1 { color: #C02C2D; text-align: center; }
          .field { margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .label { font-weight: bold; color: #555; display: block; margin-bottom: 5px; }
          .value { font-size: 16px; }
          .footer { margin-top: 30px; font-size: 12px; text-align: center; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Nuevo Contacto Web</h1>
          <p>Has recibido una nueva solicitud de contacto desde el sitio web:</p>
          
          <div class="field">
            <span class="label">Nombre:</span>
            <span class="value">${values.name}</span>
          </div>
          
          <div class="field">
            <span class="label">Email:</span>
            <span class="value"><a href="mailto:${values.email}">${values.email}</a></span>
          </div>
          
          <div class="field">
            <span class="label">Teléfono:</span>
            <span class="value"><a href="tel:${values.phone}">${values.phone}</a></span>
          </div>
          
          <div class="field">
            <span class="label">Interés Principal:</span>
            <span class="value">${values.interest}</span>
          </div>
          
          <div class="field">
            <span class="label">Mensaje:</span>
            <p class="value">${values.message ? values.message.replace(/\n/g, '<br>') : 'Sin mensaje adicional.'}</p>
          </div>

          <div class="footer">
            Este correo fue enviado automáticamente desde el formulario de contacto de Fortitude Insurance Group.
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
      Nuevo Contacto Web\n\n
      Has recibido una nueva solicitud de contacto:\n\n
      Nombre: ${values.name}\n
      Email: ${values.email}\n
      Teléfono: ${values.phone}\n
      Interés: ${values.interest}\n
      Mensaje: ${values.message || 'Sin mensaje.'}\n
    `;

    // 4. Enviar correo
    const dataResend = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: values.email,
      subject: `Nuevo Contacto Web: ${values.name} - Interés en ${values.interest}`,
      html: emailHtml,
      text: emailText,
    });

    if (dataResend.error) {
      console.error('Error de Resend API:', dataResend.error);
      throw new Error(`Error al enviar el correo: ${dataResend.error.message}`);
    }

    return new Response(JSON.stringify({
      message: "¡Gracias por contactarnos! Hemos recibido tu mensaje y nos pondremos en contacto pronto.",
      type: "Success"
    }), { status: 200 });

  } catch (error: any) {
    console.error('Server Error Full:', error);

    let errorMessage = "Hubo un problema interno al procesar tu solicitud. Por favor intenta nuevamente más tarde.";
    
    if (error instanceof Error) {
      if (error.message.includes('RESEND_API_KEY') || error.message.includes('Error al enviar el correo')) {
         errorMessage = error.message;
      }
    }

    return new Response(JSON.stringify({
      message: errorMessage,
      type: "Error"
    }), { status: 500 });
  }
};