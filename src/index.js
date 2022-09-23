import 'bootstrap/scss/bootstrap.scss';
import './styles/all.css';
import 'leaflet/dist/leaflet.css';
import './js/images';

import * as L from 'leaflet';
import * as PIXI from 'pixi.js';
import 'leaflet-pixi-overlay';

const genPopContent = function(s){

    return `<div style="width: 100%;height: 100px;background: white">
          <img src="${s.Picture}" alt="Picture1" width="100%" height="100" style="object-fit: cover">
      </div>
      <div class="card border-0">
        <div class="card-header h5 fw-bolder">
            ${s.Name}
        </div>
        <div class="card-body">
              <p> ${s.Description}</p>
              <hr/>
              <table class="table table-borderless">
                  <tbody>
                      <tr>
                          <td><img alt="" width="15" height="15" src="https://www.gstatic.com/images/icons/material/system_gm/1x/place_gm_blue_24dp.png"></td>
                          <td>${s.Add}</td>
                      </tr>
                      <tr>
                          <td><img alt="" width="15" height="15" src="https://www.gstatic.com/images/icons/material/system_gm/1x/schedule_gm_blue_24dp.png"></td>
                          <td>${s.Opentime}</td>
                      </tr>
                      <tr>
                          <td><img alt="" width="15" height="15" src="https://www.gstatic.com/images/icons/material/system_gm/1x/phone_gm_blue_24dp.png"></td>
                          <td>${s.tel}</td>
                      </tr>
                  </tbody>
              </table>
        </div>
      </div>`;
};

function getRandom(min, max) {
    return min + Math.random() * (max - min);
}

window.addEventListener('load', async () => {
    const center = [24, 120];
    const zoom = 10; // 0 - 18

    const baselayers = {
        'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
        'Google.Street': L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }),
        'Google.Sat ': L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }),

    };
    if (navigator && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            center[0] = position.coords.latitude;
            center[1] = position.coords.longitude;
        });
    }

    const map = L.map('Map').setView(center, zoom);
    map.setMaxZoom(15);
    map.setMinZoom(3);

    const overlays = {};
    L.control.layers(baselayers, overlays).addTo(map);
    baselayers['Google.Street'].addTo(map);

    const loader = new PIXI.Loader;
    loader.add('marker', 'assets/icons/store-svgrepo-com.svg');
    loader.load((loader, resources) => {
        const texture = resources.marker.texture;

        const pixiLayer = (()=> {
            let frame = null;
            let firstDraw = true;
            let prevZoom;
            const stores = [];
            for (let i = 0; i < 100000; i++) {
                stores.push({
                    'Id': 'C1_313020000G_000026',
                    'Name': '宏亞食品巧克力觀光工廠',
                    'Description': '巧克力共和國是一座以巧克力為主題的觀光工廠，建築設計、館內主題設計皆以巧克力為主題，這裡也提供豐富的巧克力相關知識，亦可以DIY創作巧克力，為一寓教於樂、適合親子休閒娛樂的絕佳去處。',
                    'Tel': '886-3-3656555',
                    'Add': '桃園縣八德市建國路386號',
                    'Opentime': '每天早上8:00 - 14:00',
                    'Picture': 'https://www.eastcoast-nsa.gov.tw/image/28701/640x480',
                    Py: getRandom(100, -100),
                    Px: getRandom(200, -200)
                });
            }

            const markers = [...stores].map(s=>{
                const marker = new PIXI.Sprite(texture);
                marker.popup = L.popup()
                    .setLatLng([s.Py , s.Px])
                    .setContent(genPopContent(s));

                marker.interactive = true;
                marker.Py = s.Py;
                marker.Px = s.Px;
                return marker;
            });



            const pixiContainer = new PIXI.Container();
            pixiContainer.addChild(...markers);
            pixiContainer.interactive = true;
            pixiContainer.buttonMode = true;

            const doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

            return L.pixiOverlay(function(utils) {
                if (frame) {
                    cancelAnimationFrame(frame);
                    frame = null;
                }
                const zoom = utils.getMap().getZoom();
                const container = utils.getContainer();
                const renderer = utils.getRenderer();
                const project = utils.latLngToLayerPoint;
                const scale = utils.getScale();

                if (firstDraw) {
                    utils.getMap().on('click', function(e) {
                        const interaction = utils.getRenderer().plugins.interaction;
                        const pointerEvent = e.originalEvent;
                        const pixiPoint = new PIXI.Point();
                        interaction.mapPositionToPoint(pixiPoint, pointerEvent.clientX, pointerEvent.clientY);
                        const target = interaction.hitTest(pixiPoint, container);
                        if (target && target.popup) {
                            target.popup.openOn(map);
                        }
                    });

                    markers.forEach(marker=>{
                        const markerCoords = project([marker.Py , marker.Px]);
                        marker.x = markerCoords.x;
                        marker.y = markerCoords.y;
                        marker.anchor.set(0.01, 0.01);
                        if( (0.1/scale) < 0.5){
                            marker.scale.set(0.1/scale);
                        }else{
                            marker.scale.set(0.5);

                        }
                    });

                }

                const duration = 100;
                let start;
                function animate(timestamp) {
                    let progress;
                    if (start === null) start = timestamp;
                    progress = timestamp - start;

                    markers.forEach(marker=>{
                        if( (0.1/scale) < 0.5){
                            marker.scale.set(0.1/scale);
                        }else{
                            marker.scale.set(0.5);

                        }
                    });

                    renderer.render(container);
                    if (progress < duration) {
                        frame = requestAnimationFrame(animate);
                    }
                }

                if (!firstDraw && prevZoom !== zoom) {
                    start = null;
                    frame = requestAnimationFrame(animate);
                }

                firstDraw = false;
                prevZoom = zoom;
                renderer.render(container);
            }, pixiContainer, {
                doubleBuffering: doubleBuffering,
                autoPreventDefault: false
            });
        })();
        pixiLayer.addTo(map);
    });
});


