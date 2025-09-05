import React from 'react'
import Header from '../Layout/ClientHeader'
import HeroSection from '../Layout/HeroSection';
import ProductListing from '../Layout/ProductListing';
import ClientFooter from '../Layout/ClientFooter';
import  LocalisationSection from '../Layout/LocalisationSection';
import BrandSection from '../Layout/Brands';

 const Home = () => {
  return (
    <div>
      <Header />
      <HeroSection />
      <BrandSection/>
    < ProductListing/>
      <LocalisationSection/>
      <ClientFooter/>
    </div>
  )
}
export default Home
