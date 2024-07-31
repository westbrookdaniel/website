/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{public,src,_includes}/**/*.{html,js,njk}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Bianzhidai-Pearl", "sans-serif"],
        body: ["GeneralSans-Variable", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
