
import React from "react";
import { Phone, MapPin, MessageCircle, Navigation, Clock } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function LocalisationSection() {
  const { t } = useLanguage();
  const phoneNumber = "+212600000000";
  const whatsappNumber = "212600000000";
  const destination = "23.700881106613554, -15.931406707705198";

  return (
    <section  className="w-full py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('visitUs')}</h2>
          <p className="text-gray-600 max-w-md mx-auto text-lg">
            {t('comeVisitUs')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {/* الخريطة */}
          <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
            <div className="relative h-full">
              <iframe
                className="w-full h-96 lg:h-full"
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25398.859191492316!2d-15.960059916075084!3d23.70174297779025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xc2249e289d386ed%3A0x7abcf988a836274f!2sparasaffona!5e0!3m2!1sen!2s!4v1756855296203!5m2!1sen!2s`}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map Location"
              />
              <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium">{t('weAreHere')}</span>
              </div>
            </div>
          </div>

          {/* معلومات الموقع */}
          <div className="w-full lg:w-1/2 bg-white rounded-2xl p-6 shadow-xl border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MapPin className="text-blue-500" />
                {t('ourLocation')}
              </h3>
              
              <div className="mb-8">
                <p className="text-lg font-medium text-gray-700 mb-1">Parasaffona</p>
                <p className="text-gray-600"> Ave Al Mokaouama </p>
                {/* <p className="text-sm text-blue-500 mt-1">(قريب من المعلم الشهير)</p> */}
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">{t('hoursOfWork')}</h4>
                    <p className="text-gray-600">{t('hoursOfWork2')}</p>
                    {/* <p className="text-sm text-blue-500 mt-1">مفتوح خلال العطل الرسمية</p> */}
                  </div>
                </div>

            
              </div>
            </div>

            {/* أزرار الاتصال */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${destination}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Navigation className="w-5 h-5" />
                {t('getDirection')}
              </a>
              
              <a
                href={`tel:${phoneNumber}`}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Phone className="w-5 h-5" />
                {t('callNow')}
              </a>

              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}