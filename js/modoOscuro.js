document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const moonIcon = document.getElementById('moonIcon');
  const sunIcon = document.getElementById('sunIcon');

  if (!themeToggleBtn || !moonIcon || !sunIcon) return;

  const updateIcons = (isDark) => {
    if (isDark) {
      moonIcon.style.display = 'none';
      sunIcon.style.display = 'block';
    } else {
      moonIcon.style.display = 'block';
      sunIcon.style.display = 'none';
    }
  };

  const savedTheme = localStorage.getItem('hugoffee_theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    updateIcons(true);
  } else {
    updateIcons(false);
  }

  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('hugoffee_theme', isDark ? 'dark' : 'light');
    updateIcons(isDark);
  });
});