document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("coffeeQuizApp");
  if (!app) return;

  const questions = [
    { title: "¿Cómo te apetece hoy?", subtitle: "La temperatura importa.", options: [
      { label: "Calentito", value: "hot", emoji: "☕" },
      { label: "Bien frío y refrescante", value: "cold", emoji: "🧊" },
      { label: "Me da igual", value: "any", emoji: "✨" }
    ]},
    { title: "¿Cómo prefieres el sabor?", subtitle: "Vamos afinando tu elección.", options: [
      { label: "Intenso, con carácter", value: "strong", emoji: "⚡" },
      { label: "Suave y cremoso", value: "smooth", emoji: "🥛" },
      { label: "Dulce, para darme un capricho", value: "sweet", emoji: "🍯" }
    ]},
    { title: "¿Qué toque te llama más?", subtitle: "Elige el sabor que más te pega.", options: [
      { label: "Café clásico, sin adornos", value: "classic", emoji: "🤎" },
      { label: "Chocolate o caramelo", value: "chocolate", emoji: "🍫" },
      { label: "Canela y especias", value: "spices", emoji: "🍂" }
    ]},
    { title: "¿Qué tal te llevas con la leche?", subtitle: "Una última pregunta.", options: [
      { label: "Me encanta con leche", value: "milk", emoji: "🥛" },
      { label: "Prefiero sin leche", value: "black", emoji: "☕" },
      { label: "Cualquiera me sirve", value: "either", emoji: "💚" }
    ]}
  ];

  const drinkIds = [
    "expresso-doble", "cafe-solo", "cafe-con-leche", "cafe-bombon", "macchiato",
    "frappuccino-chocolate", "frappuccino-galleta", "iced-latte-caramel",
    "pumpkin-spice-latte", "chai-latte-arce", "moca-blanco-tostado", "chocolate-taza-especiado"
  ];
  const profiles = {
    "expresso-doble": ["hot", "strong", "classic", "black"],
    "cafe-solo": ["hot", "strong", "classic", "black"],
    "cafe-con-leche": ["hot", "smooth", "classic", "milk"],
    "cafe-bombon": ["hot", "sweet", "chocolate", "milk"],
    "macchiato": ["hot", "strong", "classic", "milk"],
    "frappuccino-chocolate": ["cold", "sweet", "chocolate", "milk"],
    "frappuccino-galleta": ["cold", "sweet", "chocolate", "milk"],
    "iced-latte-caramel": ["cold", "smooth", "chocolate", "milk"],
    "pumpkin-spice-latte": ["hot", "smooth", "spices", "milk"],
    "chai-latte-arce": ["hot", "sweet", "spices", "milk"],
    "moca-blanco-tostado": ["hot", "sweet", "chocolate", "milk"],
    "chocolate-taza-especiado": ["hot", "sweet", "spices", "milk"]
  };
  let step = -1;
  let answers = [];
  let drinksPromise;

  function safeText(text) {
    return String(text ?? "").replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
  }

  function loadDrinks() {
    if (!drinksPromise) {
      drinksPromise = (async () => {
        let response = await fetch("/datos/productos.json");
        if (!response.ok) response = await fetch("datos/productos.json");
        if (!response.ok) throw new Error("No se puede cargar la carta");
        const data = await response.json();
        return (Array.isArray(data.productos) ? data.productos : []).filter(p => drinkIds.includes(p.id));
      })().catch(error => { drinksPromise = null; throw error; });
    }
    return drinksPromise;
  }

  function renderStep() {
    const question = questions[step];
    const progress = ((step + 1) / questions.length) * 100;
    app.innerHTML = `
      <div class="coffee-quiz-progress-label"><span>PREGUNTA ${step + 1} DE ${questions.length}</span><span>${Math.round(progress)}%</span></div>
      <div class="coffee-quiz-progress"><span style="width:${progress}%"></span></div>
      <h3>${safeText(question.title)}</h3><p class="coffee-quiz-hint">${safeText(question.subtitle)}</p>
      <div class="coffee-quiz-options">${question.options.map((option, index) => `
        <button class="coffee-quiz-option" type="button" data-quiz-option="${index}"><span aria-hidden="true">${option.emoji}</span>${safeText(option.label)}<span class="coffee-quiz-arrow" aria-hidden="true">→</span></button>
      `).join("")}</div>
      <div class="coffee-quiz-navigation"><button class="coffee-quiz-back" type="button" data-quiz-back>${step === 0 ? "Volver al inicio" : "← Anterior"}</button></div>`;
  }

  function getRecommendations(drinks) {
    const scored = drinks.map((product, order) => {
      const profile = profiles[product.id];
      if (!profile) return null;
      let score = 0;
      if (answers[0] === "any" || profile[0] === answers[0]) score += 6;
      else score -= 6;
      if (profile[1] === answers[1]) score += 4;
      if (profile[2] === answers[2]) score += 3;
      if (answers[3] === "either" || profile[3] === answers[3]) score += 3;
      else score -= 3;
      return { product, score, order };
    }).filter(Boolean);
    scored.sort((a, b) => b.score - a.score || a.order - b.order);
    return scored.slice(0, 3).map(item => item.product);
  }

  function productCard(product, featured) {
    const description = product.subtitulo || product.descripcion || "Una de nuestras especialidades.";
    return `<article class="coffee-quiz-result ${featured ? "coffee-quiz-featured" : ""}">
      <div class="coffee-quiz-result-photo"><img src="${safeText(product.imagen || "")}" alt="${safeText(product.nombre)}" loading="lazy" onerror="this.style.display='none'" /></div>
      <div class="coffee-quiz-result-body">${featured ? '<span class="coffee-quiz-result-tag">TU CAFÉ IDEAL ✦</span>' : '<span class="coffee-quiz-result-tag">TAMBIÉN TE PUEDE GUSTAR</span>'}
        <h4>${safeText(product.nombre)}</h4><p>${safeText(description)}</p>
        <strong>${Number(product.precio).toFixed(2).replace(".", ",")} €</strong>
        <button type="button" class="coffee-quiz-product-button product-details-open" data-product-id="${safeText(product.id)}">Ver detalles <span aria-hidden="true">→</span></button>
      </div></article>`;
  }

  async function renderResult() {
    app.innerHTML = '<div class="coffee-quiz-loading" role="status">Buscando tu taza perfecta… ☕</div>';
    try {
      const picks = getRecommendations(await loadDrinks());
      if (!picks.length) throw new Error("Sin recomendaciones disponibles");
      app.innerHTML = `<div class="coffee-quiz-result-head"><span class="coffee-quiz-eyebrow">ENCONTRAMOS TU MATCH 🤎</span><h3>¡Esta bebida va contigo!</h3><p>Según tus respuestas, estas son nuestras recomendaciones.</p></div>
      <div class="coffee-quiz-results">${picks.map((product, index) => productCard(product, index === 0)).join("")}</div>
      <button type="button" class="coffee-quiz-restart" data-quiz-restart>↻ Repetir el test</button>`;
    } catch (error) {
      app.innerHTML = '<h3>Ups, no hemos podido cargar la carta.</h3><p>Comprueba tu conexión y vuelve a intentarlo.</p><button type="button" class="coffee-quiz-primary" data-quiz-retry>Reintentar</button>';
    }
  }

  function reset() {
    step = -1;
    answers = [];
    app.innerHTML = '<div class="coffee-quiz-start"><span class="coffee-quiz-cup" aria-hidden="true">☕</span><h3>Tu taza perfecta te espera</h3><p>Solo tienes que elegir lo que más te apetece.</p><button type="button" class="coffee-quiz-primary" data-quiz-start>Descubrir mi café <span aria-hidden="true">→</span></button></div>';
  }

  app.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.matches("[data-quiz-start], [data-quiz-restart]")) { step = 0; answers = []; renderStep(); }
    else if (button.hasAttribute("data-quiz-option")) {
      answers[step] = questions[step].options[Number(button.dataset.quizOption)].value;
      step++;
      if (step >= questions.length) renderResult(); else renderStep();
    } else if (button.hasAttribute("data-quiz-back")) {
      if (step === 0) reset(); else { step--; renderStep(); }
    } else if (button.hasAttribute("data-quiz-retry")) renderResult();
  });
});
