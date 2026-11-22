import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  recipientEmail: string;
}

export default function ContactForm({ recipientEmail }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('Imprenta / Gran formato');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setStatus('sending');

    try {
      const resp = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          _replyto: email.trim(),
          _subject: `Nueva consulta web (${service}) — ${name.trim()}`,
          servicio: service,
          mensaje: message.trim(),
          _template: 'table',
        }),
      });

      if (resp.ok) {
        setStatus('sent');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center space-y-3">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        <h3 className="text-xl font-bold text-stone-950">¡Consulta enviada correctamente!</h3>
        <p className="max-w-md text-sm text-stone-600">
          Hemos enviado tu mensaje directamente a <strong>{recipientEmail}</strong>. Te responderemos lo antes posible.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-2 rounded-full bg-stone-900 px-5 py-2 text-xs font-bold text-white hover:bg-amber-700 transition-colors"
        >
          Enviar otra consulta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot anti-spam invisible */}
      <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Nombre</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-600 focus:bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Correo electrónico</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.es"
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-600 focus:bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1">Tipo de proyecto o servicio</label>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-600 focus:bg-white"
        >
          <option>Imprenta / Gran formato</option>
          <option>Producción editorial y maquetación de libro</option>
          <option>Maquetación y Diseño Gráfico</option>
          <option>Fotografía profesional / Dron</option>
          <option>Vídeo profesional</option>
          <option>Consulta sobre pedidos de libros</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1">Cuéntame tu idea</label>
        <textarea
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Detalles, fechas aproximadas o tirada..."
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-amber-600 focus:bg-white"
        />
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            No se pudo enviar automáticamente. Puedes escribir directamente a{' '}
            <a href={`mailto:${recipientEmail}`} className="font-bold underline">
              {recipientEmail}
            </a>
            .
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-60 transition-colors"
      >
        <Send className="h-4 w-4" />
        <span>{status === 'sending' ? 'Enviando consulta...' : 'Solicitar presupuesto sin compromiso'}</span>
      </button>
    </form>
  );
}
