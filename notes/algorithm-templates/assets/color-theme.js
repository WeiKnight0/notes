(() => {
  const savedTheme = localStorage.getItem('wkn-color-theme');
  const theme = savedTheme === 'light' || savedTheme === 'dark'
    ? savedTheme
    : matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

  const applyTheme = (value) => {
    document.documentElement.dataset.colorTheme = value;
    document.documentElement.style.colorScheme = value;
    document.querySelectorAll('.theme-toggle').forEach((button) => {
      const dark = value === 'dark';
      const label = dark ? 'Switch to light theme' : 'Switch to dark theme';
      button.setAttribute('aria-label', label);
      button.title = label;
      button.querySelector('span').textContent = dark ? '☀' : '☾';
    });
  };

  applyTheme(theme);
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(theme);
    document.querySelectorAll('.theme-toggle').forEach((button) => {
      button.addEventListener('click', () => {
        const next = document.documentElement.dataset.colorTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('wkn-color-theme', next);
        applyTheme(next);
      });
    });
  });
})();
