import type { APIRoute } from "astro";
import { Resend } from 'resend';

export const prerender = false;

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedValues?: string[];
  mustBeEmpty?: boolean;
}

const validations: Record<string, ValidationRule> = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    required: true,
    pattern: /^\+?[\d\s-]{10,15}$/
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
    mustBeEmpty: true
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. OBTENCIÓN SEGURA DE LA API KEY (Evita crash si no existe)
    const RESEND_API_KEY = (locals as any).runtime?.env?.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error("Falta la variable de entorno RESEND_API_KEY");
      return new Response(JSON.stringify({
        message: "Error de configuración del servidor (Falta API Key).",
        type: "Error"
      }), { status: 500 });
    }

    // 2. INICIALIZAR RESEND
    const resend = new Resend(RESEND_API_KEY);

    // USAR TU DOMINIO VERIFICADO
    const fromEmail = 'Fortitude Website <support@web.fortitudeins.us>';
    const toEmail = 'support@fortitudeins.us';

    const data = await request.formData();
    const values: Record<string, string> = {};
    const errors: Record<string, string> = {};

    // --- VALIDACIÓN ---
    const honeyValue = data.get('_honey')?.toString() || '';
    if (honeyValue) {
      console.warn('Bot detectado por honeypot.');
      return new Response(JSON.stringify({ message: "Enviado", type: "Success" }), { status: 200 });
    }

    for (const [field, rules] of Object.entries(validations)) {
      if (field === '_honey') continue;
      const value = data.get(field)?.toString().trim() || '';
      values[field] = value;

      if (rules.required && !value) {
        errors[field] = `El campo ${field} es obligatorio.`;
        continue;
      }
      if (!value) continue;
      if (rules.minLength && value.length < rules.minLength) errors[field] = `Mínimo ${rules.minLength} caracteres.`;
      if (rules.maxLength && value.length > rules.maxLength) errors[field] = `Máximo ${rules.maxLength} caracteres.`;
      if (rules.pattern && !rules.pattern.test(value)) errors[field] = `Formato inválido.`;
      if (rules.allowedValues && !rules.allowedValues.includes(value)) errors[field] = `Opción inválida: ${value}`;
    }

    if (Object.keys(errors).length > 0) {
      return new Response(JSON.stringify({
        message: "Errores en el formulario.",
        errors,
        type: "Error"
      }), { status: 400 });
    }

    // --- PREPARAR EMAIL ---
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head><style>body { font-family: sans-serif; }</style></head>
      <body>
        <h1>Nuevo Contacto Web</h1>
        <p><strong>Nombre:</strong> ${values.name}</p>
        <p><strong>Email:</strong> ${values.email}</p>
        <p><strong>Teléfono:</strong> ${values.phone}</p>
        <p><strong>Interés:</strong> ${values.interest}</p>
        <p><strong>Mensaje:</strong><br>${values.message || 'Sin mensaje'}</p>
      </body>
      </html>
    `;

    // --- ENVIAR ---
    const dataResend = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: values.email, // <--- CORRECTO PARA EL SDK DE TYPESCRIPT
      subject: `Nuevo Lead: ${values.name} - ${values.interest}`,
      html: emailHtml,
      text: `Nuevo contacto de ${values.name}. Revisar HTML para detalles.`,
    });

    if (dataResend.error) {
      console.error('Error de Resend API:', dataResend.error);
      throw new Error(`Resend Error: ${dataResend.error.message}`);
    }

    return new Response(JSON.stringify({
      message: "¡Mensaje recibido correctamente!",
      type: "Success"
    }), { status: 200 });

  } catch (error: any) {
    console.error('SERVER ERROR FULL:', error);
    return new Response(JSON.stringify({
      message: error.message || "Error interno del servidor.",
      type: "Error"
    }), { status: 500 });
  }
};