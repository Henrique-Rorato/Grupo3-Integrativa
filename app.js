const form = document.querySelector("#intake-form");
const steps = [...document.querySelectorAll(".form-step")];
const indicators = [...document.querySelectorAll("[data-step-indicator]")];
const kicker = document.querySelector("#step-kicker");
const backButton = document.querySelector("#back-button");
const nextButton = document.querySelector("#next-button");
const editButton = document.querySelector("#edit-button");
const softwareList = document.querySelector("#software-list");
const addSoftwareButton = document.querySelector("#add-software");
const summaryContent = document.querySelector("#summary-content");
const saveStatus = document.querySelector("#save-status");
const downloadButton = document.querySelector("#download-button");
const clearButton = document.querySelector("#clear-button");

const saveKey = "base-tecnica-computer-intake";
const fieldNames = [
  "workTitle",
  "workDescription",
  "peopleCount",
  "workLocation",
  "useFrequency",
  "workImpact",
  "workloadDetails",
  "processor",
  "memory",
  "storage",
  "graphics",
  "supportRequirements",
  "otherRequirements",
];
let currentStep = 1;
let softwareCount = 0;

function addSoftware(program = {}) {
  softwareCount += 1;
  const card = document.createElement("article");
  card.className = "software-card";
  card.innerHTML = `
    <div class="software-card-head">
      <span><span class="software-number">${softwareCount.toString().padStart(2, "0")}</span> Programa</span>
      <button class="remove-software" type="button" aria-label="Remover programa">Remover</button>
    </div>
    <div class="software-fields">
      <div>
        <label for="software-name-${softwareCount}">Nome do programa <span class="required">*</span></label>
        <input id="software-name-${softwareCount}" name="softwareName" type="text" placeholder="Ex.: AutoCAD" required />
      </div>
      <div>
        <label for="software-version-${softwareCount}">Versão (se souber)</label>
        <input id="software-version-${softwareCount}" name="softwareVersion" type="text" placeholder="Ex.: versão 2025" />
      </div>
      <div>
        <label for="software-usage-${softwareCount}">Como será usado? <span class="required">*</span></label>
        <input id="software-usage-${softwareCount}" name="softwareUsage" type="text" placeholder="Ex.: elaborar desenhos técnicos" required />
      </div>
      <div>
        <label for="software-features-${softwareCount}">Tarefas ou recursos específicos</label>
        <input id="software-features-${softwareCount}" name="softwareFeatures" type="text" placeholder="Ex.: modelagem 3D, edição de vídeo" />
      </div>
    </div>`;
  card.querySelector('[name="softwareName"]').value = program.name || "";
  card.querySelector('[name="softwareVersion"]').value = program.version || "";
  card.querySelector('[name="softwareUsage"]').value = program.usage || "";
  card.querySelector('[name="softwareFeatures"]').value = program.features || "";
  card.querySelector(".remove-software").addEventListener("click", () => {
    if (softwareList.children.length === 1) {
      showError(2, "Adicione pelo menos um programa para continuar.");
      return;
    }
    card.remove();
    renumberSoftware();
    saveDraft();
  });
  softwareList.append(card);
}

function renumberSoftware() {
  [...softwareList.querySelectorAll(".software-card")].forEach((card, index) => {
    card.querySelector(".software-number").textContent = (index + 1).toString().padStart(2, "0");
  });
}

function showError(step, message = "") {
  document.querySelector(`[data-error="${step}"]`).textContent = message;
}

function setSaveStatus(message, state = "ok") {
  saveStatus.lastChild.textContent = ` ${message}`;
  saveStatus.classList.toggle("save-status-error", state === "error");
}

function collectPrograms() {
  return [...softwareList.querySelectorAll(".software-card")].map((card) => ({
    name: card.querySelector('[name="softwareName"]').value.trim(),
    version: card.querySelector('[name="softwareVersion"]').value.trim(),
    usage: card.querySelector('[name="softwareUsage"]').value.trim(),
    features: card.querySelector('[name="softwareFeatures"]').value.trim(),
  }));
}

function collectDraft() {
  const fields = Object.fromEntries(fieldNames.map((name) => [name, form.elements.namedItem(name).value]));
  return { step: currentStep, fields, programs: collectPrograms() };
}

function saveDraft() {
  try {
    localStorage.setItem(saveKey, JSON.stringify(collectDraft()));
    setSaveStatus("Rascunho salvo neste navegador");
  } catch {
    setSaveStatus("Não foi possível salvar neste navegador", "error");
  }
}

function restoreDraft() {
  let savedDraft;
  try {
    const savedValue = localStorage.getItem(saveKey);
    if (!savedValue) {
      setSaveStatus("Rascunho local neste navegador");
      return;
    }
    savedDraft = JSON.parse(savedValue);
  } catch {
    setSaveStatus("Não foi possível recuperar o rascunho salvo", "error");
    return;
  }

  if (!savedDraft || typeof savedDraft !== "object" || !savedDraft.fields || !Array.isArray(savedDraft.programs)) {
    setSaveStatus("O rascunho salvo está inválido; preencha os dados novamente", "error");
    return;
  }

  fieldNames.forEach((name) => {
    const field = form.elements.namedItem(name);
    if (field && typeof savedDraft.fields[name] === "string") field.value = savedDraft.fields[name];
  });
  softwareList.replaceChildren();
  savedDraft.programs.forEach((program) => addSoftware(program));
  if (softwareList.children.length === 0) addSoftware();

  const savedStep = Number(savedDraft.step);
  const step = savedStep >= 1 && savedStep <= 4 ? savedStep : 1;
  if (step === 4) renderSummary();
  renderStep(step);
  setSaveStatus("Rascunho recuperado deste navegador");
}

function renderStep(step) {
  currentStep = step;
  steps.forEach((section) => {
    const isCurrent = Number(section.dataset.step) === step;
    section.hidden = !isCurrent;
    section.classList.toggle("is-visible", isCurrent);
  });
  indicators.forEach((indicator) => {
    const number = Number(indicator.dataset.stepIndicator);
    indicator.classList.toggle("is-active", number === step);
    indicator.classList.toggle("is-complete", number < step || step === 4);
  });

  const isSummary = step === 4;
  kicker.textContent = isSummary ? "LEVANTAMENTO CONCLUÍDO" : `ETAPA ${String(step).padStart(2, "0")} DE 03`;
  backButton.hidden = step === 1 || isSummary;
  nextButton.hidden = isSummary;
  editButton.hidden = !isSummary;
  nextButton.innerHTML = step === 3 ? 'Concluir levantamento <span aria-hidden="true">→</span>' : 'Continuar <span aria-hidden="true">→</span>';
}

function validateStep(step) {
  showError(step);
  const fields = {
    1: [form.elements.workTitle, form.elements.workDescription],
    2: [...softwareList.querySelectorAll("input[required]")],
    3: [],
  }[step];
  const invalidField = fields.find((field) => !field.value.trim());
  if (invalidField) {
    showError(step, step === 2 ? "Informe o nome e o uso de cada programa." : "Preencha os campos obrigatórios para continuar.");
    invalidField.setAttribute("aria-invalid", "true");
    invalidField.focus();
    return false;
  }
  fields.forEach((field) => field.removeAttribute("aria-invalid"));
  return true;
}

function readValue(name, fallback = "Ainda não definido") {
  const value = form.elements.namedItem(name).value.trim();
  return value || fallback;
}

function addSummaryGroup(title, entries) {
  const group = document.createElement("section");
  group.className = "summary-group";
  const heading = document.createElement("h3");
  heading.textContent = title;
  const list = document.createElement("dl");
  entries.forEach(([label, value]) => {
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    list.append(term, description);
  });
  group.append(heading, list);
  summaryContent.append(group);
}

function renderSummary() {
  summaryContent.replaceChildren();
  addSummaryGroup("Trabalho e contexto de uso", [
    ["Setor / atividade", readValue("workTitle")],
    ["Descrição", readValue("workDescription")],
    ["Pessoas", form.elements.peopleCount.value.trim() ? `${form.elements.peopleCount.value.trim()} pessoa(s)` : "Ainda não definido"],
    ["Local de uso", readValue("workLocation")],
    ["Frequência", readValue("useFrequency")],
    ["Impacto da indisponibilidade", readValue("workImpact")],
    ["Tarefas simultâneas e arquivos", readValue("workloadDetails")],
  ]);

  const programs = document.createElement("section");
  programs.className = "summary-group";
  const programsHeading = document.createElement("h3");
  programsHeading.textContent = "Programas e atividades";
  programs.append(programsHeading);
  collectPrograms().forEach((program) => {
    const entry = document.createElement("div");
    entry.className = "summary-program";
    const name = document.createElement("strong");
    name.textContent = program.name;
    const details = document.createElement("p");
    details.textContent = [
      `Uso: ${program.usage}`,
      `Versão: ${program.version || "Ainda não definida"}`,
      `Tarefas específicas: ${program.features || "Ainda não definidas"}`,
    ].join(" · ");
    entry.append(name, details);
    programs.append(entry);
  });
  summaryContent.append(programs);

  addSummaryGroup("Configuração proposta", [
    ["Processador", readValue("processor")],
    ["Memória RAM", form.elements.memory.value.trim() ? `${form.elements.memory.value.trim()} GB` : "Ainda não definida"],
    ["Armazenamento", readValue("storage")],
    ["Placa de vídeo", readValue("graphics")],
  ]);
  addSummaryGroup("Requisitos operacionais", [
    ["Garantia e assistência", readValue("supportRequirements")],
    ["Compatibilidade e mobilidade", readValue("otherRequirements")],
  ]);
}

function createSummaryText() {
  const groups = [...summaryContent.querySelectorAll(".summary-group")];
  return [
    "LEVANTAMENTO DE NECESSIDADE DE COMPUTADOR",
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    "",
    ...groups.flatMap((group) => {
      const title = group.querySelector("h3").textContent;
      const entries = [...group.querySelectorAll("dl > dt")].map((term, index) => {
        const description = term.nextElementSibling;
        return `- ${term.textContent}: ${description.textContent}`;
      });
      const programs = [...group.querySelectorAll(".summary-program")].map((program) => {
        return `- ${program.querySelector("strong").textContent}\n  ${program.querySelector("p").textContent}`;
      });
      return [title, ...(entries.length ? entries : programs), ""];
    }),
    "Observação: este resumo registra os dados informados. Não compara componentes, recomenda equipamentos, verifica conformidade legal ou substitui a análise da equipe responsável.",
  ].join("\n");
}

function downloadSummary() {
  const blob = new Blob([createSummaryText()], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `levantamento-computador-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

addSoftware();
restoreDraft();

addSoftwareButton.addEventListener("click", () => {
  showError(2);
  addSoftware();
  softwareList.lastElementChild.querySelector('[name="softwareName"]').focus();
  saveDraft();
});

nextButton.addEventListener("click", () => {
  if (!validateStep(currentStep)) return;
  if (currentStep < 3) {
    renderStep(currentStep + 1);
    saveDraft();
    return;
  }
  renderSummary();
  renderStep(4);
  saveDraft();
});

backButton.addEventListener("click", () => {
  renderStep(currentStep - 1);
  saveDraft();
});

editButton.addEventListener("click", () => {
  renderStep(1);
  saveDraft();
});

downloadButton.addEventListener("click", downloadSummary);

clearButton.addEventListener("click", () => {
  if (!window.confirm("Apagar o rascunho salvo neste navegador e limpar este levantamento?")) return;
  try {
    localStorage.removeItem(saveKey);
  } catch {
    setSaveStatus("Não foi possível apagar o rascunho salvo", "error");
    return;
  }
  form.reset();
  softwareList.replaceChildren();
  softwareCount = 0;
  addSoftware();
  summaryContent.replaceChildren();
  renderStep(1);
  showError(1);
  showError(2);
  showError(3);
  setSaveStatus("Rascunho apagado");
});

form.addEventListener("input", (event) => {
  if (event.target.matches("input, textarea")) event.target.removeAttribute("aria-invalid");
  saveDraft();
});

form.addEventListener("change", saveDraft);
