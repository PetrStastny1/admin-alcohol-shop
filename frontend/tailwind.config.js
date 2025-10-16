/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#f5faff',100:'#e6f0ff',500:'#3366ff',600:'#254eda',700:'#1b3db3' }
      }
    }
  },
  plugins: [],
};
