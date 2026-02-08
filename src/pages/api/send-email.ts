// src/pages/api/send-email.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { Resend } from 'resend';
import { z } from 'zod';

// 1. Esquema de Validación (Adaptado a tu formulario de Fortitude)
const ContactSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(1, { message: "Phone is required" }),
  subject: z.string().optional(),
  message: z.string().optional(),
  _honey: z.string().max(0), // El campo honeypot debe estar vacío
  // startTime: z.string().optional() // Preparado por si decides agregarlo al frontend luego
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 2. OBTENCIÓN ROBUSTA DE LA API KEY
    // Compatible con Cloudflare Pages (Runtime) y Node/Vercel (import.meta.env)
    const RESEND_API_KEY = (locals as any).runtime?.env?.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error("CRITICAL: RESEND_API_KEY is missing.");
      return new Response(JSON.stringify({ 
        message: "Server configuration error." 
      }), { status: 500 });
    }

    const resend = new Resend(RESEND_API_KEY);
    const formData = await request.formData();

    // 3. Extracción de datos
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      _honey: formData.get("_honey") || "", // Tu campo anti-spam
    };

    // 4. Validación con Zod
    const result = ContactSchema.safeParse(payload);

    if (!result.success) {
      // TRAMPA PARA BOTS: Si el honeypot (_honey) tiene datos, fingimos éxito
      if (payload._honey) { 
        console.warn(`Bot detectado (Honeypot lleno): ${payload.email}`);
        return new Response(JSON.stringify({ message: "Sent" }), { status: 200 }); 
      }
      
      // Error real de validación para humanos
      return new Response(JSON.stringify({ 
        message: "Validation failed", 
        errors: result.error.format() 
      }), { status: 400 });
    }

    // 5. Configuración del Email
    // NOTA: 'from' debe ser un dominio verificado en tu panel de Resend.
    // Si 'web.fortitudeins.us' no está verificado, usa 'onboarding@resend.dev' para pruebas.
    const fromEmail = 'Fortitude Website <support@web.fortitudeins.us>'; 
    const toEmail = 'support@fortitudeins.us'; // Donde quieres recibir los leads

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: result.data.email, // Para responder directamente al cliente
      subject: `New Web Lead: ${result.data.name} - ${result.data.subject || 'No Subject'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Contact Request</h1>
          <p style="background-color: #f4f4f4; padding: 10px; border-radius: 5px;">
            <strong>Origin:</strong> Fortitude Insurance Website (Contact Page)
          </p>
          
          <h3>Client Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${result.data.name}</li>
            <li><strong>Email:</strong> <a href="mailto:${result.data.email}">${result.data.email}</a></li>
            <li><strong>Phone:</strong> <a href="tel:${result.data.phone}">${result.data.phone}</a></li>
            <li><strong>Subject:</strong> ${result.data.subject}</li>
          </ul>

          <h3>Message:</h3>
          <div style="border-left: 4px solid #4CAF50; padding-left: 15px; margin-top: 10px; color: #555;">
            ${(result.data.message || '').replace(/\n/g, '<br>')}
          </div>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">Sent via Resend API</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return new Response(JSON.stringify({ 
        message: "Error sending email provider." 
      }), { status: 500 });
    }

    // 6. Éxito
    return new Response(
      JSON.stringify({ message: "Message sent successfully!" }),
      { status: 200 }
    );

  } catch (e: any) {
    console.error("Server Error:", e);
    return new Response(JSON.stringify({ 
      message: e.message || "Unknown server error" 
    }), { status: 500 });
  }
};