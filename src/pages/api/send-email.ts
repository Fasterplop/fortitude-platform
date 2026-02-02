// import type { APIRoute } from 'astro';
// import { Resend } from 'resend';

// const resend = new Resend(import.meta.env.RESEND_API_KEY);

// export const POST: APIRoute = async ({ request }) => {
//   const data = await request.formData();

//   const name = data.get('name');
//   const email = data.get('email');
//   const phone = data.get('phone');
//   const type = data.get('type'); // Tipo de seguro
//   const message = data.get('message');

//   // Validación básica
//   if (!name || !email || !message) {
//     return new Response(
//       JSON.stringify({ message: 'Faltan campos requeridos' }),
//       { status: 400 }
//     );
//   }

//   try {
//     const send = await resend.emails.send({
//       from: 'Fortitude Website <onboarding@resend.dev>', // O tu dominio verificado: contacto@fortitudeins.us
//       to: ['Jesus.perez@fortitudeins.us'], // El correo donde quieres recibir las leads
//       reply_to: email as string,
//       subject: `Nuevo Lead de ${name} - Interés: ${type}`,
//       html: `
//         <h1>Nuevo Mensaje de Contacto</h1>
//         <p><strong>Nombre:</strong> ${name}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Teléfono:</strong> ${phone}</p>
//         <p><strong>Tipo de Seguro:</strong> ${type}</p>
//         <hr />
//         <p><strong>Mensaje:</strong></p>
//         <p>${message}</p>
//       `,
//     });

//     if (send.error) {
//       return new Response(JSON.stringify({ message: send.error.message }), {
//         status: 500,
//       });
//     }

//     return new Response(
//       JSON.stringify({ message: 'Correo enviado con éxito' }),
//       { status: 200 }
//     );
//   } catch (error) {
//     return new Response(
//       JSON.stringify({ message: 'Error interno del servidor' }),
//       { status: 500 }
//     );
//   }
// };