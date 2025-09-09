// App.jsx
import AppRoutes from "./Routes";
import { Helmet } from "react-helmet";

function App() {
  return (
    <>
      <Helmet>
        <title>Parasaffona | Parapharmacie & Santé à Dakhla</title>
        <meta name="description" content="أفضل منصة صيدليات وبارافارماسية في الداخلة توفر منتجات للعناية بالبشرة والشعر والمكملات الغذائية." />
        
        {/* Open Graph */}
        <meta property="og:title" content="Parasaffona | أفضل منصة بارافارماسية" />
        <meta property="og:description" content="اكتشف أفضل منتجات الصيدليات في الداخلة مع Parasaffona." />
        <meta property="og:image" content="https://parasaffona.com/logo.jpg" />
        <meta property="og:url" content="https://parasaffona.com" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Parasaffona | أفضل منصة بارافارماسية" />
        <meta name="twitter:description" content="منتجات العناية بالبشرة والشعر والمكملات الغذائية في الداخلة." />
        <meta name="twitter:image" content="https://parasaffona.com/logo.jpg" />
      </Helmet>

      <AppRoutes />
    </>
  );
}

export default App;
