var site = site || {};
site.window = $(window);
site.document = $(document);
site.Width = site.window.width();
site.Height = site.window.height();

// Детекция мобильных устройств
function isMobileDevice() {
   return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
          window.innerWidth <= 768;
}

// Проверка настроек пользователя на анимации
function userPrefersReducedMotion() {
   return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

var Background = function() {

};

Background.headparticle = function() {   

   // Проверяем настройки пользователя
   if (userPrefersReducedMotion()) {
      Background.showStaticFallback();
      return;
   }

   // Проверяем поддержку WebGL
   if ( !Modernizr.webgl ) {
      console.log('WebGL not supported');
      Background.showFallback();
      return;
   }

   // На мобильных устройствах показываем упрощенную версию
   if (isMobileDevice()) {
      Background.showMobileFallback();
      return;
   }

   var camera, scene, renderer;
   var mouseX = 0, mouseY = 0;
   var p;

   var windowHalfX = site.Width / 2;
   var windowHalfY = site.Height / 2;

   Background.camera = new THREE.PerspectiveCamera( 35, site.Width / site.Height, 1, 2000 );
   Background.camera.position.z = 300;

   // scene
   Background.scene = new THREE.Scene();

   // texture
   var manager = new THREE.LoadingManager();
   manager.onProgress = function ( item, loaded, total ) {
      //console.log('webgl, twice??');
      //console.log( item, loaded, total );
   };


   // particles
   var p_geom = new THREE.Geometry();
   var p_material = new THREE.ParticleBasicMaterial({
      // color: 0xD6D9E1,
      color: 0xFFFFFF,
      size: 1.9
   });

   // model
   var loader = new THREE.OBJLoader( manager );
   loader.load( 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/40480/head.obj', function ( object ) {

      object.traverse( function ( child ) {

         if ( child instanceof THREE.Mesh ) {

            // child.material.map = texture;

            var scale = 8;

            $(child.geometry.vertices).each(function() {
               p_geom.vertices.push(new THREE.Vector3(this.x * scale, this.y * scale, this.z * scale));
            })
         }
      });

      Background.scene.add(p)
   });

   p = new THREE.ParticleSystem(
      p_geom,
      p_material
      );

   Background.renderer = new THREE.WebGLRenderer({ alpha: true });
   Background.renderer.setSize( site.Width, site.Height );
   Background.renderer.setClearColor(0x000000, 0);

   $('.particlehead').append(Background.renderer.domElement);
   $('.particlehead').on('mousemove', onDocumentMouseMove);
   
   // Добавляем поддержку touch событий для мобильных устройств
   $('.particlehead').on('touchmove', function(event) {
      if (event.touches.length > 0) {
         onDocumentMouseMove(event.touches[0]);
      }
   });
   
   site.window.on('resize', onWindowResize);

   function onWindowResize() {
      site.Width = site.window.width();
      site.Height = site.window.height();
      windowHalfX = site.Width / 2;
      windowHalfY = site.Height / 2;

      Background.camera.aspect = site.Width / site.Height;
      Background.camera.updateProjectionMatrix();

      Background.renderer.setSize( site.Width, site.Height );
   }

   function onDocumentMouseMove( event ) {
      mouseX = ( event.clientX - windowHalfX ) / 2;
      mouseY = ( event.clientY - windowHalfY ) / 2;
   }

   // Оптимизация производительности
   var isVisible = true;
   var animationId;
   
   // Проверяем видимость страницы для паузы анимации
   document.addEventListener('visibilitychange', function() {
      isVisible = !document.hidden;
      if (!isVisible && animationId) {
         cancelAnimationFrame(animationId);
      } else if (isVisible) {
         animate();
      }
   });

   function animate() {
      if (isVisible) {
         animationId = requestAnimationFrame(animate);
         render();
      }
   }

   Background.animate = function() { 
      animate();
   }

   function render() {
      Background.camera.position.x += ( (mouseX * .5) - Background.camera.position.x ) * .05;
      Background.camera.position.y += ( -(mouseY * .5) - Background.camera.position.y ) * .05;

      Background.camera.lookAt( Background.scene.position );

      Background.renderer.render( Background.scene, Background.camera );
   }

   Background.animate();
};


// Функции для альтернативных вариантов
Background.showFallback = function() {
   $('.particlehead').html('<div class="fallback-animation"><div class="animated-gradient"></div></div>');
};

Background.showMobileFallback = function() {
   $('.particlehead').html(`
      <div class="mobile-animation">
         <div class="floating-particles">
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
         </div>
         <div class="animated-logo">
            <div class="logo-circle"></div>
         </div>
      </div>
   `);
};

Background.showStaticFallback = function() {
   $('.particlehead').html(`
      <div class="static-fallback">
         <div class="static-logo">
            <div class="logo-ring"></div>
         </div>
      </div>
   `);
};

Background.headparticle();