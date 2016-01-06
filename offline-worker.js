/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */


(function (self) {
  'use strict';

  // On install, cache resources and skip waiting so the worker won't
  // wait for clients to be closed before becoming active.
  self.addEventListener('install', function (event) {
    event.waitUntil(oghliner.cacheResources().then(function () {
      return self.skipWaiting();
    }));
  });

  // On activation, delete old caches and start controlling the clients
  // without waiting for them to reload.
  self.addEventListener('activate', function (event) {
    event.waitUntil(oghliner.clearOtherCaches().then(function () {
      return self.clients.claim();
    }));
  });

  // Retrieves the request following oghliner strategy.
  self.addEventListener('fetch', function (event) {
    if (event.request.method === 'GET') {
      event.respondWith(oghliner.get(event.request));
    } else {
      event.respondWith(self.fetch(event.request));
    }
  });

  var oghliner = self.oghliner = {

    // This is the unique prefix for all the caches controlled by this worker.
    CACHE_PREFIX: 'offline-cache:mozilla/progressive-apps-hq:' + (self.registration ? self.registration.scope : '') + ':',

    // This is the unique name for the cache controlled by this version of the worker.
    get CACHE_NAME() {
      return this.CACHE_PREFIX + '6f33a5e8066a43b66ec856fa59a17448ed25424d';
    },

    // This is a list of resources that will be cached.
    RESOURCES: [
      './', // cache always the current root to make the default page available
      './about.html', // 00d2c791a2481b8b0998ecb1f02ec245afda83c7
      './android-icon-144x144.png', // ac5f36b82a2d82127d03495fbff70a6016ac6b97
      './android-icon-192x192.png', // 4ceef14cf553858e1cefe454539e33f8e9afb77d
      './android-icon-36x36.png', // f2e34b02d00aa35676403a57e6efcafa6bd530ee
      './android-icon-48x48.png', // d0c5c828aec4a4b7a68c00fd6524cf6707a033a4
      './android-icon-72x72.png', // 4cd39c45b934cace45f04d8d59ef159639a44afb
      './android-icon-96x96.png', // 1a7295095eff897954726e7751ce46f737cb2416
      './apple-icon-114x114.png', // 7f8edf331d18e1f66b9a1f8d82caff751be77fbf
      './apple-icon-120x120.png', // 6ee7df1c84d7d9bfa785ef3d356068486cb9dd19
      './apple-icon-144x144.png', // ac5f36b82a2d82127d03495fbff70a6016ac6b97
      './apple-icon-152x152.png', // 1a6332a22174d3d85d547bef65bb915961890dc3
      './apple-icon-180x180.png', // 7a3797be07e78b6deaf3c04c4bdcd75108753aaf
      './apple-icon-57x57.png', // 539c5b13b62c5c5977537bbaf10e8e2677bfd95c
      './apple-icon-60x60.png', // 41acb1c0441b94dd87cd3abffc3e62a35eb573cd
      './apple-icon-72x72.png', // 4cd39c45b934cace45f04d8d59ef159639a44afb
      './apple-icon-76x76.png', // b08feab0a917659b2237f22f7a93cf874168460a
      './apple-icon-precomposed.png', // 312ea5980cd3a4668f3599447250f87d33c4602d
      './apple-icon.png', // 312ea5980cd3a4668f3599447250f87d33c4602d
      './browserconfig.xml', // 853389b6c4273965899eb1302d665eb91395fd0c
      './favicon-16x16.png', // fc032158a3fe81e74187f5a7eabd422cf54f47b6
      './favicon-32x32.png', // 6b1de3ac0660a3aa8db425d4debcf02a61c16b22
      './favicon-96x96.png', // 1a7295095eff897954726e7751ce46f737cb2416
      './favicon.ico', // e07b43f940184138d77857cdbdbe0a592bd573a8
      './favicon.png', // 2fe87b3f9d05988c8d35c195f1cb57debc3a5020
      './index.html', // 36404c0bbd0baadac6dd548b00b5b18980d9668a
      './manifest.json', // d083563961744515554fba97dfa8138f2f6d8ad5
      './ms-icon-144x144.png', // ac5f36b82a2d82127d03495fbff70a6016ac6b97
      './ms-icon-150x150.png', // 02d66ca7d6531c79bbbd02182cc25e8483f08859
      './ms-icon-310x310.png', // 491a3a6e4158cdc5c27df724e03a27fa18e8a991
      './ms-icon-70x70.png', // efdda126eaabaf42a4501a05ce3010fe9042b55f
      './offline-manager.js', // e2e09e000c5b64035940ae44e9c0936eb25ecd51
      './README.md', // a5b6dd31b515a94daa586a5bad21f3b416acb6af

    ],

    // Adds the resources to the cache controlled by this worker.
    cacheResources: function () {
      var now = Date.now();
      var baseUrl = self.location;
      return this.prepareCache()
      .then(function (cache) {
        return Promise.all(this.RESOURCES.map(function (resource) {
          // Bust the request to get a fresh response
          var url = new URL(resource, baseUrl);
          var bustParameter = (url.search ? '&' : '') + '__bust=' + now;
          var bustedUrl = new URL(url.toString());
          bustedUrl.search += bustParameter;

          // But cache the response for the original request
          var requestConfig = { credentials: 'same-origin' };
          var originalRequest = new Request(url.toString(), requestConfig);
          var bustedRequest = new Request(bustedUrl.toString(), requestConfig);
          return fetch(bustedRequest).then(function (response) {
            if (response.ok) {
              return cache.put(originalRequest, response);
            }
            console.error('Error fetching ' + url + ', status was ' + response.status);
          });
        }));
      }.bind(this));
    },

    // Remove the offline caches not controlled by this worker.
    clearOtherCaches: function () {
      var deleteIfNotCurrent = function (cacheName) {
        if (cacheName.indexOf(this.CACHE_PREFIX) !== 0 || cacheName === this.CACHE_NAME) {
          return Promise.resolve();
        }
        return self.caches.delete(cacheName);
      }.bind(self);

      return self.caches.keys()
      .then(function (cacheNames) {
        return Promise.all(cacheNames.map(deleteIfNotCurrent));
      });

    },

    // Get a response from the current offline cache or from the network.
    get: function (request) {
      return this.openCache()
      .then(function (cache) {
        return cache.match(request);
      })
      .then(function (response) {
        if (response) {
          return response;
        }
        return self.fetch(request);
      });
    },

    // Prepare the cache for installation, deleting it before if it already exists.
    prepareCache: function () {
      return self.caches.delete(this.CACHE_NAME).then(this.openCache.bind(this));
    },

    // Open and cache the offline cache promise to improve the performance when
    // serving from the offline-cache.
    openCache: function () {
      if (!this._cache) {
        this._cache = self.caches.open(this.CACHE_NAME);
      }
      return this._cache;
    }

  };
}(self));
