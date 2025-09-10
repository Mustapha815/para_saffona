import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../Layout/ClientHeader';
import HeroSection from '../Layout/HeroSection';
import ProductListing from '../Layout/ProductListing';
import ClientFooter from '../Layout/ClientFooter';
import LocalisationSection from '../Layout/LocalisationSection';
import BrandSection from '../Layout/Brands';

const Home = () => {
  return (
    <div>
      {/* ✅ Meta tags for SEO and Social Sharing */}
      <Helmet>
        <title>Parasaffona | الصفحة الرئيسية</title>
        <meta
          name="description"
          content="أفضل منصة صيدليات وبارافارماسية في الداخلة، تقدم منتجات العناية بالبشرة، المكملات الغذائية، منتجات الأطفال والمزيد."
        />
        <meta property="og:title" content="Parasaffona | أفضل منصة بارافارماسية في الداخلة" />
        <meta
          property="og:description"
          content="اكتشف أفضل منتجات الصيدليات في الداخلة: العناية بالبشرة، المكملات الغذائية، منتجات الأطفال والمزيد."
        />
        <meta property="og:image" content="https://parasaffona.com/logo.jpg" />
        <meta property="og:url" content="https://parasaffona.com/" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Parasaffona | الصفحة الرئيسية" />
        <meta
          name="twitter:description"
          content="أفضل منصة صيدليات وبارافارماسية في الداخلة، منتجات العناية بالبشرة، المكملات الغذائية، منتجات الأطفال والمزيد."
        />
        <meta name="twitter:image" content="https://parasaffona.com/logo.jpg" />
      </Helmet>

      {/* الصفحة نفسها */}
      <Header />
      <HeroSection />
      <BrandSection />
      <ProductListing />
      <LocalisationSection />
      <ClientFooter />
    </div>
  );
};

export default Home;
