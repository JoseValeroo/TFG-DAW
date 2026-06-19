import { useState } from 'react';
import { BadgeCheck, Ban, PenLine, TrendingUp, Crown, Headphones, Check } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import './Premium.css';

const features = [
  { icon: BadgeCheck, title: 'Insignia de verificación', text: 'Destaca con la marca azul y demuestra que eres tú.' },
  { icon: Ban, title: 'Sin anuncios', text: 'Disfruta de un feed limpio, sin interrupciones.' },
  { icon: PenLine, title: 'Editar publicaciones', text: 'Corrige tus posts después de publicarlos.' },
  { icon: TrendingUp, title: 'Más alcance', text: 'Tus respuestas y posts se priorizan en las conversaciones.' },
  { icon: Crown, title: 'Funciones exclusivas', text: 'Acceso anticipado a lo nuevo antes que nadie.' },
  { icon: Headphones, title: 'Soporte prioritario', text: 'Atención preferente cuando lo necesites.' },
];

const plans = [
  {
    name: 'Básico',
    price: '3,99 €',
    period: '/mes',
    highlight: false,
    perks: ['Editar publicaciones', 'Posts más largos', 'Menos anuncios'],
  },
  {
    name: 'Premium',
    price: '8,99 €',
    period: '/mes',
    highlight: true,
    perks: ['Todo lo de Básico', 'Insignia de verificación', 'Sin anuncios', 'Más alcance'],
  },
  {
    name: 'Premium+',
    price: '16,99 €',
    period: '/mes',
    highlight: false,
    perks: ['Todo lo de Premium', 'Máximo alcance', 'Funciones exclusivas', 'Soporte prioritario'],
  },
];

function Premium() {
  const [selected, setSelected] = useState('');

  return (
    <div className="premium">
      <Sidebar />
      <main className="premium-main">
        <section className="premium-hero">
          <span className="premium-eyebrow">Lure Premium</span>
          <h1 className="premium-title">Saca más partido a Lure.</h1>
          <p className="premium-sub">
            Funciones exclusivas, insignia de verificación y la mejor experiencia.
            Diseñado para quienes quieren más.
          </p>
          <a className="apple-btn" href="#planes">Ver planes</a>
        </section>

        <section className="premium-features">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="premium-feature">
              <span className="premium-feature-icon"><Icon size={24} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </section>

        <section className="premium-plans" id="planes">
          <h2 className="premium-h2">Elige tu plan</h2>
          <p className="premium-h2-sub">Cancela cuando quieras. Sin compromisos.</p>
          <div className="plans-grid">
            {plans.map((p) => (
              <div key={p.name} className={`plan-card ${p.highlight ? 'featured' : ''}`}>
                {p.highlight && <span className="plan-badge">Más popular</span>}
                <h3 className="plan-name">{p.name}</h3>
                <div className="plan-price">
                  <span className="plan-amount">{p.price}</span>
                  <span className="plan-period">{p.period}</span>
                </div>
                <ul className="plan-perks">
                  {p.perks.map((perk) => (
                    <li key={perk}><Check size={16} /> {perk}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`apple-btn ${p.highlight ? '' : 'apple-btn-ghost'}`}
                  onClick={() => setSelected(p.name)}
                >
                  {selected === p.name ? '¡Plan seleccionado! ✨' : 'Suscríbete'}
                </button>
              </div>
            ))}
          </div>
          <p className="premium-legal">
            Demo de Lure. Los pagos no son reales. Precios con IVA incluido.
          </p>
        </section>
      </main>
    </div>
  );
}

export default Premium;
