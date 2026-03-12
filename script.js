const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    siteNav.classList.toggle("open");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
    });
  });
}

const conversionClickLinks = document.querySelectorAll('a[href*="wa.me/"]');
conversionClickLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (typeof window.gtag_report_conversion === "function") {
      window.gtag_report_conversion();
    }
  });
});

const teamPhoto = document.getElementById("teamPhoto");
if (teamPhoto) {
  const localSources = [
    "assets/foto-equipe.webp",
    "assets/foto-equipe.jpg",
    "assets/foto-equipe.jpeg",
    "assets/foto-equipe.png",
    "assets/foto-advogados.webp",
    "assets/foto-advogados.jpg",
    "assets/foto-advogados.jpeg",
    "assets/foto-advogados.png"
  ];
  const probe = new Image();
  let current = 0;

  const tryNextSource = () => {
    if (current >= localSources.length) return;
    const src = localSources[current];
    probe.onload = () => {
      teamPhoto.src = src;
    };
    probe.onerror = () => {
      current += 1;
      tryNextSource();
    };
    probe.src = `${src}?v=${Date.now()}`;
  };

  tryNextSource();
}

const revealSelectors = [
  ".section-head",
  ".icon-card",
  ".info-card",
  ".about-image",
  ".about-content",
  ".vertical-item",
  ".step-card",
  ".map-card",
  ".testimonial-card",
  ".cta-final h2",
  ".cta-final .btn",
  ".contact-form",
  ".faq-item",
  ".footer-grid > div"
];

const revealElements = [];
revealSelectors.forEach((selector) => {
  document.querySelectorAll(selector).forEach((element) => revealElements.push(element));
});

revealElements.forEach((element, index) => {
  element.classList.add("scroll-reveal");
  element.style.setProperty("--reveal-delay", `${(index % 8) * 60}ms`);
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
);

revealElements.forEach((element) => revealObserver.observe(element));

const heroImage = document.querySelector(".hero-media img");
if (heroImage) {
  let ticking = false;
  const updateParallax = () => {
    const offset = Math.min(window.scrollY * 0.12, 90);
    heroImage.style.transform = `translateY(${offset}px) scale(1.05)`;
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateParallax);
    },
    { passive: true }
  );
}

const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  if (!question || !answer) return;

  question.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");

    faqItems.forEach((otherItem) => {
      const otherQuestion = otherItem.querySelector(".faq-question");
      const otherAnswer = otherItem.querySelector(".faq-answer");
      otherItem.classList.remove("open");
      if (otherQuestion) otherQuestion.setAttribute("aria-expanded", "false");
      if (otherAnswer) otherAnswer.style.maxHeight = "0px";
    });

    if (!isOpen) {
      item.classList.add("open");
      question.setAttribute("aria-expanded", "true");
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    }
  });
});

window.addEventListener("resize", () => {
  const active = document.querySelector(".faq-item.open .faq-answer");
  if (active) active.style.maxHeight = `${active.scrollHeight}px`;
});

const contactForm = document.getElementById("contactForm");
const formFeedback = document.getElementById("formFeedback");
const contactWebhookUrl = "https://automacao.themidiamarketing.com.br/webhook-test/form-calca";

if (contactForm && formFeedback) {
  const requiredFields = contactForm.querySelectorAll("[required]");
  const submitButton = contactForm.querySelector('button[type="submit"]');

  const setSubmittingState = (isSubmitting) => {
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    submitButton.style.opacity = isSubmitting ? "0.7" : "1";
    submitButton.style.pointerEvents = isSubmitting ? "none" : "auto";
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!field.checkValidity()) {
        isValid = false;
        field.setAttribute("aria-invalid", "true");
      }
    });

    if (!isValid) {
      formFeedback.textContent = "Preencha os campos obrigatórios para agendar a análise.";
      return;
    }

    const formData = new FormData(contactForm);
    const payload = {
      nome: String(formData.get("nome") || "").trim(),
      telefone: String(formData.get("telefone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      mensagem: String(formData.get("mensagem") || "").trim(),
      origem: window.location.href,
      timestamp: new Date().toISOString()
    };

    setSubmittingState(true);
    formFeedback.textContent = "Enviando...";

    try {
      const response = await fetch(contactWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Webhook retornou status ${response.status}`);

      formFeedback.textContent = "Solicitação enviada com sucesso. Em breve entraremos em contato.";
      contactForm.reset();
    } catch (error) {
      try {
        await fetch(contactWebhookUrl, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain;charset=UTF-8"
          },
          body: JSON.stringify(payload)
        });
        formFeedback.textContent = "Solicitação enviada com sucesso. Em breve entraremos em contato.";
        contactForm.reset();
      } catch (fallbackError) {
        formFeedback.textContent = "Não foi possível enviar agora. Tente novamente ou fale no WhatsApp.";
      }
    } finally {
      setSubmittingState(false);
    }
  });

  requiredFields.forEach((field) => {
    field.addEventListener("input", () => {
      field.removeAttribute("aria-invalid");
      formFeedback.textContent = "";
    });
  });
}
