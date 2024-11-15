/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        customGreen: '#007c85', // Nombre personalizado para el color
        customGreenHover:'#00585e'
      },
      height: {
        'without-layout': 'calc(100vh - 265px)',
      },
    },
  },
  plugins: [],
  important: true,
}