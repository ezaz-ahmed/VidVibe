import { useEffect } from 'react';
import './Preloader.css';

const Preloader = () => {
  const preloaderFun = () => {
    let preload = document.querySelector('.preloader');
    setTimeout(() => {
      preload.style.opacity = '0';
      setTimeout(() => {
        preload.style.display = 'none';
      }, 1000);
    }, 3000);
  };

  useEffect(() => {
    preloaderFun();
  }, []);

  return (
    <div className="preloader">
      <div class="spinner_wrap">
        <div class="spinner" />
      </div>
    </div>
  );
};

export default Preloader;
