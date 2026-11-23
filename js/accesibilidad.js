document.addEventListener("DOMContentLoaded", () => {
  const categoryButtons = [...document.querySelectorAll(".main-cat-btn")];
  const subcategoryButtons = [...document.querySelectorAll(".sub-cat-btn")];
  const dateButtons = [...document.querySelectorAll(".checkout-date-chip")];
  const update = () => {
    categoryButtons.forEach((button) => {
      const selected = button.classList.contains("active");
      button.setAttribute("aria-pressed", String(selected));
      button.setAttribute("aria-expanded", String(selected));
    });
    subcategoryButtons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.classList.contains("active")),
      );
    });
    dateButtons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.classList.contains("active")),
      );
    });
  };
  update();
  const controls = [...categoryButtons, ...subcategoryButtons, ...dateButtons];
  controls.forEach((button) =>
    button.addEventListener("click", () => queueMicrotask(update)),
  );
  if (controls.length) {
    const observer = new MutationObserver(update);
    controls.forEach((control) =>
      observer.observe(control, {
        attributes: true,
        attributeFilter: ["class"],
      }),
    );
  }
});
