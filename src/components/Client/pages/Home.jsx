import React from 'react';
import Meta from '../../../Meta'; // path صحيح حسب المكان ديال الملف
import Header from '../Layout/ClientHeader';
import HeroSection from '../Layout/HeroSection';
import ProductListing from '../Layout/ProductListing';
import ClientFooter from '../Layout/ClientFooter';
import LocalisationSection from '../Layout/LocalisationSection';
import BrandSection from '../Layout/Brands';

const Home = () => {
  return (
    <div>
      {/* ✅ Meta Component */}
      <Meta
        title="Parasaffona | الصفحة الرئيسية"
        description="أفضل منصة صيدليات وبارافارماسية في الداخلة، تقدم منتجات العناية بالبشرة، المكملات الغذائية، منتجات الأطفال والمزيد."
        image="https://parasaffona.com/logo.jpg"
        url="https://parasaffona.com/"
      />

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
