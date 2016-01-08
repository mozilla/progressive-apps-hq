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
      return this.CACHE_PREFIX + '0e059128a377a73ced9567a3a96411d4668c40e1';
    },

    // This is a list of resources that will be cached.
    RESOURCES: [
      './about.html', // 2e6a33f268f92348529dadff4f75263f6501da5a
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
      './css/style.css', // dfbbffbbfda657b13d83f2ad136723e0e42cf048
      './favicon-16x16.png', // fc032158a3fe81e74187f5a7eabd422cf54f47b6
      './favicon-32x32.png', // 6b1de3ac0660a3aa8db425d4debcf02a61c16b22
      './favicon-96x96.png', // 1a7295095eff897954726e7751ce46f737cb2416
      './favicon.ico', // e07b43f940184138d77857cdbdbe0a592bd573a8
      './favicon.png', // 2fe87b3f9d05988c8d35c195f1cb57debc3a5020
      './features/discoverable/index.html', // be6051a8ddc7caef13429eee2af11990b307c52b
      './features/fresh/index.html', // 8017866c69f3cd0662cb10cf47681ea9d5a0a8ce
      './features/installable/index.html', // 5bba9e8de63f75445a8a44783a43428a7212bf70
      './features/linkable/index.html', // ff28721e7241cbceb6ab759c5711a5961aba8fab
      './features/network-independent/index.html', // 53d27bb710b040ea63640d45f0eb6e7dac12aad2
      './features/progressive/index.html', // 8c7e8d16fdb2e5c4bfbfee8ea0f0410b1e6c04d8
      './features/re-engageable/index.html', // 8167fcb48cf6daf5fbf09721daab232ccc4e5a2b
      './features/responsive/index.html', // fc639abb462d9b31287b9e71cb0fabcd6348139e
      './features/safe/index.html', // 129c8b3f9ca5312485aa550deef6164ac28308d9
      './icons/demo.svg', // a1bdd982b02620d826d543975f7f0c50ed5ef7b9
      './icons/discoverable.svg', // 7a97b0a6156516a23744ef2d2422df1472ec9765
      './icons/doc.svg', // 78cf1e74844ade439c94029b63a665bc776c75d0
      './icons/fresh.svg', // b3bc593dede3625a0210f68999d5f6615aa56cd0
      './icons/installable.svg', // 8bda05c039fffa8204cec71e30a172d3bfeb9435
      './icons/linkable.svg', // 2c58211f28a13ee01a822aabd21671e215e06f5a
      './icons/network-independent.svg', // 90003b580855d015f30925b7c2cb6b859ae75b49
      './icons/progressive-hq-blue.svg', // cf0c0cef69cc86399850bb9210f18d2cd372005b
      './icons/progressive-hq.svg', // fe9fcc20a26b224129217b97d5c2c0581f28bc35
      './icons/progressive.svg', // ff2dcc52a44cdc5906d0d966bbff894e4ff4d36f
      './icons/re-engageable.svg', // 7660cbfc39a8643d5316eb59c197d5096f9c9e8e
      './icons/responsive.svg', // 0bafccfb0529dbf57ac4604ac56fd285113c3a28
      './icons/safe.svg', // 0eddfa2e2b6545c927ac72f9b039e8ba5c3eddcd
      './icons/search.svg', // 68d67865299298b3e3de5f16a6db1ab14afe3d71
      './icons/spec.svg', // 59295e3d8de110fad0e6ffafba092ceee40f19a3
      './icons/status.svg', // 1be7d898774b8f0daeb30573ec2802c077d8d18a
      './icons/tool.svg', // 6d8df314cc039a2c6edebaef409f1d76c2ebd1ae
      './index.html', // 13d9dc772ae43cf0d3bed4e1c6a38ce3005c8378
      './manifest.json', // d083563961744515554fba97dfa8138f2f6d8ad5
      './ms-icon-144x144.png', // ac5f36b82a2d82127d03495fbff70a6016ac6b97
      './ms-icon-150x150.png', // 02d66ca7d6531c79bbbd02182cc25e8483f08859
      './ms-icon-310x310.png', // 491a3a6e4158cdc5c27df724e03a27fa18e8a991
      './ms-icon-70x70.png', // efdda126eaabaf42a4501a05ce3010fe9042b55f
      './offline-manager.js', // e2e09e000c5b64035940ae44e9c0936eb25ecd51
      './technologies/add-to-homescreen/index.html', // 27e2a3e2947f7407aa69c16dc5a620060198c1b6
      './technologies/app-shell/index.html', // 1a28f89cc729cfb30a70cfca6f42cd06fe3233b8
      './technologies/background-sync/index.html', // 70709ab882824291377f4f2e2f848d2692398c9e
      './technologies/media-query/index.html', // 1790d840e501c2d408f3654069a6b7eaecd5a637
      './technologies/push-api/index.html', // 26f90835213e949116b8ffe001404aa565dc9416
      './technologies/service-workers/index.html', // 2cda5e1a14125a67999c465a59e48c4235d4c2f9
      './technologies/web-manifest/index.html', // b286ee2d624db90801b8f6f107416553b98c2cd9

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
      }.bind(this);

      return self.caches.keys()
      .then(function (cacheNames) {
        return Promise.all(cacheNames.map(deleteIfNotCurrent));
      });

    },

    // Get a response from the current offline cache or from the network.
    get: function (request) {
      var extendToIndex = this.extendToIndex.bind(this);
      return this.openCache()
      .then(function (cache) {
        return cache.match(extendToIndex(request));
      })
      .then(function (response) {
        if (response) {
          return response;
        }
        return self.fetch(request);
      });
    },

    // Make requests to directories become requests to index.html
    extendToIndex: function (request) {
      var url = request.url;
      if (url[url.length - 1] === '/') {
        url += 'index.html';
      }
      return new Request(url, request);
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
