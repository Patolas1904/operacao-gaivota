const CONFIG = {
  nome: "", // Ex.: "Marta". Deixa vazio para mostrar apenas "Olá."
  respostaCopiada: "A tua mensagem de ontem foi péssima, mas admito que este site teve piada 😂",
  endpointResposta: "/api/resposta",
  DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/1502074533379702874/SGiRvRK0OaRhT_VZ-jn44eyKzygQxBNNKLWIh6-40_P2-ZxccJUEo8Bj-xoi8e3z7MLV"
};

const stepNames = {
  1: "Introdução",
  2: "Contexto",
  3: "Julgamento",
  4: "Sentença",
  5: "Conclusão",
};

const state = {
  currentStep: 1,
  selectedResponse: "",
  verdicts: [],
  submissionId: createSubmissionId(),
  submitted: false,
  submissionSucceeded: false,
};

const steps = [...document.querySelectorAll(".step")];
const progressText = document.getElementById("progressText");
const progressCount = document.getElementById("progressCount");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const nameGreeting = document.getElementById("nameGreeting");
const finalContinue = document.getElementById("finalContinue");
const submissionFeedback = document.getElementById("submissionFeedback");
const deliveryStatus = document.getElementById("deliveryStatus");

if (CONFIG.nome.trim()) {
  nameGreeting.textContent = `, ${CONFIG.nome.trim()}.`;
}

function createSubmissionId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `gaivota-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function goToStep(target) {
  steps.forEach((step) => step.classList.remove("active"));
  const nextStep = document.querySelector(`[data-step="${target}"]`);
  if (!nextStep) return;

  nextStep.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (target === "exit") {
    progressText.textContent = "Processo encerrado";
    progressCount.textContent = "—";
    progressBar.style.width = "100%";
    return;
  }

  state.currentStep = Number(target);
  progressText.textContent = stepNames[state.currentStep];
  progressCount.textContent = `${state.currentStep} / 5`;
  progressBar.style.width = `${state.currentStep * 20}%`;
}

function setDeliveryStatus(success) {
  deliveryStatus.hidden = false;
  deliveryStatus.textContent = success
    ? "Decisão enviada. O conteúdo entregue inclui apenas as escolhas feitas nesta página."
    : "A decisão não foi enviada automaticamente. O resto do site continua a funcionar normalmente.";
}

async function submitChoices() {
  if (state.submitted) return state.submissionSucceeded;

  state.verdicts = [...document.querySelectorAll('#verdictGrid input:checked')]
    .map((input) => input.value);

  finalContinue.disabled = true;
  finalContinue.classList.add("is-loading");
  finalContinue.innerHTML = 'A enviar decisão <span class="loading-dots" aria-hidden="true">…</span>';
  submissionFeedback.textContent = "A enviar apenas as opções selecionadas…";

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(CONFIG.endpointResposta, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submissionId: state.submissionId,
        verdicts: state.verdicts,
        selectedResponse: state.selectedResponse,
        consent: true,
        siteVersion: "2.0",
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    state.submitted = true;
    state.submissionSucceeded = true;
    submissionFeedback.textContent = "Decisão enviada com sucesso.";
    showToast("Decisão enviada");
    return true;
  } catch (error) {
    console.error("Não foi possível enviar a decisão:", error);
    state.submitted = true;
    state.submissionSucceeded = false;
    submissionFeedback.textContent = "Não foi possível enviar automaticamente. Podes continuar na mesma.";
    showToast("Envio indisponível — o site continua");
    return false;
  } finally {
    window.clearTimeout(timeoutId);
    finalContinue.classList.remove("is-loading");
    finalContinue.innerHTML = 'Enviar decisão e continuar <span>→</span>';
    finalContinue.disabled = false;
  }
}

document.addEventListener("click", async (event) => {
  const nextButton = event.target.closest("[data-next]");
  if (nextButton) {
    if (nextButton.id === "finalContinue") {
      if (!state.selectedResponse) return;
      const success = await submitChoices();
      setDeliveryStatus(success);
      goToStep(nextButton.dataset.next);
      return;
    }

    if (state.currentStep === 3) {
      state.verdicts = [...document.querySelectorAll('#verdictGrid input:checked')]
        .map((input) => input.value);
    }

    goToStep(nextButton.dataset.next);
    return;
  }

  const exitButton = event.target.closest("[data-exit]");
  if (exitButton) goToStep("exit");
});

document.querySelector(".evidence-btn").addEventListener("click", () => {
  const response = document.getElementById("evidenceResponse");
  response.hidden = false;
  showToast("Prova documental indisponível");
});

document.querySelectorAll(".choice-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".choice-btn").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    state.selectedResponse = button.dataset.response;
    finalContinue.disabled = false;
    submissionFeedback.textContent = "";
  });
});

document.getElementById("copyButton").addEventListener("click", async () => {
  const message = CONFIG.respostaCopiada;
  try {
    await navigator.clipboard.writeText(message);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = message;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  document.getElementById("copiedMessage").textContent = `“${message}”`;
  document.getElementById("copyResult").hidden = false;
  document.getElementById("copyButton").textContent = "Resposta copiada ✓";
  showToast("Resposta copiada");
});

document.getElementById("restartButton").addEventListener("click", () => {
  document.querySelectorAll('input[type="checkbox"]').forEach((input) => { input.checked = false; });
  document.querySelectorAll(".choice-btn").forEach((item) => item.classList.remove("selected"));
  finalContinue.disabled = true;
  document.getElementById("copyResult").hidden = true;
  document.getElementById("evidenceResponse").hidden = true;
  deliveryStatus.hidden = true;
  submissionFeedback.textContent = "";
  state.selectedResponse = "";
  state.verdicts = [];
  state.submitted = false;
  state.submissionSucceeded = false;
  state.submissionId = createSubmissionId();
  goToStep(1);
});
