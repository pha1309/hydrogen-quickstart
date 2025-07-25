import {Image} from '@shopify/hydrogen';

import {Swiper, SwiperSlide} from 'swiper/react';
import {Autoplay, Pagination} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

function Slider({slideshows}) {
  if (slideshows.length === 0) return null;
  return (
    <Swiper
      autoplay={{
        delay: 8000,
        disableOnInteraction: false,
      }}
      pagination={{
        dynamicBullets: true,
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
    >
      {slideshows.map((slide, index) => (
        <SwiperSlide key={slide.handle}>
          <div className="pb-(--banner-padding) relative overflow-hidden">
            <Image
              className="w-full h-full object-cover absolute top-0 left-0 z-0"
              src={slide.fields[0].reference.image.url}
              alt={slide.fields[0].reference.image.altText ?? ''}
              width={slide.fields[0].reference.image.width}
              height={slide.fields[0].reference.image.height}
              loading={index === 0 ? 'eager' : 'lazy'}
              sizes="100vw"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
export default Slider;
