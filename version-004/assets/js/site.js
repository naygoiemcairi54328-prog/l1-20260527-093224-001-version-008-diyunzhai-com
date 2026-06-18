(() => {
    const body = document.body;
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuToggle && mobilePanel) {
        menuToggle.addEventListener("click", () => {
            mobilePanel.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("img").forEach((image) => {
        image.addEventListener(
            "error",
            () => {
                const frame = image.closest(".poster-frame, .rank-cover, .detail-poster, .hero-image-layer");
                if (frame) {
                    frame.classList.add("is-empty");
                }
                image.remove();
            },
            { once: true }
        );
    });

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        const setSlide = (nextIndex) => {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        };

        const start = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => setSlide(index + 1), 5200);
        };

        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                setSlide(Number(dot.dataset.heroDot || 0));
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", () => {
                setSlide(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", () => {
                setSlide(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", () => window.clearInterval(timer));
        hero.addEventListener("mouseleave", start);
        setSlide(0);
        start();
    }

    const normalize = (value) => String(value || "").trim().toLowerCase();

    document.querySelectorAll("[data-filter-scope]").forEach((scope) => {
        const cards = Array.from(scope.querySelectorAll("[data-filter-card]"));
        const textInput = scope.querySelector("[data-filter-text]");
        const regionInput = scope.querySelector("[data-filter-region]");
        const yearInput = scope.querySelector("[data-filter-year]");
        const empty = scope.querySelector("[data-filter-empty]");

        if (scope.hasAttribute("data-url-query") && textInput) {
            const params = new URLSearchParams(window.location.search);
            const q = params.get("q");
            if (q) {
                textInput.value = q;
            }
        }

        const update = () => {
            const keyword = normalize(textInput ? textInput.value : "");
            const region = normalize(regionInput ? regionInput.value : "");
            const year = normalize(yearInput ? yearInput.value : "");
            let visible = 0;

            cards.forEach((card) => {
                const text = normalize(card.dataset.text);
                const cardRegion = normalize(card.dataset.region);
                const cardYear = normalize(card.dataset.year);
                const matched =
                    (!keyword || text.includes(keyword)) &&
                    (!region || cardRegion === region) &&
                    (!year || cardYear === year);

                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        };

        [textInput, regionInput, yearInput].forEach((control) => {
            if (control) {
                control.addEventListener("input", update);
                control.addEventListener("change", update);
            }
        });

        update();
    });
})();
