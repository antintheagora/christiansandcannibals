const ambientAudio = document.getElementById('drone-audio');
if (ambientAudio) {
    ambientAudio.loop = true;
    ambientAudio.volume = 0.4;
}

// Glitch Navigation
document.querySelectorAll('a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Only glitch for internal links
        if (href.startsWith('#')) {
            e.preventDefault();

            // Red flash effect using #transition-overlay
            const overlay = document.getElementById('transition-overlay');
            if (overlay) {
                overlay.style.opacity = '1';
                setTimeout(() => {
                    overlay.style.opacity = '0';
                    document.querySelector(href).scrollIntoView({
                        behavior: 'smooth'
                    });
                }, 150); // Short delay for the flash
            } else {
                // Fallback if overlay missing
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

console.log('SYSTEM FAILURE... REBOOTING... CHRISTIANS AND CANNIBALS ONLINE.');

// Responsive nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('nav-links');

if (navToggle && navLinks) {
    const setNavState = (isOpen) => {
        navToggle.setAttribute('aria-expanded', String(isOpen));
    };

    navToggle.addEventListener('click', () => {
        const nextState = navToggle.getAttribute('aria-expanded') !== 'true';
        setNavState(nextState);
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (link.getAttribute('href')?.startsWith('#')) {
                setNavState(false);
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900 && navToggle.getAttribute('aria-expanded') === 'true') {
            setNavState(false);
        }
    });
}

// Title Gradient Effect
const TITLE_CONFIG = {
    gradientColors: ['#028614ff', '#800080', '#197c00ff'], // Bright Red, Muddy Orange, Purple
    gradientWidth: 500, // px width of the gradient band
    falloff: 400, // px width of the fade out/in
    lag: .008, // 0 to 1, lower is slower/smoother
    glowIntensity: 1000, // px
    baseColor: '#ff0000', // The "rest" color
    fontSize: '8rem' // Configurable size
};

const title = document.getElementById('main-title');
let titleMouseX = -1000; // Start off-screen
let currentGradientPos = -1000;

if (title) {
    const compactBreakpoint = window.matchMedia('(max-width: 640px)');

    const applyTitleResponsiveState = () => {
        if (compactBreakpoint.matches) {
            title.classList.add('is-compact');
            title.style.fontSize = '2.4rem';
        } else {
            title.classList.remove('is-compact');
            title.style.fontSize = TITLE_CONFIG.fontSize;
        }
    };

    // Apply initial config
    applyTitleResponsiveState();
    compactBreakpoint.addEventListener('change', applyTitleResponsiveState);

    // Track mouse globally to allow the effect to work even if not directly hovering (as requested "near its position")
    document.addEventListener('mousemove', (e) => {
        const rect = title.getBoundingClientRect();
        // Calculate mouse X relative to the title element
        titleMouseX = e.clientX - rect.left;
    });

    function updateTitleGradient() {
        // Lerp for lag
        currentGradientPos += (titleMouseX - currentGradientPos) * TITLE_CONFIG.lag;

        const rect = title.getBoundingClientRect();
        const width = rect.width;

        // Calculate percentage positions
        const halfWidth = TITLE_CONFIG.gradientWidth / 2;
        const falloff = TITLE_CONFIG.falloff;

        const center = currentGradientPos;
        const start = center - halfWidth;
        const end = center + halfWidth;

        // Falloff points
        const startFalloff = start - falloff;
        const endFalloff = end + falloff;

        // Convert to percentages for CSS
        const pCenter = (center / width) * 100;
        const pStart = (start / width) * 100;
        const pEnd = (end / width) * 100;
        const pStartFalloff = (startFalloff / width) * 100;
        const pEndFalloff = (endFalloff / width) * 100;

        // Distribute colors
        // We blend from Base -> (Falloff) -> Color1 -> Color2 -> Color3 -> (Falloff) -> Base

        const gradient = `linear-gradient(to right,
            ${TITLE_CONFIG.baseColor} 0%,
            ${TITLE_CONFIG.baseColor} ${pStartFalloff}%,
            ${TITLE_CONFIG.gradientColors[0]} ${pStart}%,
            ${TITLE_CONFIG.gradientColors[1]} ${pCenter}%,
            ${TITLE_CONFIG.gradientColors[2]} ${pEnd}%,
            ${TITLE_CONFIG.baseColor} ${pEndFalloff}%,
            ${TITLE_CONFIG.baseColor} 100%
        )`;

        title.style.backgroundImage = gradient;

        requestAnimationFrame(updateTitleGradient);
    }

    updateTitleGradient();
}

// General Responsive Text Handling
(function initResponsiveText() {
    const compactBreakpoint = window.matchMedia('(max-width: 640px)');
    const logo = document.querySelector('.logo');
    const sectionTitles = document.querySelectorAll('h2');

    const applyResponsiveState = () => {
        const isCompact = compactBreakpoint.matches;

        if (logo) {
            logo.classList.toggle('is-compact', isCompact);
        }

        sectionTitles.forEach(h2 => {
            h2.classList.toggle('is-compact', isCompact);
        });
    };

    applyResponsiveState();
    compactBreakpoint.addEventListener('change', applyResponsiveState);
})();

// Trailer Embed Handling ---------------------------------------------------
(function initTrailerEmbed() {
    const trailerWrapper = document.querySelector('.video-wrapper[data-trailer-id]');
    const playerContainer = document.getElementById('trailer-player');
    const fallbackContainer = document.getElementById('trailer-fallback');

    if (!trailerWrapper || !playerContainer) {
        return;
    }

    const trailerId = trailerWrapper.dataset.trailerId;
    if (!trailerId) {
        return;
    }
    const trailerHost = trailerWrapper.dataset.trailerHost || 'https://www.youtube.com';
    const embedOrigin = trailerWrapper.dataset.embedOrigin || window.location.origin || 'https://www.youtube.com';

    const trailerUrl = `https://www.youtube.com/watch?v=${trailerId}`;
    const fallbackLink = fallbackContainer ? fallbackContainer.querySelector('a') : null;
    if (fallbackLink) {
        fallbackLink.href = trailerUrl;
    }

    let hasFallenBack = false;

    const revealFallback = (reason) => {
        if (hasFallenBack) {
            return;
        }
        hasFallenBack = true;
        console.warn('Falling back to external trailer link because embed failed:', reason);
        if (playerContainer) {
            playerContainer.classList.remove('is-ready');
            playerContainer.classList.add('is-error');
            playerContainer.innerHTML = '';
        }
        if (fallbackContainer) {
            fallbackContainer.hidden = false;
        }
    };

    const loadYouTubeAPI = (callback) => {
        if (window.YT && typeof window.YT.Player === 'function') {
            callback();
            return;
        }

        window._ytApiCallbacks = window._ytApiCallbacks || [];
        window._ytApiCallbacks.push(callback);

        if (!window._ytApiReadyPatched) {
            const previousReady = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (typeof previousReady === 'function') {
                    previousReady();
                }
                const queue = window._ytApiCallbacks || [];
                while (queue.length) {
                    const cb = queue.shift();
                    try {
                        cb();
                    } catch (error) {
                        console.error('YouTube callback error:', error);
                    }
                }
            };
            window._ytApiReadyPatched = true;
        }

        if (!document.getElementById('youtube-iframe-api')) {
            const tag = document.createElement('script');
            tag.id = 'youtube-iframe-api';
            tag.src = 'https://www.youtube.com/iframe_api';
            tag.onerror = () => revealFallback('api-load');
            const scriptParent = document.head || document.body;
            if (scriptParent) {
                scriptParent.appendChild(tag);
            } else {
                revealFallback('no-dom');
            }
        }
    };

    loadYouTubeAPI(() => {
        const playerVars = {
            rel: 0,
            modestbranding: 1,
            playsinline: 1
        };

        if (embedOrigin && embedOrigin !== 'null') {
            playerVars.origin = embedOrigin;
            playerVars.widget_referrer = embedOrigin;
        }

        let ytPlayer = null;
        let fallbackTimer = null;
        const clearFallbackTimer = () => {
            if (fallbackTimer) {
                clearTimeout(fallbackTimer);
                fallbackTimer = null;
            }
        };

        fallbackTimer = setTimeout(() => {
            teardownPlayer();
            revealFallback('timeout');
        }, 4000);

        const teardownPlayer = () => {
            if (ytPlayer && typeof ytPlayer.destroy === 'function') {
                try {
                    ytPlayer.destroy();
                } catch (destroyErr) {
                    console.warn('Could not destroy trailer player', destroyErr);
                }
            }
            ytPlayer = null;
        };

        const applyReferrerPolicy = () => {
            const iframe = playerContainer.querySelector('iframe');
            if (!iframe) {
                requestAnimationFrame(applyReferrerPolicy);
                return;
            }
            iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        };

        try {
            ytPlayer = new YT.Player('trailer-player', {
                host: trailerHost,
                videoId: trailerId,
                width: '100%',
                height: '100%',
                playerVars,
                events: {
                    onReady: () => {
                        clearFallbackTimer();
                        if (fallbackContainer) {
                            fallbackContainer.hidden = true;
                        }
                        playerContainer.classList.remove('is-error');
                        playerContainer.classList.add('is-ready');
                    },
                    onError: (event) => {
                        clearFallbackTimer();
                        teardownPlayer();
                        revealFallback(event ? event.data : 'unknown-error');
                    }
                }
            });
            applyReferrerPolicy();
        } catch (error) {
            clearFallbackTimer();
            teardownPlayer();
            revealFallback(error);
        }
    });
})();

// Gallery lightbox ---------------------------------------------------------
const galleryLightbox = (() => {
    const modal = document.getElementById('gallery-modal');
    if (!modal) {
        return null;
    }

    const imageEl = modal.querySelector('#gallery-modal-image');
    const videoEl = modal.querySelector('#gallery-modal-video');
    const captionEl = modal.querySelector('#gallery-modal-caption');
    const counterEl = modal.querySelector('#gallery-modal-counter');
    const closeBtn = modal.querySelector('[data-gallery-nav="close"]');
    const prevBtn = modal.querySelector('[data-gallery-nav="prev"]');
    const nextBtn = modal.querySelector('[data-gallery-nav="next"]');
    const backdrop = modal.querySelector('.gallery-modal__backdrop');

    const state = {
        items: [],
        index: 0
    };

    const render = () => {
        if (!state.items.length) {
            return;
        }
        const current = state.items[state.index];
        const isVideo = current.type === 'video' && (current.videoSrc || current.src);

        if (videoEl) {
            videoEl.pause();
            videoEl.hidden = true;
            videoEl.removeAttribute('src');
            videoEl.load();
        }

        if (imageEl) {
            imageEl.hidden = false;
        }

        if (isVideo && videoEl) {
            if (imageEl) {
                imageEl.hidden = true;
            }
            videoEl.hidden = false;
            videoEl.muted = true;
            videoEl.autoplay = true;
            videoEl.loop = true;
            videoEl.setAttribute('playsinline', '');
            const poster = current.poster || current.src;
            if (poster) {
                videoEl.poster = poster;
            } else {
                videoEl.removeAttribute('poster');
            }
            videoEl.src = current.videoSrc || current.src;
            videoEl.load();
            const attemptPlay = () => {
                const playPromise = videoEl.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.catch(() => { });
                }
            };
            attemptPlay();
        } else if (imageEl) {
            imageEl.src = current.src;
            imageEl.alt = current.alt || 'Gallery still';
        }

        if (captionEl) {
            captionEl.textContent = current.caption || '';
            captionEl.hidden = !current.caption;
        }
        if (counterEl) {
            counterEl.textContent = `${state.index + 1} / ${state.items.length}`;
        }
    };

    const open = (items, startIndex = 0) => {
        if (!items || !items.length) {
            return;
        }
        state.items = items;
        state.index = Math.max(0, Math.min(startIndex, items.length - 1));
        modal.hidden = false;
        document.body.classList.add('is-modal-open');
        render();
    };

    const close = () => {
        modal.hidden = true;
        document.body.classList.remove('is-modal-open');
        state.items = [];
        if (videoEl) {
            videoEl.pause();
            videoEl.removeAttribute('src');
            videoEl.load();
        }
    };

    const move = (direction) => {
        if (!state.items.length) {
            return;
        }
        const length = state.items.length;
        state.index = (state.index + direction + length) % length;
        render();
    };

    prevBtn?.addEventListener('click', () => move(-1));
    nextBtn?.addEventListener('click', () => move(1));
    closeBtn?.addEventListener('click', close);
    backdrop?.addEventListener('click', close);

    document.addEventListener('keydown', (event) => {
        if (modal.hidden) {
            return;
        }
        if (event.key === 'Escape') {
            close();
        } else if (event.key === 'ArrowLeft') {
            move(-1);
        } else if (event.key === 'ArrowRight') {
            move(1);
        }
    });

    return {
        open
    };
})();

// Collapsible galleries toggle ---------------------------------------------
(function initCollapsibleGalleries() {
    const panels = document.querySelectorAll('.gallery-panel[id]');

    panels.forEach(panel => {
        const panelId = panel.id;
        const toggles = document.querySelectorAll(`.gallery-toggle[data-target="${panelId}"]`);

        if (!toggles.length) {
            return;
        }

        let isOpen = !panel.hidden;

        const syncToggles = () => {
            toggles.forEach(toggle => {
                toggle.setAttribute('aria-expanded', String(isOpen));
                const indicator = toggle.querySelector('.toggle-indicator');
                if (indicator) {
                    indicator.textContent = isOpen ? 'x' : '+';
                }
            });
        };

        const setState = (nextState) => {
            isOpen = nextState;
            panel.hidden = !isOpen;
            panel.classList.toggle('is-open', isOpen);
            syncToggles();
        };

        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                setState(!isOpen);
            });
        });

        panel.classList.toggle('is-open', isOpen);
        syncToggles();
    });
})();

// Gallery reveal effect ----------------------------------------------------
(function initGalleryRevealEffect() {
    const items = document.querySelectorAll('.gallery-item');

    if (!items.length) {
        return;
    }

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    items.forEach(item => {
        let baseMedia = item.querySelector('img, video');
        if (!baseMedia) {
            return;
        }

        const isVideo = baseMedia.tagName.toLowerCase() === 'video';
        baseMedia.dataset.galleryBase = 'true';

        let link = baseMedia.closest('.gallery-link');
        if (!link) {
            link = document.createElement('a');
            link.className = 'gallery-link';
            link.href = baseMedia.dataset.full || baseMedia.currentSrc || baseMedia.getAttribute('poster') || baseMedia.getAttribute('src');
            const label = baseMedia.getAttribute('alt') || baseMedia.getAttribute('aria-label');
            if (label) {
                link.setAttribute('aria-label', `Expand ${label}`);
            }
            baseMedia.parentNode.insertBefore(link, baseMedia);
            link.appendChild(baseMedia);
        } else {
            link.href = baseMedia.dataset.full || baseMedia.currentSrc || baseMedia.getAttribute('poster') || baseMedia.getAttribute('src');
            const label = baseMedia.getAttribute('alt') || baseMedia.getAttribute('aria-label');
            if (label) {
                link.setAttribute('aria-label', `Expand ${label}`);
            }
        }

        baseMedia = link.querySelector('[data-gallery-base="true"]') || baseMedia;

        if (!isVideo && !baseMedia.classList.contains('gallery-img-mono')) {
            baseMedia.classList.add('gallery-img-mono');
        }

        if (!isVideo && !item.querySelector('.gallery-img-color')) {
            const colorImg = baseMedia.cloneNode(true);
            colorImg.classList.remove('gallery-img-mono');
            colorImg.removeAttribute('data-gallery-base');
            colorImg.classList.add('gallery-img-color');
            colorImg.setAttribute('aria-hidden', 'true');
            item.appendChild(colorImg);
        }

        if (isVideo) {
            baseMedia.muted = true;
            baseMedia.autoplay = true;
            baseMedia.loop = true;
            baseMedia.setAttribute('playsinline', '');
        }

        const grid = item.closest('.gallery-grid');
        if (link && grid && galleryLightbox && !link.dataset.lightboxBound) {
            link.dataset.lightboxBound = 'true';
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const baseMediaNodes = Array.from(grid.querySelectorAll('[data-gallery-base="true"]'));
                const galleryItems = baseMediaNodes.map(node => {
                    const nodeIsVideo = node.dataset.galleryType === 'video' || node.tagName.toLowerCase() === 'video';
                    const label = node.getAttribute('alt') || node.getAttribute('aria-label') || 'Gallery still';
                    return {
                        type: nodeIsVideo ? 'video' : 'image',
                        src: node.dataset.full || node.getAttribute('poster') || node.currentSrc || node.getAttribute('src'),
                        videoSrc: node.dataset.videoSrc || node.getAttribute('src') || '',
                        poster: node.dataset.poster || node.getAttribute('poster') || '',
                        alt: label,
                        caption: label
                    };
                });
                const clickedIndex = Math.max(0, baseMediaNodes.indexOf(baseMedia));
                galleryLightbox.open(galleryItems, clickedIndex);
            });
        }

        const activate = () => {
            if (!item.classList.contains('is-revealing')) {
                item.classList.add('is-revealing');
            }
        };

        const updatePosition = (event) => {
            const rect = item.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            const minDimension = Math.min(rect.width, rect.height);
            const innerRadius = Math.max(minDimension * 0.55, 150);
            const midRadius = innerRadius + Math.max(minDimension * 0.3, 110);
            const outerRadius = midRadius + Math.max(minDimension * 0.35, 140);

            item.style.setProperty('--reveal-x', `${clamp(x, 0, 100)}%`);
            item.style.setProperty('--reveal-y', `${clamp(y, 0, 100)}%`);
            item.style.setProperty('--reveal-circle', `${innerRadius}px`);
            item.style.setProperty('--reveal-inner', `${innerRadius}px`);
            item.style.setProperty('--reveal-mid', `${midRadius}px`);
            item.style.setProperty('--reveal-outer', `${outerRadius}px`);
        };

        const handlePointerInput = (event) => {
            activate();
            updatePosition(event);
        };

        const reset = () => {
            item.classList.remove('is-revealing');
            item.style.setProperty('--reveal-circle', '0px');
            item.style.setProperty('--reveal-inner', '0px');
            item.style.setProperty('--reveal-mid', '0px');
            item.style.setProperty('--reveal-outer', '0px');
        };

        item.addEventListener('pointerenter', handlePointerInput);
        item.addEventListener('pointermove', handlePointerInput);
        item.addEventListener('pointerdown', handlePointerInput);
        item.addEventListener('pointerleave', reset);
    });
})();

// Soundtrack player --------------------------------------------------------
(function initSoundtrackPlayer() {
    const audioEl = document.getElementById('soundtrack-audio');
    const trackListEl = document.getElementById('track-list');
    const playBtn = document.getElementById('audio-play');
    const prevBtn = document.getElementById('audio-prev');
    const nextBtn = document.getElementById('audio-next');
    const seekEl = document.getElementById('audio-seek');
    const volumeEl = document.getElementById('audio-volume');
    const currentTrackEl = document.getElementById('current-track');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const discButtons = document.querySelectorAll('.disc-button');
    const discArtEl = document.getElementById('disc-art');
    const externalToggleBtn = document.getElementById('audio-toggle');
    const discElement = document.querySelector('.spinning-disc');
    const downloadToggle = document.querySelector('.download-toggle');
    const downloadPanel = document.getElementById('download-panel');
    const downloadButton = document.querySelector('.download-button[data-download-files]');

    if (!audioEl || !trackListEl || !playBtn || !prevBtn || !nextBtn || !seekEl || !currentTrackEl || !discArtEl || !volumeEl) {
        return;
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60) || 0;
        const secs = Math.floor(seconds % 60) || 0;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const discs = {
        1: {
            art: 'Resources/Music/Album Art/CD1.png',
            basePath: 'Resources/Music/Eyez On The Prize/Eyez On The Prize [Disc 1]/',
            tracks: [
                { title: `01. "DOG EAT DOG WORLD" (INTRO)`, artist: 'MOVIE CLIP/SCENE', file: '01 Dog Eat Dog World (Intro).mp3' },
                { title: `02. "HAVE'EM HATIN"`, artist: 'MAC DRE, YOUNG NADE', file: "02 Have 'em Hatin.mp3" },
                { title: `03. "EYEZ ON THE PRIZE"`, artist: 'PETER GUNZ & LORD TARIQ, KUTFATHER', file: '03 Eyez On The Prize.mp3' },
                { title: `04. "YOU AND YOUR 9MM"`, artist: 'DOWN-N-DIRTY CLICK (DIRTY SOUTH)', file: '04 You And Your 9mm.mp3' },
                { title: `05. "NIGHT SHIFT"`, artist: 'SAMOENDS FEAT. RICHIE RICH', file: '05 Night Shift.mp3' },
                { title: `06. "GAME TRUMP TIGHT"`, artist: 'SNOOP DOGG, JT THE BIGGA FIGGA, KUTFATHER', file: '06 Game Trump Tight.mp3' },
                { title: `07. "INTERLUDE"`, artist: 'SLIM THE PALE PIMP, SKRILLA MOBB', file: '07 Interlude.mp3' },
                { title: `08. "FOLLOW ME"`, artist: 'BLACK RHINO, SKRILLA MOBB, FLASH', file: '08 Follow Me.mp3' },
                { title: `09. "ALL DAY"`, artist: 'SAVAGE GENTLEMEN', file: '09 Savage Gentlemen.mp3' },
                { title: `10. "ALL MY NIGGAZ"`, artist: '2WICE, YUKMOUTH, KNUMBSKULL (LUNIZ), VAS BOSSY', file: '10 All My Niggaz.mp3' },
                { title: `11. "SEXY LIL' NEIGHBOR"`, artist: 'DRE DOG AKA ANDRE NICKATINA', file: "11 Sexy Lil' Neighbor.mp3" },
                { title: `12. "MY BLOCKS"`, artist: 'L.C., DOWN-N-DIRTY HUSTLERS', file: '12 My Blocks.mp3' },
                { title: `13. "GOTTA GET MY PAPER RIGHT (OUT OF 10 NIGGAZ AIN'T REAL!)"`, artist: 'COOLIO DA UNDADOGG, USUAL SUSPECTS, BABY BEESH (LATINO VELVET)', file: '13 Gotta Get My Paper Right.mp3' },
                { title: `14. "CAN'T GO AGAINST THE GRAIN"`, artist: 'MOVIE CLIP (OUTRO)', file: "14 Can't Go Against The Grain (Outro).mp3" }
            ]
        },
        2: {
            art: 'Resources/Music/Album Art/CD2.png',
            basePath: 'Resources/Music/Eyez On The Prize/Eyez On The Prize [Disc 2]/',
            tracks: [
                { title: `01. "DEAD END" (SPOKEN WORD)`, artist: 'IPO', file: '01 Dead End (Spoken Word).mp3' },
                { title: `02. "PAPER RIDERZ"`, artist: 'SAMOAENDZ ENT.', file: '02 Paper Riderz.mp3' },
                { title: `03. "OBEY YO' P.O."`, artist: 'E-40, 2WICE, QURAN', file: "03 Obey Yo' P.O.mp3" },
                { title: `04. "LACE 'EM UP"`, artist: 'BIG MACK, MAINE-O (11/5), FAMILY TYZ', file: "04 Lace 'Em Up.mp3" },
                { title: `05. "PIMP$ & PLAYA$"`, artist: 'SAN QUINN, G-BOOGIE, & DAVEROSKI', file: "05 Pimp$ & Playa$.mp3" },
                { title: `06. "IT TAKES DIRT TO MAKE FLOWERS GROW"`, artist: 'MOVIE CLIP/SCENE', file: '06 It Takes Dirt To Make Flowers Grow.mp3' },
                { title: `07. "IT'S THE MOB"`, artist: 'DUBEE AKA SUGAWOLF, M.O.H.', file: "07 It's The Mob.mp3" },
                { title: `08. "YOU CAN'T LOSE"`, artist: 'B-BOY POSSE, KILOMAI, J-MACK', file: "08 You Can't Loose.mp3" },
                { title: `09. "DREAMS OF BEING RICH"`, artist: 'BIG ROB', file: '09 Dreams Of Being Rich.mp3' },
                { title: `10. "SLIPPIN'"`, artist: 'RUSHE', file: "10 Slippin'.mp3" },
                { title: `11. "EASTSIDE 'G' RIDERZ"`, artist: 'BROWN-N-PROUD, BABY BEESH (LATINO VELVET)', file: "11 Eastside 'G' Riderz.mp3" },
                { title: `12. "AIN'T NOTHIN' CHANGED"`, artist: 'CALICO, YOUNG AL, PISTAL ("USUAL SUSPECTS")', file: "12 Ain't Nothin' Changed.mp3" },
                { title: `13. "MY DESTINY"`, artist: 'USUAL SUSPECTS', file: '13 My Destiny.mp3' },
                { title: `14. "INTRO TO THE FUGITIVE"`, artist: '', file: '14 In The Air Tonight Intro.mp3' },
                { title: `15. "THE FUGITIVE"`, artist: 'COUGNUT, GUCE, U.D.I.', file: '15 In The Air Tonight.mp3' },
                { title: `16. "OUTRO"`, artist: '', file: '16 Outro.mp3' }
            ]
        }
    };

    const formatTrackLabel = (track) => {
        if (!track) {
            return '';
        }
        const titleSpan = `<span class="track-label__title">${track.title}</span>`;
        const artistSpan = track.artist ? ` <span class="track-label__dash">—</span> <span class="track-label__artist">${track.artist}</span>` : '';
        return `${titleSpan}${artistSpan}`;
    };

    const DEFAULT_START_TRACK_INDEX = 1;
    let currentDisc = 1;
    let currentTrackIndex = -1;

    const renderTrackList = () => {
        const disc = discs[currentDisc];
        if (!disc) {
            return;
        }

        if (discArtEl) {
            discArtEl.src = encodeURI(disc.art);
        }

        trackListEl.innerHTML = '';
        disc.tracks.forEach((track, index) => {
            const li = document.createElement('li');
            li.innerHTML = formatTrackLabel(track);
            li.dataset.trackIndex = String(index);
            if (index === currentTrackIndex) {
                li.classList.add('is-active');
            }
            li.addEventListener('click', () => {
                playTrack(index);
            });
            trackListEl.appendChild(li);
        });
    };

    const resolveTrackPath = (disc, track) => {
        const base = disc.basePath || '';
        return encodeURI(`${base}${track.file}`).replace(/'/g, '%27').replace(/!/g, '%21').replace(/\(/g, '%28').replace(/\)/g, '%29');
    };

    const setPlayingState = (isPlaying) => {
        if (isPlaying) {
            playBtn.textContent = '❚❚';
        } else {
            playBtn.textContent = '►';
        }
        if (externalToggleBtn) {
            externalToggleBtn.textContent = isPlaying ? 'SHHH...' : 'BUMP THE TRACK';
        }
        if (ambientAudio) {
            if (isPlaying) {
                ambientAudio.play().catch(() => { });
            } else {
                ambientAudio.pause();
            }
        }
    };

    const playTrack = (index) => {
        const disc = discs[currentDisc];
        if (!disc) {
            return;
        }
        const track = disc.tracks[index];
        if (!track) {
            return;
        }

        currentTrackIndex = index;
        audioEl.src = resolveTrackPath(disc, track);
        audioEl.play().catch(() => { });
        setPlayingState(true);
        updateActiveListItem();
        currentTrackEl.innerHTML = formatTrackLabel(track);
    };

    const updateActiveListItem = () => {
        trackListEl.querySelectorAll('li').forEach(li => {
            li.classList.toggle('is-active', Number(li.dataset.trackIndex) === currentTrackIndex);
        });
    };

    const playNext = () => {
        const disc = discs[currentDisc];
        if (!disc || !disc.tracks.length) {
            return;
        }
        const nextIndex = (currentTrackIndex + 1) % disc.tracks.length;
        playTrack(nextIndex);
    };

    const playPrev = () => {
        const disc = discs[currentDisc];
        if (!disc || !disc.tracks.length) {
            return;
        }
        const prevIndex = (currentTrackIndex - 1 + disc.tracks.length) % disc.tracks.length;
        playTrack(prevIndex);
    };

    const getStartTrackIndex = () => {
        const disc = discs[currentDisc];
        if (disc && disc.tracks[DEFAULT_START_TRACK_INDEX]) {
            return DEFAULT_START_TRACK_INDEX;
        }
        return 0;
    };

    const togglePlayback = () => {
        if (!audioEl.src || currentTrackIndex === -1) {
            playTrack(getStartTrackIndex());
            return;
        }
        if (audioEl.paused) {
            audioEl.play().catch(() => { });
            setPlayingState(true);
        } else {
            audioEl.pause();
            setPlayingState(false);
        }
    };

    playBtn.addEventListener('click', togglePlayback);

    if (externalToggleBtn) {
        externalToggleBtn.addEventListener('click', (event) => {
            event.preventDefault();
            togglePlayback();
        });
    }

    volumeEl.value = audioEl.volume;
    volumeEl.addEventListener('input', () => {
        audioEl.volume = Number(volumeEl.value);
    });

    prevBtn.addEventListener('click', playPrev);
    nextBtn.addEventListener('click', playNext);

    audioEl.addEventListener('timeupdate', () => {
        if (!seekEl._dragging) {
            seekEl.value = audioEl.duration ? (audioEl.currentTime / audioEl.duration) * 100 : 0;
        }
        currentTimeEl.textContent = formatTime(audioEl.currentTime);
        totalTimeEl.textContent = formatTime(audioEl.duration || 0);
    });

    audioEl.addEventListener('ended', playNext);

    seekEl.addEventListener('input', () => {
        seekEl._dragging = true;
        const newTime = (seekEl.value / 100) * (audioEl.duration || 0);
        currentTimeEl.textContent = formatTime(newTime);
    });

    seekEl.addEventListener('change', () => {
        const newTime = (seekEl.value / 100) * (audioEl.duration || 0);
        audioEl.currentTime = newTime;
        seekEl._dragging = false;
    });

    discButtons.forEach(button => {
        button.addEventListener('click', () => {
            const discNumber = Number(button.dataset.disc);
            if (!discs[discNumber]) {
                return;
            }
            discButtons.forEach(btn => btn.classList.toggle('is-active', btn === button));
            discButtons.forEach(btn => btn.setAttribute('aria-pressed', btn === button ? 'true' : 'false'));

            currentDisc = discNumber;
            currentTrackIndex = -1;
            audioEl.pause();
            audioEl.removeAttribute('src');
            currentTrackEl.textContent = 'Select a track';
            setPlayingState(false);
            seekEl.value = 0;
            currentTimeEl.textContent = '00:00';
            totalTimeEl.textContent = '00:00';
            renderTrackList();
        });
    });

    const DJ_TIME_FACTOR = 0.004; // seconds per pixel moved
    const DJ_SPEED_FACTOR = 0.06;
    const DJ_RATE_FACTOR = 0.05;
    const DJ_MIN_RATE = 0.4;
    const DJ_MAX_RATE = 1.8;
    const clampTime = (value) => Math.max(0, Math.min(value, audioEl.duration || value));

    if (discElement) {
        const scratchState = {
            active: false,
            lastX: 0,
            resetTimer: null,
            rateTimer: null
        };

        const resetDiscSpin = () => {
            discElement.style.animationDuration = '';
            discElement.style.animationDirection = '';
            discElement.classList.remove('is-scratching');
            audioEl.playbackRate = 1;
        };

        const handlePointerEnter = (event) => {
            scratchState.active = true;
            scratchState.lastX = event.clientX;
        };

        const handlePointerMove = (event) => {
            if (!scratchState.active || !audioEl.src) {
                return;
            }
            const deltaX = event.clientX - scratchState.lastX;
            scratchState.lastX = event.clientX;

            if (deltaX === 0) {
                return;
            }

            discElement.classList.add('is-scratching');

            const adjustment = deltaX * DJ_TIME_FACTOR;
            audioEl.currentTime = clampTime(audioEl.currentTime + adjustment);

            const targetRate = Math.max(DJ_MIN_RATE, Math.min(DJ_MAX_RATE, 1 + deltaX * DJ_RATE_FACTOR));
            audioEl.playbackRate = targetRate;

            const speedBoost = Math.min(4, Math.max(0.5, 4 - Math.abs(deltaX) * DJ_SPEED_FACTOR));
            discElement.style.animationDuration = `${speedBoost}s`;
            discElement.style.animationDirection = deltaX < 0 ? 'reverse' : 'normal';

            if (scratchState.resetTimer) {
                clearTimeout(scratchState.resetTimer);
            }
            scratchState.resetTimer = setTimeout(resetDiscSpin, 250);

            if (scratchState.rateTimer) {
                clearTimeout(scratchState.rateTimer);
            }
            scratchState.rateTimer = setTimeout(() => {
                audioEl.playbackRate = 1;
            }, 250);
        };

        const handlePointerLeave = () => {
            scratchState.active = false;
            resetDiscSpin();
        };

        discElement.addEventListener('pointerenter', handlePointerEnter);
        discElement.addEventListener('pointermove', handlePointerMove);
        discElement.addEventListener('pointerleave', handlePointerLeave);
    }

    if (downloadButton) {
        const fileList = downloadButton.dataset.downloadFiles?.split('|').map(path => path.trim()).filter(Boolean);

        const encodePath = (path) => encodeURI(path)
            .replace(/#/g, '%23')
            .replace(/\?/g, '%3F')
            .replace(/\[/g, '%5B')
            .replace(/\]/g, '%5D');

        const triggerDownload = (url) => {
            const tempLink = document.createElement('a');
            tempLink.href = encodePath(url);
            tempLink.setAttribute('download', '');
            tempLink.rel = 'noopener';
            document.body.appendChild(tempLink);
            tempLink.click();
            tempLink.remove();
        };

        if (fileList?.length) {
            downloadButton.addEventListener('click', (event) => {
                // Allow modifier clicks to open in new tab/default behavior
                if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                    return;
                }

                event.preventDefault();
                fileList.forEach((filePath, index) => {
                    window.setTimeout(() => {
                        triggerDownload(filePath);
                    }, index * 300);
                });
            });
        }
    }

    if (downloadToggle && downloadPanel) {
        const creditsScroller = downloadPanel.querySelector('.download-tracklist-inner');
        let scrollIntervalId = null;
        let userOverride = false;
        let resumeTimeoutId = null;

        const startCreditsScroll = () => {
            if (!creditsScroller || scrollIntervalId) {
                return;
            }
            let lastTick = performance.now();
            scrollIntervalId = window.setInterval(() => {
                if (!creditsScroller) {
                    return;
                }
                const now = performance.now();
                const delta = now - lastTick;
                lastTick = now;

                if (userOverride) {
                    return;
                }

                const maxScroll = creditsScroller.scrollHeight - creditsScroller.clientHeight;
                if (maxScroll <= 0) {
                    creditsScroller.scrollTop = 0;
                    return;
                }

                creditsScroller.scrollTop += delta * 0.02;
                if (creditsScroller.scrollTop >= maxScroll - 1) {
                    creditsScroller.scrollTop = 0;
                }
            }, 30);
        };

        const stopCreditsScroll = () => {
            if (scrollIntervalId) {
                clearInterval(scrollIntervalId);
                scrollIntervalId = null;
            }
            userOverride = false;
            if (resumeTimeoutId) {
                clearTimeout(resumeTimeoutId);
                resumeTimeoutId = null;
            }
        };

        const scheduleResume = () => {
            if (resumeTimeoutId) {
                clearTimeout(resumeTimeoutId);
            }
            resumeTimeoutId = window.setTimeout(() => {
                userOverride = false;
                resumeTimeoutId = null;
            }, 2200);
        };

        const pauseForUser = () => {
            userOverride = true;
            scheduleResume();
        };

        if (creditsScroller) {
            creditsScroller.setAttribute('tabindex', '0');

            const pauseEvents = [
                { name: 'wheel', options: { passive: true } },
                { name: 'touchstart', options: { passive: true } },
                { name: 'pointerdown' },
                { name: 'keydown' }
            ];

            pauseEvents.forEach(({ name, options }) => {
                creditsScroller.addEventListener(name, pauseForUser, options || false);
            });

            const resumeEvents = [
                { name: 'pointerup', options: { passive: true } },
                { name: 'touchend', options: { passive: true } },
                { name: 'touchcancel', options: { passive: true } },
                { name: 'keyup' },
                { name: 'mouseleave', options: { passive: true } },
                { name: 'blur' }
            ];

            resumeEvents.forEach(({ name, options }) => {
                creditsScroller.addEventListener(name, scheduleResume, options || false);
            });

            creditsScroller.addEventListener('scroll', () => {
                if (userOverride) {
                    scheduleResume();
                }
            });
        }

        downloadToggle.addEventListener('click', () => {
            const isExpanded = downloadToggle.getAttribute('aria-expanded') === 'true';
            const nextState = !isExpanded;
            downloadToggle.setAttribute('aria-expanded', String(nextState));
            downloadToggle.textContent = nextState ? 'Collapse' : 'Download Album';
            downloadPanel.hidden = !nextState;
            if (!nextState) {
                stopCreditsScroll();
                if (creditsScroller) {
                    creditsScroller.scrollTop = 0;
                }
            } else {
                startCreditsScroll();
            }
        });

        if (!downloadPanel.hidden) {
            startCreditsScroll();
        }
    }

    renderTrackList();
    setPlayingState(false);
})();

// Game menu / fullscreen toggle --------------------------------------------
(function initGameMenu() {
    const shell = document.getElementById('game-shell');
    const toggle = document.getElementById('game-toggle');
    const frame = document.getElementById('game-frame');
    if (!shell || !toggle) {
        return;
    }

    let isFullscreen = false;
    let hasGameFocus = false;
    const blockedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar', 'PageUp', 'PageDown'];

    const updateScrollLock = () => {
        const lock = isFullscreen || hasGameFocus;
        document.documentElement.style.overflow = lock ? 'hidden' : '';
        document.body.style.overflow = lock ? 'hidden' : '';
    };

    const exitFullscreen = () => {
        if (!isFullscreen) {
            return;
        }
        isFullscreen = false;
        hasGameFocus = false;
        applyState();
    };

    const preventDirectionalScroll = (event) => {
        if (blockedKeys.includes(event.key)) {
            event.preventDefault();
        }
    };

    const preventScrollGesture = (event) => {
        if (isFullscreen || hasGameFocus) {
            event.preventDefault();
        }
    };

    const onGameKeyDown = (event) => {
        const isEscape = event.key === 'Escape';

        if (isEscape && isFullscreen) {
            exitFullscreen();
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        const usingGameKeys = isFullscreen || hasGameFocus;
        if (!usingGameKeys) {
            return;
        }

        preventDirectionalScroll(event);
    };

    const focusGame = () => {
        if (!frame) {
            return;
        }

        hasGameFocus = true;
        updateScrollLock();

        try {
            frame.focus();
            if (frame.contentWindow && typeof frame.contentWindow.focus === 'function') {
                frame.contentWindow.focus();
            }
        } catch (error) {
            console.warn('Unable to programmatically focus game frame', error);
        }
    };

    const applyState = () => {
        shell.classList.toggle('game-shell--fullscreen', isFullscreen);
        toggle.textContent = isFullscreen ? 'BACK TO SITE' : 'FULL SCREEN MODE';
        document.body.classList.toggle('is-game-fullscreen', isFullscreen);
        updateScrollLock();
    };

    toggle.addEventListener('click', () => {
        isFullscreen = !isFullscreen;
        applyState();

        if (isFullscreen) {
            focusGame();
        } else {
            hasGameFocus = false;
            updateScrollLock();
        }
    });

    // Track when the user is actively interacting with the game frame.
    shell.addEventListener('pointerdown', (event) => {
        if (shell.contains(event.target)) {
            hasGameFocus = true;
            updateScrollLock();
        }
    });

    shell.addEventListener('wheel', preventScrollGesture, { passive: false });
    shell.addEventListener('touchmove', preventScrollGesture, { passive: false });

    document.addEventListener('click', (event) => {
        if (!shell.contains(event.target) && !isFullscreen) {
            hasGameFocus = false;
            updateScrollLock();
        }
    });

    document.addEventListener('keydown', onGameKeyDown, { capture: true });

    window.addEventListener('message', (event) => {
        const data = event.data;
        if (data && data.type === 'EXIT_GAME_FULLSCREEN') {
            exitFullscreen();
        }
    });

    if (frame) {
        frame.addEventListener('focus', () => {
            hasGameFocus = true;
            updateScrollLock();
        });

        frame.addEventListener('blur', () => {
            if (!isFullscreen) {
                hasGameFocus = false;
                updateScrollLock();
            }
        });

        const bindIframeKeyGuards = () => {
            try {
                const contentWindow = frame.contentWindow;
                const contentDocument = frame.contentDocument || contentWindow?.document;

                if (contentWindow) {
                    contentWindow.addEventListener('keydown', onGameKeyDown, { capture: true });
                }

                if (contentDocument) {
                    contentDocument.addEventListener('keydown', onGameKeyDown, { capture: true });
                }
            } catch (error) {
                console.warn('Unable to bind game key guards', error);
            }
        };

        bindIframeKeyGuards();
        frame.addEventListener('load', bindIframeKeyGuards);
    }

    applyState();
})();
