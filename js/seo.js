document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.endsWith("index.html") || path === "/" || path === "") {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CafeOrCoffeeShop",
      "name": "Hugoffee",
      "image": "https://hugoffee.com/Imagenes/logo.jpg",
      "description": "Cafetería de especialidad en Arnedo con cafés de origen y repostería artesanal.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Paseo Constitución",
        "addressLocality": "Arnedo",
        "addressRegion": "La Rioja",
        "postalCode": "26580",
        "addressCountry": "ES"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 42.223247,
        "longitude": -2.102634
      },
      "servesCuisine": ["Coffee", "Bakery", "Desayunos"],
      "priceRange": "€"
    });
    document.head.appendChild(script);
  } else if (path.endsWith("menu.html")) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Menu",
      "name": "Menú Hugoffee",
      "description": "Carta de cafés de especialidad, repostería artesanal y opciones saladas.",
      "hasMenuSection": [
        {
          "@type": "MenuSection",
          "name": "Bebida",
          "description": "Cafés de especialidad, calientes y fríos."
        },
        {
          "@type": "MenuSection",
          "name": "Comida",
          "description": "Repostería artesanal dulce y tostadas saladas."
        },
        {
          "@type": "MenuSection",
          "name": "Granos de Café",
          "description": "Granos de origen, mezclas y descafeinado."
        }
      ]
    });
    document.head.appendChild(script);
  }
});