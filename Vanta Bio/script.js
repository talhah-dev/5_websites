document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("email-gate");
    const backdrop = document.getElementById("email-gate-backdrop");
    const closeButton = document.getElementById("email-gate-close");
    const form = document.getElementById("email-gate-form");
    const emailInput = document.getElementById("email-gate-input");
    const status = document.getElementById("email-gate-status");
    const code = document.getElementById("email-gate-code");
    const countdownRoot = document.getElementById("countdown-timer");
    const countdownText = document.getElementById("countdown-inline-text");

    if (!modal || !form || !emailInput || !status || typeof SITE_CONFIG === "undefined") {
        return;
    }

    const storageKey = `${SITE_CONFIG.siteSlug}-email-gate-dismissed`;
    const openDelayMs = 8000;
    const mobileTriggerDelta = 180;
    let hasShown = false;
    let lastScrollY = window.scrollY;

    code.textContent = SITE_CONFIG.discountCode;

    const isDismissed = () => window.localStorage.getItem(storageKey) === "true";

    const setDismissed = () => {
        window.localStorage.setItem(storageKey, "true");
    };

    const showModal = () => {
        if (hasShown || isDismissed()) {
            return;
        }

        hasShown = true;
        modal.classList.remove("hidden", "pointer-events-none", "opacity-0");
        modal.classList.add("flex", "opacity-100");
        document.body.classList.add("overflow-hidden");
    };

    const closeModal = () => {
        modal.classList.add("pointer-events-none", "opacity-0");
        modal.classList.remove("opacity-100");
        document.body.classList.remove("overflow-hidden");
        setDismissed();

        window.setTimeout(() => {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
        }, 300);
    };

    window.setTimeout(showModal, openDelayMs);

    document.addEventListener("mouseout", (event) => {
        if (event.clientY <= 0) {
            showModal();
        }
    });

    window.addEventListener("scroll", () => {
        const currentScrollY = window.scrollY;
        const scrolledUpFast = lastScrollY - currentScrollY > mobileTriggerDelta;
        const isMobileWidth = window.innerWidth < 1024;

        if (isMobileWidth && scrolledUpFast) {
            showModal();
        }

        lastScrollY = currentScrollY;
    }, { passive: true });

    closeButton?.addEventListener("click", closeModal);
    backdrop?.addEventListener("click", closeModal);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();

        if (!email) {
            status.textContent = "Please enter a valid email address.";
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton instanceof HTMLButtonElement) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
        }

        status.textContent = "Submitting your request...";

        try {
            const isPlaceholderEndpoint = SITE_CONFIG.emailSubmitUrl.includes("example.com");

            if (!isPlaceholderEndpoint) {
                const response = await fetch(SITE_CONFIG.emailSubmitUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        source: SITE_CONFIG.siteSlug
                    })
                });

                if (!response.ok) {
                    throw new Error("Email submission failed.");
                }
            }

            status.textContent = `Success. Your discount code is ${SITE_CONFIG.discountCode}.`;
            setDismissed();

            window.setTimeout(() => {
                closeModal();
            }, 1400);
        } catch (error) {
            status.textContent = "We couldn't submit your email right now. Please try again shortly.";
        } finally {
            if (submitButton instanceof HTMLButtonElement) {
                submitButton.disabled = false;
                submitButton.textContent = "Unlock Offer";
            }
        }
    });

    if (countdownRoot && countdownText) {
        const countdownUnits = {
            days: countdownRoot.querySelector('[data-countdown-unit="days"]'),
            hours: countdownRoot.querySelector('[data-countdown-unit="hours"]'),
            minutes: countdownRoot.querySelector('[data-countdown-unit="minutes"]'),
            seconds: countdownRoot.querySelector('[data-countdown-unit="seconds"]')
        };

        let countdownTarget = new Date(SITE_CONFIG.countdownEndsAt).getTime();

        const pad = (value) => String(value).padStart(2, "0");

        const renderCountdown = () => {
            const now = Date.now();

            if (Number.isNaN(countdownTarget)) {
                countdownText.textContent = "Countdown unavailable";
                return;
            }

            if (countdownTarget <= now) {
                countdownTarget = now + (24 * 60 * 60 * 1000);
            }

            const remaining = countdownTarget - now;
            const totalSeconds = Math.floor(remaining / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            if (countdownUnits.days) {
                countdownUnits.days.textContent = pad(days);
            }

            if (countdownUnits.hours) {
                countdownUnits.hours.textContent = pad(hours);
            }

            if (countdownUnits.minutes) {
                countdownUnits.minutes.textContent = pad(minutes);
            }

            if (countdownUnits.seconds) {
                countdownUnits.seconds.textContent = pad(seconds);
            }

            countdownText.textContent = `${pad(days)} days : ${pad(hours)} hours : ${pad(minutes)} min : ${pad(seconds)} sec`;
        };

        renderCountdown();
        window.setInterval(renderCountdown, 1000);
    }

    const faqTriggers = document.querySelectorAll(".faq-trigger");

    const closeFaqPanel = (trigger) => {
        const panel = trigger.nextElementSibling;
        const icon = trigger.querySelector(".faq-icon");

        trigger.setAttribute("aria-expanded", "false");

        if (icon) {
            icon.textContent = "+";
            icon.style.transform = "rotate(0deg)";
        }

        if (!panel) {
            return;
        }

        panel.style.maxHeight = `${panel.scrollHeight}px`;
        panel.offsetHeight;
        panel.classList.remove("is-open");
        panel.style.maxHeight = "0px";
    };

    const openFaqPanel = (trigger) => {
        const panel = trigger.nextElementSibling;
        const icon = trigger.querySelector(".faq-icon");

        trigger.setAttribute("aria-expanded", "true");

        if (icon) {
            icon.textContent = "-";
            icon.style.transform = "rotate(180deg)";
        }

        if (!panel) {
            return;
        }

        panel.classList.add("is-open");
        panel.style.maxHeight = `${panel.scrollHeight}px`;
    };

    faqTriggers.forEach((trigger) => {
        trigger.addEventListener("click", () => {
            const isExpanded = trigger.getAttribute("aria-expanded") === "true";

            faqTriggers.forEach((otherTrigger) => {
                if (otherTrigger !== trigger) {
                    closeFaqPanel(otherTrigger);
                }
            });

            if (isExpanded) {
                closeFaqPanel(trigger);
            } else {
                openFaqPanel(trigger);
            }
        });
    });
});
