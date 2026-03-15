/* ================================================
   A VIA DI I PASTORI – Script principal
   ================================================
   Fonctionnalités :
     1. Menu burger (mobile)
     2. Lien actif dans la navigation selon le scroll
     3. Bouton retour en haut
     4. Formulaire de contact (mailto)
     5. Carte interactive Leaflet + OpenStreetMap
   ================================================ */


/* ------------------------------------------------
   1. MENU BURGER (MOBILE)
   Ouvre/ferme le menu sur petits écrans
   ------------------------------------------------ */
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
        navLinks.classList.toggle('open');
        // Accessibilité : indiquer l'état ouvert/fermé
        const isOpen = navLinks.classList.contains('open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Fermer le menu quand on clique sur un lien
    navLinks.querySelectorAll('a').forEach(function (lien) {
        lien.addEventListener('click', function () {
            navLinks.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
}


/* ------------------------------------------------
   2. LIEN ACTIF DANS LA NAVIGATION
   Met en surbrillance le lien correspondant à la
   section visible à l'écran lors du défilement.
   ------------------------------------------------ */
const sections  = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

function mettreAJourLienActif() {
    let positionActuelle = window.scrollY + 80; // +80 pour compenser la nav fixe

    sections.forEach(function (section) {
        const debut = section.offsetTop;
        const fin   = debut + section.offsetHeight;

        if (positionActuelle >= debut && positionActuelle < fin) {
            navAnchors.forEach(function (a) {
                a.classList.remove('active');
                if (a.getAttribute('href') === '#' + section.id) {
                    a.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', mettreAJourLienActif);
// Appel immédiat pour l'état initial
mettreAJourLienActif();


/* ------------------------------------------------
   3. BOUTON RETOUR EN HAUT
   Apparaît après 300px de défilement
   ------------------------------------------------ */
const boutonHaut = document.getElementById('back-to-top');

if (boutonHaut) {
    // Afficher/masquer selon la position de scroll
    window.addEventListener('scroll', function () {
        if (window.scrollY > 300) {
            boutonHaut.classList.add('visible');
        } else {
            boutonHaut.classList.remove('visible');
        }
    });

    // Remonter en haut au clic
    boutonHaut.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


/* ------------------------------------------------
   4. FORMULAIRE DE CONTACT (FORMSPREE)
   ================================================
   Les messages sont envoyés via Formspree :
   https://formspree.io/f/xbdzaqkz
   Nécessite une connexion internet.
   Aucun serveur personnel requis.
   ------------------------------------------------ */

const formulaire   = document.getElementById('contact-form');
const confirmation = document.getElementById('form-confirmation');
const erreur       = document.getElementById('form-erreur');

if (formulaire) {
    formulaire.addEventListener('submit', function (e) {
        e.preventDefault();

        const bouton = formulaire.querySelector('button[type="submit"]');
        bouton.disabled = true;
        bouton.textContent = 'Envoi en cours…';

        fetch(formulaire.action, {
            method:  'POST',
            body:    new FormData(formulaire),
            headers: { 'Accept': 'application/json' }
        })
        .then(function (reponse) {
            if (reponse.ok) {
                if (confirmation) confirmation.style.display = 'block';
                if (erreur)       erreur.style.display       = 'none';
                formulaire.reset();
                formulaire.style.display = 'none';
            } else {
                if (erreur)       erreur.style.display       = 'block';
                if (confirmation) confirmation.style.display = 'none';
                bouton.disabled    = false;
                bouton.textContent = 'Envoyer le message';
            }
        })
        .catch(function () {
            if (erreur)       erreur.style.display       = 'block';
            if (confirmation) confirmation.style.display = 'none';
            bouton.disabled    = false;
            bouton.textContent = 'Envoyer le message';
        });
    });
}


/* ------------------------------------------------
   5. ACTIVITÉS — ANIMATIONS
   ------------------------------------------------ */

(function () {

    var cartes = document.querySelectorAll('.activite-card');
    if (!cartes.length) return;

    /* ── Apparition au scroll (fade + montée) ──── */
    if ('IntersectionObserver' in window) {
        var observateur = new IntersectionObserver(function (entrees) {
            entrees.forEach(function (entree) {
                if (entree.isIntersecting) {
                    entree.target.classList.add('visible');
                    observateur.unobserve(entree.target);
                }
            });
        }, { threshold: 0.12 });

        cartes.forEach(function (carte, i) {
            /* délai progressif : chaque carte apparaît 70ms après la précédente */
            carte.style.transitionDelay = (i * 0.07) + 's';
            observateur.observe(carte);
        });
    } else {
        /* navigateur ancien : tout afficher directement */
        cartes.forEach(function (c) { c.classList.add('visible'); });
    }

    /* ── Effet tilt 3D au survol ─────────────────
       Perspective douce, max ±7°, remis à zéro
       quand la souris quitte la carte.           */
    cartes.forEach(function (carte) {

        carte.addEventListener('mousemove', function (e) {
            var rect    = carte.getBoundingClientRect();
            var cx      = rect.width  / 2;
            var cy      = rect.height / 2;
            var dx      = e.clientX - rect.left  - cx;
            var dy      = e.clientY - rect.top   - cy;
            var rotateX = (dy / cy) * -6;   /* max 6° en X */
            var rotateY = (dx / cx) *  6;   /* max 6° en Y */

            carte.style.transform =
                'perspective(700px)'
                + ' rotateX(' + rotateX + 'deg)'
                + ' rotateY(' + rotateY + 'deg)'
                + ' translateY(-6px)';
        });

        carte.addEventListener('mouseleave', function () {
            carte.style.transform = '';
        });
    });

}());


/* ------------------------------------------------
   6. CARTE INTERACTIVE (LEAFLET + OPENSTREETMAP)
   ================================================
   NÉCESSITE UNE CONNEXION INTERNET pour charger
   les tuiles OpenStreetMap et la bibliothèque Leaflet.

   ════ COMMENT MODIFIER LES MARQUEURS ════════════

   Modifier les coordonnées, titres, descriptions et
   liens Google Maps dans le tableau MARQUEURS_CARTE.

   Pour trouver les coordonnées d'un lieu :
     1. Aller sur maps.google.fr
     2. Clic droit sur le lieu → "Plus d'infos sur cet endroit"
     3. Les coordonnées (lat, lng) apparaissent en bas d'écran

   Pour changer le zoom (11 = vue région, 14 = vue locale) :
     modifier la variable CENTRE_ET_ZOOM.zoom
   ------------------------------------------------ */

// =====================================================
// ===== TOUT MODIFIER ICI – MARQUEURS DU PARCOURS =====
// =====================================================

var CENTRE_ET_ZOOM = {
    lat:  42.278,   // latitude du centre de la carte
    lng:  9.101,    // longitude du centre de la carte
    zoom: 11        // niveau de zoom (11 = on voit bien les 2 points)
};

var MARQUEURS_CARTE = [
    {
        // ===== POINT DE DÉPART — modifier lat/lng si besoin =====
        lat:   42.3087,
        lng:   9.1496,
        type:  'depart',
        titre: 'Corte – Départ du parcours',
        texte: 'Point de départ du parcours A Via di i Pastori.',
        gmaps: 'https://www.google.com/maps?q=42.3087,9.1496'
    },
    {
        // ===== POINT D'ARRIVÉE — modifier lat/lng si besoin =====
        // Coordonnées approximatives de la Refuge de la Sega
        // (zone de Corte / Niolo) — à affiner avec Google Maps
        lat:   42.2486,
        lng:   9.0537,
        type:  'arrivee',
        titre: 'Refuge de la Sega – Arrivée',
        texte: 'Arrivée du parcours et lieu des activités.',
        gmaps: 'https://www.google.com/maps?q=42.2486,9.0537'
    }
];

// =====================================================

// Couleurs des marqueurs
var COULEURS_MARQUEUR = {
    depart:  '#2e6b3e',  /* vert forêt */
    arrivee: '#3a6dbf'   /* bleu */
};

// ------------------------------------------------
// Initialisation — lancée APRÈS le chargement
// complet de la page (window load) pour garantir
// que le CSS est appliqué et que le conteneur
// a ses dimensions avant que Leaflet ne s'init.
// C'est la correction du bug "carte vide".
// ------------------------------------------------
window.addEventListener('load', function () {

    var conteneurCarte  = document.getElementById('carte-leaflet');
    var fallback        = document.getElementById('carte-fallback');

    if (!conteneurCarte) return;

    // Vérifier que Leaflet est disponible
    if (typeof L === 'undefined') {
        // Leaflet n'a pas pu se charger (pas de connexion ?)
        // Le fallback HTML est déjà visible par défaut
        return;
    }

    try {
        // Masquer le fallback puisque Leaflet est disponible
        if (fallback) fallback.style.display = 'none';

        // Créer la carte centrée sur le parcours
        var carte = L.map('carte-leaflet', {
            center:          [CENTRE_ET_ZOOM.lat, CENTRE_ET_ZOOM.lng],
            zoom:            CENTRE_ET_ZOOM.zoom,
            scrollWheelZoom: false  // pas de zoom involontaire au scroll de page
        });

        // Tuiles OpenStreetMap
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom:     19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        }).addTo(carte);

        // Placer chaque marqueur avec sa popup
        MARQUEURS_CARTE.forEach(function (point) {

            var couleur = COULEURS_MARQUEUR[point.type] || '#2e6b3e';

            // Icône cercle coloré
            var icone = L.divIcon({
                className: '',
                html: '<div style="'
                    + 'width:16px;height:16px;border-radius:50%;'
                    + 'background-color:' + couleur + ';'
                    + 'border:3px solid #fff;'
                    + 'box-shadow:0 2px 8px rgba(0,0,0,0.4);'
                    + '"></div>',
                iconSize:    [16, 16],
                iconAnchor:  [8, 8],
                popupAnchor: [0, -12]
            });

            // Contenu de la popup
            var popup = '<div class="popup-carte">'
                + '<h4>' + point.titre + '</h4>'
                + '<p>' + point.texte + '</p>'
                + '<a href="' + point.gmaps + '" '
                +    'target="_blank" rel="noopener noreferrer" '
                +    'class="popup-gmaps">📍 Ouvrir dans Google Maps</a>'
                + '</div>';

            L.marker([point.lat, point.lng], { icon: icone })
                .addTo(carte)
                .bindPopup(popup, { maxWidth: 260 });
        });

        // Tracer la ligne du parcours entre les deux points
        var coordonnees = MARQUEURS_CARTE.map(function (m) { return [m.lat, m.lng]; });
        L.polyline(coordonnees, {
            color:     '#2e6b3e',  /* vert forêt — même couleur que le site */
            weight:    5,          /* épaisseur bien visible */
            opacity:   0.85,
            dashArray: '10, 6'     /* pointillés style sentier */
        }).addTo(carte);

    } catch (err) {
        // En cas d'erreur inattendue, afficher le fallback
        if (fallback) fallback.style.display = 'flex';
        console.error('Erreur carte Leaflet :', err);
    }

});
