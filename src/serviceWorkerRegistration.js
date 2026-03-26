export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);

    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (window.location.hostname === 'localhost') {
        checkValidServiceWorker(swUrl, config);

        navigator.serviceWorker.ready.then(() => {
          console.log('App is running in cache-first mode.');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker.register(swUrl).then((registration) => {
    if (config && config.onSuccess) {
      config.onSuccess(registration);
    }
  });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl)
    .then(() => registerValidSW(swUrl, config))
    .catch(() => console.log('Offline mode'));
}