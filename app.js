const form = document.querySelector("#intake-form");
const homeScreen = document.querySelector("#home-screen");
const workspace = document.querySelector("#workspace");
const steps = [...document.querySelectorAll(".form-step")];
const indicators = [...document.querySelectorAll("[data-step-indicator]")];
const kicker = document.querySelector("#step-kicker");
const backButton = document.querySelector("#back-button");
const nextButton = document.querySelector("#next-button");
const finishButton = document.querySelector("#finish-button");
const softwareList = document.querySelector("#software-list");
const addSoftwareButton = document.querySelector("#add-software");
const saveStatus = document.querySelector("#save-status");
const comparisonResults = document.querySelector("#comparison-results");
const etpEditor = document.querySelector("#etp-draft");
const fieldNames = [
  "workTitle", "workDescription", "peopleCount", "workLocation", "useFrequency",
  "workImpact", "workloadDetails", "processor", "memory", "storage", "freeStorageGb", "operatingSystem", "displayResolution", "graphics",
  "supportRequirements", "otherRequirements",
];
const saveKey = "base-tecnica-computer-intake";
const referencesKey = "computer-intake-custom-references";
const referenceSources = window.DOCUMENTED_REFERENCES || [];
const PROGRAM_PRESETS = [
  { id: "excel", name: "Excel", usage: "Criar, consultar e editar planilhas.", features: "Preencher conforme o tamanho dos arquivos, fórmulas, macros e volume de dados." },
  { id: "word", name: "Word", usage: "Criar e editar documentos de texto." },
  { id: "powerpoint", name: "PowerPoint", usage: "Criar e apresentar apresentações." },
  { id: "outlook", name: "Outlook", usage: "E-mail, agenda e comunicação." },
  { id: "teams", name: "Microsoft Teams", usage: "Reuniões, chamadas e colaboração." },
  { id: "browser", name: "Navegador web", usage: "Acessar sistemas e serviços web." },
  { id: "autocad", name: "AutoCAD", usage: "Desenho técnico e modelagem.", version: "Informar versão", features: "Indicar uso 2D/3D, tamanho dos projetos e renderização." },
  { id: "photoshop", name: "Adobe Photoshop", usage: "Edição e composição de imagens.", version: "Informar versão", features: "Indicar resolução e quantidade de imagens em edição." },
  { id: "illustrator", name: "Adobe Illustrator", usage: "Criação e edição de ilustrações vetoriais.", version: "Informar versão" },
  { id: "premiere", name: "Adobe Premiere Pro", usage: "Edição de vídeo.", version: "Informar versão", features: "Indicar resolução, codecs e complexidade dos projetos." },
  { id: "sketchup", name: "SketchUp", usage: "Modelagem 3D.", version: "Informar versão" },
  { id: "vscode", name: "Visual Studio Code", usage: "Edição de código e desenvolvimento.", version: "Informar versão" },
  { id: "other", name: "Outro programa", usage: "", version: "", features: "" },
];
let currentStep = 1;
let softwareCount = 0;
let customReferences = [];
let comparisonRows = [];

function setSaveStatus(message, failed = false) {
  saveStatus.lastChild.textContent = ` ${message}`;
  saveStatus.classList.toggle("save-status-error", failed);
}

function showError(step, message = "") {
  const error = document.querySelector(`[data-error="${step}"]`);
  if (error) error.textContent = message;
}

function readFormValue(name) {
  const field = form.elements.namedItem(name);
  return field ? field.value.trim() : "";
}

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
      <div class="software-preset-field">
        <label for="software-preset-${softwareCount}">Escolha um programa comum ou preencha manualmente</label>
        <select id="software-preset-${softwareCount}" name="softwarePreset">
          <option value="">Selecionar programa (opcional)</option>
          <optgroup label="Escritório e comunicação">
            <option value="excel">Microsoft Excel</option>
            <option value="word">Microsoft Word</option>
            <option value="powerpoint">Microsoft PowerPoint</option>
            <option value="outlook">Microsoft Outlook</option>
            <option value="teams">Microsoft Teams</option>
            <option value="browser">Navegador web</option>
          </optgroup>
          <optgroup label="Criação, engenharia e desenvolvimento">
            <option value="autocad">AutoCAD</option>
            <option value="photoshop">Adobe Photoshop</option>
            <option value="illustrator">Adobe Illustrator</option>
            <option value="premiere">Adobe Premiere Pro</option>
            <option value="sketchup">SketchUp</option>
            <option value="vscode">Visual Studio Code</option>
          </optgroup>
          <option value="other">Outro programa</option>
        </select>
      </div>
      <div><label for="software-name-${softwareCount}">Nome do programa <span class="required">*</span></label><input id="software-name-${softwareCount}" name="softwareName" type="text" placeholder="Ex.: Microsoft 365" required /></div>
      <div><label for="software-version-${softwareCount}">Versão (se souber)</label><input id="software-version-${softwareCount}" name="softwareVersion" type="text" placeholder="Ex.: Microsoft 365 Apps" /></div>
      <div><label for="software-usage-${softwareCount}">Como será usado? <span class="required">*</span></label><input id="software-usage-${softwareCount}" name="softwareUsage" type="text" placeholder="Ex.: elaborar documentos e planilhas" required /></div>
      <div><label for="software-features-${softwareCount}">Tarefas ou recursos específicos</label><input id="software-features-${softwareCount}" name="softwareFeatures" type="text" placeholder="Ex.: arquivos grandes, muitas planilhas" /></div>
    </div>`;
  card.querySelector('[name="softwareName"]').value = program.name || "";
  card.querySelector('[name="softwareVersion"]').value = program.version || "";
  card.querySelector('[name="softwareUsage"]').value = program.usage || "";
  card.querySelector('[name="softwareFeatures"]').value = program.features || "";
  card.querySelector('[name="softwarePreset"]').addEventListener("change", (event) => {
    const preset = PROGRAM_PRESETS.find((item) => item.id === event.target.value);
    if (!preset || preset.id === "other") {
      if (preset) card.querySelector('[name="softwareName"]').focus();
      return;
    }
    card.querySelector('[name="softwareName"]').value = preset.name;
    card.querySelector('[name="softwareUsage"]').value = preset.usage;
    card.querySelector('[name="softwareVersion"]').value = preset.version || "";
    card.querySelector('[name="softwareFeatures"]').value = preset.features || "";
    saveDraft();
  });
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

function collectPrograms() {
  return [...softwareList.querySelectorAll(".software-card")].map((card) => ({
    name: card.querySelector('[name="softwareName"]').value.trim(),
    version: card.querySelector('[name="softwareVersion"]').value.trim(),
    usage: card.querySelector('[name="softwareUsage"]').value.trim(),
    features: card.querySelector('[name="softwareFeatures"]').value.trim(),
  }));
}

function collectDraft() {
  const fields = Object.fromEntries(fieldNames.map((name) => [name, readFormValue(name)]));
  return { step: currentStep, fields, programs: collectPrograms(), etpDraft: etpEditor.value };
}

function saveDraft() {
  try {
    localStorage.setItem(saveKey, JSON.stringify(collectDraft()));
    setSaveStatus("Rascunho salvo neste navegador");
    updateHomeActions();
  } catch {
    setSaveStatus("Falha ao salvar o rascunho neste navegador", true);
  }
}

function getSavedDraft() {
  try {
    const raw = localStorage.getItem(saveKey);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft || typeof draft !== "object" || !draft.fields || !Array.isArray(draft.programs)) {
      throw new Error("Formato de rascunho inválido.");
    }
    return draft;
  } catch (error) {
    setSaveStatus(`Não foi possível ler o rascunho: ${error.message}`, true);
    return null;
  }
}

function loadCustomReferences() {
  try {
    const raw = localStorage.getItem(referencesKey);
    if (!raw) return [];
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved)) throw new Error("Formato de referências inválido.");
    return saved.filter((reference) => reference && typeof reference.program === "string" && typeof reference.sourceUrl === "string");
  } catch (error) {
    setSaveStatus(`Não foi possível carregar as referências locais: ${error.message}`, true);
    return [];
  }
}

function updateHomeActions() {
  const hasDraft = Boolean(getSavedDraft());
  document.querySelector("#resume-button").hidden = !hasDraft;
  document.querySelector("#new-button").hidden = !hasDraft;
  document.querySelector("#start-button").textContent = hasDraft ? "Iniciar outro levantamento" : "Iniciar levantamento";
}

function showHome() {
  saveDraft();
  workspace.hidden = true;
  homeScreen.hidden = false;
  updateHomeActions();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function populateDraft(draft) {
  fieldNames.forEach((name) => {
    const field = form.elements.namedItem(name);
    if (field && typeof draft.fields[name] === "string") field.value = draft.fields[name];
  });
  softwareList.replaceChildren();
  softwareCount = 0;
  draft.programs.forEach((program) => addSoftware(program));
  if (softwareList.children.length === 0) addSoftware();
  etpEditor.value = typeof draft.etpDraft === "string" ? draft.etpDraft : "";
}

function openWorkspace(draft = null) {
  if (draft) populateDraft(draft);
  else {
    form.reset();
    softwareList.replaceChildren();
    softwareCount = 0;
    addSoftware();
    etpEditor.value = "";
  }
  homeScreen.hidden = true;
  workspace.hidden = false;
  const desiredStep = draft ? Number(draft.step) : 1;
  const step = desiredStep >= 1 && desiredStep <= 5 ? desiredStep : 1;
  if (step === 4 || step === 5) renderComparison();
  if (step === 5 && !etpEditor.value.trim()) etpEditor.value = generateEtpDraft();
  renderStep(step);
  saveDraft();
  window.scrollTo({ top: 0, behavior: "smooth" });
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
    indicator.classList.toggle("is-complete", number < step);
  });
  kicker.textContent = `ETAPA ${String(step).padStart(2, "0")} DE 05`;
  backButton.hidden = step === 1;
  nextButton.hidden = step === 5;
  finishButton.hidden = step !== 5;
  nextButton.innerHTML = step === 4
    ? 'Preparar rascunho ETP <span aria-hidden="true">→</span>'
    : 'Continuar <span aria-hidden="true">→</span>';
}

function validateStep(step) {
  showError(step);
  const required = step === 1
    ? [form.elements.workTitle, form.elements.workDescription]
    : step === 2
      ? [...softwareList.querySelectorAll("input[required]")]
      : [];
  let invalid = required.find((field) => !field.value.trim());
  let errorMessage = step === 2
    ? "Informe o nome e o uso de cada programa."
    : "Preencha os campos obrigatórios para continuar.";
  if (!invalid && step === 1 && readFormValue("peopleCount")
    && (!Number.isFinite(Number(readFormValue("peopleCount"))) || Number(readFormValue("peopleCount")) < 1)) {
    invalid = form.elements.peopleCount;
    errorMessage = "A quantidade de pessoas deve ser um número maior que zero.";
  }
  if (!invalid && step === 3 && readFormValue("memory")
    && (!Number.isFinite(Number(readFormValue("memory"))) || Number(readFormValue("memory")) < 1)) {
    invalid = form.elements.memory;
    errorMessage = "A memória RAM deve ser informada em GB e ser maior que zero.";
  }
  if (!invalid && step === 3 && readFormValue("freeStorageGb")
    && (!Number.isFinite(Number(readFormValue("freeStorageGb"))) || Number(readFormValue("freeStorageGb")) < 0)) {
    invalid = form.elements.freeStorageGb;
    errorMessage = "O espaço livre deve ser informado em GB e não pode ser negativo.";
  }
  if (!invalid) {
    required.forEach((field) => field.removeAttribute("aria-invalid"));
    return true;
  }
  showError(step, errorMessage);
  invalid.setAttribute("aria-invalid", "true");
  invalid.focus();
  return false;
}

function normalizedName(value) {
  return value.trim().toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function withoutTrailingPunctuation(value) {
  return value.trim().replace(/[.!?;:]+$/, "");
}

function findReference(program) {
  const name = normalizedName(`${program.name} ${program.version}`);
  const searchText = ` ${name} `;
  const matchingCustomReferences = customReferences.filter((reference) => {
    const registered = normalizedName(reference.program);
    return registered && searchText.includes(` ${registered} `);
  });
  const custom = matchingCustomReferences.sort((left, right) => right.program.length - left.program.length)[0];
  if (custom) return custom;
  const office2024 = referenceSources.find((reference) => reference.id === "office-ltsc-2024");
  if (office2024 && /\b(?:excel|word|powerpoint|outlook)\b/.test(name) && /\b(?:2024|ltsc 2024)\b/.test(name)) {
    return office2024;
  }
  const office2021 = referenceSources.find((reference) => reference.id === "office-ltsc-2021");
  if (office2021 && /\b(?:excel|word|powerpoint|outlook)\b/.test(name) && /\b(?:2021|ltsc 2021)\b/.test(name)) {
    return office2021;
  }
  if (/\b(?:excel|word|powerpoint|outlook)\b/.test(name) && /\b(?:2019|2016|2013|2010)\b/.test(name)) {
    return null;
  }
  const orderedSources = [...referenceSources].sort((left, right) => {
    const leftLength = Math.max(...left.aliases.map((alias) => alias.length));
    const rightLength = Math.max(...right.aliases.map((alias) => alias.length));
    return rightLength - leftLength;
  });
  return orderedSources.find((reference) => {
    const matches = reference.aliases.some((alias) => name.includes(normalizedName(alias)));
    if (!matches) return false;
    if (reference.id === "microsoft-365-business" && /\b(personal|family|familia|home|consumer|individual|pessoal|domestico)\b/.test(name)) {
      return false;
    }
    return true;
  }) || null;
}

function readCpu() {
  const value = readFormValue("processor");
  const ghzMatch = value.match(/(\d+(?:[.,]\d+)?)\s*ghz/i);
  const coresMatch = value.match(/(\d+)\s*(?:-\s*)?(?:cores?|n[uú]cleos?)/i);
  return {
    ghz: ghzMatch ? Number(ghzMatch[1].replace(",", ".")) : null,
    cores: coresMatch ? Number(coresMatch[1]) : null,
  };
}

function parseCapacityGb(value) {
  const match = value.match(/(\d+(?:[.,]\d+)?)\s*(tb|gb|mb)\b/i);
  if (!match) return null;
  const amount = Number(match[1].replace(",", "."));
  const unit = match[2].toLowerCase();
  return unit === "tb" ? amount * 1000 : unit === "mb" ? amount / 1000 : amount;
}

function statusForNumeric(actual, minimum, unit, requirementName) {
  if (minimum === undefined || minimum === null || minimum === "") {
    return { status: "unknown", label: "Sem dados suficientes", note: `A fonte cadastrada não informa um mínimo comparável para ${requirementName}.` };
  }
  if (actual === null || !Number.isFinite(actual)) {
    return { status: "unknown", label: "Sem dados suficientes", note: `Informe um valor mensurável para comparar ${requirementName}.` };
  }
  if (actual < minimum) {
    return { status: "insufficient", label: "Insuficiente", note: `O valor informado (${actual} ${unit}) fica abaixo do mínimo documentado (${minimum} ${unit}). Confirme também se a medida e o cenário são equivalentes.` };
  }
  if (actual > minimum) {
    return { status: "above", label: "Acima da referência", note: `O valor informado (${actual} ${unit}) supera o mínimo documentado (${minimum} ${unit}); isso não demonstra desperdício nem substitui a justificativa do dimensionamento.` };
  }
  return { status: "adequate", label: "Adequado", note: `O valor informado corresponde ao mínimo documentado (${minimum} ${unit}); avalie a carga real e a margem necessária.` };
}

function compareStorage(reference) {
  const requirements = reference.requirements || {};
  const kind = requirements.storageKind || "freeSpace";
  const minimum = requirements.storageGb;
  const capacity = readFormValue("storage");
  const freeSpace = readFormValue("freeStorageGb");
  const actual = kind === "capacity"
    ? parseCapacityGb(capacity)
    : freeSpace ? Number(freeSpace) : null;
  if ((actual === null || !Number.isFinite(actual)) && kind === "freeSpace" && capacity) {
    return {
      status: "unknown",
      label: "Sem dados suficientes",
      note: `Você informou a capacidade total (“${capacity}”), mas a referência exige ${minimum} GB de espaço livre. Informe o espaço livre previsto; não é possível inferi-lo pela capacidade do SSD.`,
    };
  }
  return statusForNumeric(
    actual,
    minimum,
    "GB",
    kind === "capacity" ? "capacidade total do disco" : "espaço livre em disco",
  );
}

function compareCpu(reference) {
  const requirements = reference.requirements || {};
  const actual = readCpu();
  const hasFrequency = requirements.cpuGhz !== undefined;
  const hasCores = requirements.cpuCores !== undefined;
  if (!hasFrequency && !hasCores) {
    return { status: "unknown", label: "Sem dados suficientes", note: "A fonte não oferece critérios de CPU quantificáveis para esta comparação." };
  }
  if ((hasFrequency && actual.ghz === null) || (hasCores && actual.cores === null)) {
    return { status: "unknown", label: "Sem dados suficientes", note: `A proposta precisa declarar ${hasFrequency ? "frequência em GHz" : ""}${hasFrequency && hasCores ? " e " : ""}${hasCores ? "número de núcleos" : ""}. O modelo comercial isolado não permite comparar desempenho.` };
  }
  const below = (hasFrequency && actual.ghz < requirements.cpuGhz) || (hasCores && actual.cores < requirements.cpuCores);
  const above = (hasFrequency && actual.ghz > requirements.cpuGhz) || (hasCores && actual.cores > requirements.cpuCores);
  if (below) return { status: "insufficient", label: "Insuficiente", note: "Ao menos um valor explicitamente informado fica abaixo do mínimo publicado. Compare a geração, arquitetura e desempenho real antes de concluir." };
  if (above) return { status: "above", label: "Acima da referência", note: "Os valores informados excedem o mínimo publicado; isso não comprova excesso para o trabalho descrito." };
  return { status: "adequate", label: "Adequado", note: "Os valores explicitamente informados correspondem ao mínimo publicado. O nome/modelo do processador e a carga de trabalho ainda exigem validação técnica." };
}

function compareGraphics(reference) {
  const minimum = reference.requirements?.graphicsDirectX;
  const description = reference.requirements?.graphicsText;
  if (minimum === undefined && !description) {
    return { status: "unknown", label: "Sem dados suficientes", note: "A fonte não documenta um requisito gráfico para este escopo." };
  }
  const value = readFormValue("graphics");
  const match = value.match(/(?:directx|dx)\s*(\d+)/i);
  if (minimum !== undefined && match) {
    const version = Number(match[1]);
    if (version < minimum) return { status: "insufficient", label: "Insuficiente", note: `DirectX ${version} informado fica abaixo do mínimo DirectX ${minimum} publicado.` };
    if (version > minimum) return { status: "above", label: "Acima da referência", note: `DirectX ${version} informado é posterior ao mínimo DirectX ${minimum}; isso não avalia desempenho, drivers ou recursos específicos.` };
    return { status: "adequate", label: "Adequado", note: `Compatibilidade DirectX ${version} declarada, no mínimo publicado. Verifique modelo, driver e tarefa.` };
  }
  return { status: "unknown", label: "Sem dados suficientes", note: `A GPU informada não declara compatibilidade verificável (${description || `DirectX ${minimum} ou posterior`}); consulte a ficha técnica oficial do modelo.` };
}

function compareOperatingSystem(reference) {
  const minimum = reference.requirements?.operatingSystem;
  if (!minimum) {
    return { status: "unknown", label: "Sem dados suficientes", note: "A fonte não informa sistemas operacionais compatíveis neste cadastro." };
  }
  const proposed = normalizedName(readFormValue("operatingSystem"));
  if (!proposed) {
    return { status: "unknown", label: "Sem dados suficientes", note: "Informe o sistema operacional e sua versão para comparar com a documentação." };
  }
  if (!proposed.includes("windows")) {
    return { status: "unknown", label: "Sem dados suficientes", note: "Esta referência descreve requisitos para Windows; não se aplica automaticamente a outro sistema operacional." };
  }
  const acceptedVersions = minimum.split(/\s*,\s*|\s+ou\s+/i).map(normalizedName);
  if (acceptedVersions.some((version) => proposed.includes(version.replace(/[.,;:]+$/, "")))) {
    return { status: "adequate", label: "Adequado", note: `O sistema informado corresponde a uma das opções documentadas (${minimum}). Confirme edição, ciclo de suporte e políticas da instituição.` };
  }
  return { status: "insufficient", label: "Insuficiente", note: `O sistema informado não corresponde às versões listadas nesta referência (${minimum}). Confirme a versão exata e o ciclo de suporte antes de concluir.` };
}

function compareDisplay(reference) {
  const { displayWidth, displayHeight } = reference.requirements || {};
  if (!displayWidth || !displayHeight) {
    return { status: "unknown", label: "Sem dados suficientes", note: "A fonte não informa uma resolução mínima comparável." };
  }
  const match = readFormValue("displayResolution").match(/(\d{3,5})\s*[x×]\s*(\d{3,5})/i);
  if (!match) {
    return { status: "unknown", label: "Sem dados suficientes", note: "Informe a largura e a altura em pixels (por exemplo, 1920 × 1080)." };
  }
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (width < displayWidth || height < displayHeight) {
    return { status: "insufficient", label: "Insuficiente", note: `A resolução declarada (${width} × ${height}) fica abaixo do mínimo publicado (${displayWidth} × ${displayHeight}).` };
  }
  if (width > displayWidth || height > displayHeight) {
    return { status: "above", label: "Acima da referência", note: `A resolução declarada (${width} × ${height}) excede o mínimo publicado (${displayWidth} × ${displayHeight}); confirme também escala, dimensões e uso real.` };
  }
  return { status: "adequate", label: "Adequado", note: `A resolução declarada corresponde ao mínimo publicado (${displayWidth} × ${displayHeight}).` };
}

function compareComponent(reference, component) {
  const requirements = reference.requirements || {};
  if (component === "Processador") return compareCpu(reference);
  if (component === "Memória RAM") return statusForNumeric(
    readFormValue("memory") ? Number(readFormValue("memory")) : null,
    requirements.memoryGb,
    "GB",
    "memória RAM",
  );
  if (component === "Armazenamento") return compareStorage(reference);
  if (component === "Sistema operacional") return compareOperatingSystem(reference);
  if (component === "Resolução de tela") return compareDisplay(reference);
  if (component === "Placa de vídeo") return compareGraphics(reference);
  return { status: "unknown", label: "Sem dados suficientes", note: "Não há critério documentado para este componente." };
}

function addText(parent, tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  parent.append(element);
  return element;
}

function addSourceLink(parent, title, url) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = title;
  parent.append(link);
}

function assessProgram(program, reference) {
  const card = document.createElement("article");
  card.className = "comparison-card";
  addText(card, "h3", "", program.name);
  addText(card, "p", "program-use", `Uso informado: ${program.usage}${program.features ? `; tarefa específica: ${program.features}` : ""}`);
  if (!reference) {
    addText(card, "span", "status unknown", "Sem dados suficientes");
    addText(card, "p", "comparison-note", "Não há uma referência de sistema cadastrada para este programa no MVP. Não avaliamos seus requisitos por analogia com outro software. Localize e confira a documentação oficial do fabricante, registre os mínimos e pesquise o mercado.");
    const table = document.createElement("div");
    table.className = "comparison-table";
    ["Processador", "Memória RAM", "Armazenamento", "Sistema operacional", "Resolução de tela", "Placa de vídeo"].forEach((component) => {
      const item = document.createElement("section");
      item.className = "comparison-item";
      addText(item, "h4", "", component);
      addText(item, "span", "status unknown", "Sem dados suficientes");
      addText(item, "p", "comparison-note", "Não há fonte compatível para este programa; consulte a documentação oficial da versão utilizada.");
      addText(item, "p", "relationship-note", `Relação com o uso: atividade declarada “${withoutTrailingPunctuation(program.usage)}”. Pesquise o requisito e justifique sua necessidade para esta carga de trabalho.`);
      table.append(item);
    });
    card.append(table);
    comparisonResults.append(card);
    return;
  }

  const source = document.createElement("p");
  source.className = "source-line";
  source.append("Fonte documentada: ");
  addSourceLink(source, reference.sourceTitle, reference.sourceUrl);
  const scopeText = reference.userProvided
    ? `Cadastro em ${reference.checkedOn}; fonte e valores informados pelo usuário, não verificados automaticamente.`
    : `Consulta registrada em ${reference.checkedOn || "data não informada"}.`;
  source.append(` ${scopeText}`);
  card.append(source);
  if (reference.userProvided) {
    const removeButton = addText(card, "button", "remove-reference", "Remover referência local");
    removeButton.type = "button";
    removeButton.addEventListener("click", () => {
      const previousReferences = customReferences;
      customReferences = customReferences.filter((item) => item.id !== reference.id);
      try {
        localStorage.setItem(referencesKey, JSON.stringify(customReferences));
      } catch {
        customReferences = previousReferences;
        setSaveStatus("Não foi possível remover a referência local", true);
        return;
      }
      updateMinimumReferenceOptions();
      renderComparison();
      saveDraft();
    });
  }
  if (reference.scope) addText(card, "p", "field-hint", reference.scope);

  const table = document.createElement("div");
  table.className = "comparison-table";
  const components = ["Processador", "Memória RAM", "Armazenamento", "Sistema operacional", "Resolução de tela", "Placa de vídeo"];
  components.forEach((component) => {
    const result = compareComponent(reference, component);
    const item = document.createElement("section");
    item.className = "comparison-item";
    addText(item, "h4", "", component);
    addText(item, "span", `status ${result.status}`, result.label);
    let requirement = "Não documentado nesta referência.";
    const requirements = reference.requirements || {};
    if (component === "Processador" && (requirements.cpuGhz || requirements.cpuCores)) {
      requirement = [requirements.cpuGhz && `${requirements.cpuGhz} GHz`, requirements.cpuCores && `${requirements.cpuCores} núcleos`].filter(Boolean).join(" e ");
    } else if (component === "Memória RAM" && requirements.memoryGb) requirement = `${requirements.memoryGb} GB mínimos`;
    else if (component === "Armazenamento" && requirements.storageGb) {
      requirement = requirements.storageKind === "capacity"
        ? `${requirements.storageGb} GB de capacidade total`
        : `${requirements.storageGb} GB de espaço livre disponível`;
    }
    else if (component === "Sistema operacional") requirement = requirements.operatingSystem || requirement;
    else if (component === "Resolução de tela" && requirements.displayWidth && requirements.displayHeight) requirement = `${requirements.displayWidth} × ${requirements.displayHeight} pixels`;
    else if (component === "Placa de vídeo") requirement = requirements.graphicsText || (requirements.graphicsDirectX ? `DirectX ${requirements.graphicsDirectX} ou posterior` : requirement);
    addText(item, "p", "reference-value", `Referência: ${requirement}`);
    addText(item, "p", "comparison-note", result.note);
    const useContext = withoutTrailingPunctuation(program.usage || form.elements.workDescription.value);
    addText(item, "p", "relationship-note", `Relação com o uso: ${useContext ? `atividade declarada “${useContext}”.` : "descreva a tarefa para explicar a relação com este requisito."} ${result.status === "unknown" || result.status === "above" ? "Justificativa técnica e/ou pesquisa de mercado a confirmar." : "Confirme se o mínimo atende à carga real e às tarefas simultâneas."}`);
    table.append(item);
  });
  card.append(table);
  comparisonResults.append(card);
}

function renderComparison() {
  comparisonResults.replaceChildren();
  comparisonRows = [];
  const programs = collectPrograms().filter((program) => program.name);
  if (programs.length === 0) {
    addText(comparisonResults, "p", "comparison-note", "Adicione os programas utilizados para pesquisar referências aplicáveis.");
    return;
  }
  programs.forEach((program) => {
    const reference = findReference(program);
    comparisonRows.push({ program, reference, results: reference
      ? ["Processador", "Memória RAM", "Armazenamento", "Sistema operacional", "Resolução de tela", "Placa de vídeo"].map((component) => ({ component, ...compareComponent(reference, component) }))
      : [] });
    assessProgram(program, reference);
  });
}

function updateMinimumReferenceOptions() {
  const select = document.querySelector("#minimum-reference");
  const currentValue = select.value;
  select.replaceChildren(new Option("Selecione uma referência de programa", ""));
  const references = [
    ...referenceSources.map((reference) => ({
      value: `builtin:${reference.id}`,
      label: reference.name,
    })),
    ...customReferences.map((reference) => ({
      value: `custom:${reference.id}`,
      label: `${reference.program} — referência cadastrada`,
    })),
  ];
  references.forEach((reference) => select.add(new Option(reference.label, reference.value)));
  if (references.some((reference) => reference.value === currentValue)) select.value = currentValue;
}

function fillFromMinimumReference() {
  const selected = document.querySelector("#minimum-reference").value;
  const status = document.querySelector("#reference-fill-status");
  const [kind, id] = selected.split(":");
  const reference = kind === "custom"
    ? customReferences.find((item) => item.id === id)
    : referenceSources.find((item) => item.id === id);
  if (!reference) {
    status.textContent = "Selecione uma referência disponível.";
    return;
  }
  const requirements = reference.requirements || {};
  const filled = [];
  if (requirements.cpuGhz || requirements.cpuCores) {
    const parts = [
      requirements.cpuGhz && `${requirements.cpuGhz} GHz`,
      requirements.cpuCores && `${requirements.cpuCores} núcleos`,
    ].filter(Boolean);
    form.elements.processor.value = parts.join(", ");
    filled.push("processador (mínimo publicado)");
  }
  if (requirements.memoryGb) {
    form.elements.memory.value = requirements.memoryGb;
    filled.push("RAM");
  }
  if (requirements.storageGb) {
    if (requirements.storageKind === "capacity") {
      form.elements.storage.value = `${requirements.storageGb} GB`;
      filled.push("capacidade total de armazenamento");
    } else {
      form.elements.freeStorageGb.value = requirements.storageGb;
      filled.push("espaço livre mínimo");
    }
  }
  if (requirements.operatingSystem) {
    form.elements.operatingSystem.value = requirements.operatingSystem;
    filled.push("sistema operacional");
  }
  if (requirements.displayWidth && requirements.displayHeight) {
    form.elements.displayResolution.value = `${requirements.displayWidth} x ${requirements.displayHeight}`;
    filled.push("resolução de tela");
  }
  if (requirements.graphicsDirectX) {
    form.elements.graphics.value = `Compatibilidade DirectX ${requirements.graphicsDirectX} (confirmar GPU e driver)`;
    filled.push("compatibilidade gráfica");
  } else if (requirements.graphicsText) {
    form.elements.graphics.value = requirements.graphicsText;
    filled.push("requisito gráfico (texto para conferência)");
  }
  status.textContent = filled.length
    ? `Preenchidos: ${filled.join(", ")}. Confirme se a versão do programa e o escopo da referência correspondem ao seu caso; os valores continuam editáveis.`
    : "A referência selecionada não contém valores de componentes que possam ser preenchidos.";
  saveDraft();
}

function addReferenceFromForm() {
  const program = readFormValue("referenceProgram");
  const sourceTitle = readFormValue("referenceTitle");
  const sourceUrl = readFormValue("referenceUrl");
  const error = document.querySelector("#reference-error");
  error.textContent = "";
  let url;
  try {
    url = new URL(sourceUrl);
  } catch {
    error.textContent = "Informe um endereço HTTPS válido para a documentação.";
    return;
  }
  const numericValues = {
    cpuGhz: readFormValue("referenceCpu"),
    cpuCores: readFormValue("referenceCores"),
    memoryGb: readFormValue("referenceMemory"),
    storageGb: readFormValue("referenceStorage"),
    graphicsDirectX: readFormValue("referenceDirectx"),
  };
  const graphicsText = readFormValue("referenceGraphics");
  const operatingSystem = readFormValue("referenceOs");
  const displayMatch = readFormValue("referenceDisplay").match(/(\d{3,5})\s*[x×]\s*(\d{3,5})/i);
  const storageKind = readFormValue("referenceStorageKind") || "freeSpace";
  const invalidNumeric = Object.entries(numericValues).some(([, value]) => value && (!Number.isFinite(Number(value)) || Number(value) <= 0));
  const hasNumericRequirement = Object.values(numericValues).some((value) => value && Number(value) > 0);
  if (invalidNumeric) {
    error.textContent = "Os valores numéricos de requisitos precisam ser maiores que zero.";
    return;
  }
  if (displayMatch && (Number(displayMatch[1]) <= 0 || Number(displayMatch[2]) <= 0)) {
    error.textContent = "As dimensões mínimas de tela precisam ser maiores que zero.";
    return;
  }
  if (!program || !sourceTitle || url.protocol !== "https:" || (!graphicsText && !operatingSystem && !displayMatch && !hasNumericRequirement)) {
    error.textContent = "Informe programa, título, URL HTTPS e ao menos um critério mínimo documentado.";
    return;
  }
  const requirements = {};
  Object.entries(numericValues).forEach(([key, value]) => {
    if (value) requirements[key] = Number(value);
  });
  if (numericValues.storageGb) requirements.storageKind = storageKind;
  if (graphicsText) requirements.graphicsText = graphicsText;
  if (operatingSystem) requirements.operatingSystem = operatingSystem;
  if (displayMatch) {
    requirements.displayWidth = Number(displayMatch[1]);
    requirements.displayHeight = Number(displayMatch[2]);
  }
  const reference = {
    id: `custom-${Date.now()}`,
    program,
    name: program,
    sourceTitle,
    sourceUrl: url.href,
    checkedOn: new Date().toISOString().slice(0, 10),
    requirements,
    scope: "Critérios transcritos pelo usuário a partir da fonte informada; verifique versão, sistema operacional e escopo antes de usar.",
    userProvided: true,
  };
  customReferences = customReferences.filter((entry) => normalizedName(entry.program) !== normalizedName(program));
  customReferences.push(reference);
  try {
    localStorage.setItem(referencesKey, JSON.stringify(customReferences));
  } catch {
    error.textContent = "Não foi possível salvar a referência neste navegador.";
    customReferences = loadCustomReferences();
    return;
  }
  ["referenceProgram", "referenceTitle", "referenceUrl", "referenceCpu", "referenceCores", "referenceMemory", "referenceStorage", "referenceStorageKind", "referenceDirectx", "referenceGraphics", "referenceOs", "referenceDisplay"]
    .forEach((name) => { form.elements.namedItem(name).value = ""; });
  updateMinimumReferenceOptions();
  renderComparison();
  saveDraft();
}

function citationLines() {
  const links = new Map();
  comparisonRows.forEach(({ reference }) => {
    if (reference) {
      const provenance = reference.userProvided
        ? `cadastro em ${reference.checkedOn}; valores transcritos pelo usuário e não verificados`
        : `consulta registrada em ${reference.checkedOn || "data não informada"}`;
      const citation = `${reference.sourceTitle} — ${provenance}\n  ${reference.sourceUrl}`;
      links.set(citation, citation);
    }
  });
  const etpNormUrl = "https://www.gov.br/compras/pt-br/acesso-a-informacao/legislacao/instrucoes-normativas/instrucao-normativa-seges-no-58-de-8-de-agosto-de-2022";
  const lawUrl = "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/L14133.htm";
  links.set(etpNormUrl, `Instrução Normativa SEGES nº 58/2022 — conferir aplicabilidade ao órgão e regulamento vigente.\n  ${etpNormUrl}`);
  links.set(lawUrl, `Lei nº 14.133/2021 — texto legal; confirmar atualização e regras aplicáveis.\n  ${lawUrl}`);
  return [...links.values()].map((citation) => `- ${citation}`);
}

function comparisonSummaryLines() {
  return comparisonRows.flatMap(({ program, reference, results }) => {
    if (!reference) return [
      `- ${program.name}: SEM DADOS SUFICIENTES — não há fonte cadastrada no MVP; pesquisar documentação oficial do fabricante.`,
      `  Uso informado: ${program.usage}${program.features ? `; tarefa: ${program.features}` : ""}.`,
    ];
    const rows = results.map((item) => `  - ${item.component}: ${item.label}. ${item.note}`);
    return [
      `- ${program.name} — ${reference.sourceTitle} (${reference.sourceUrl})`,
      `  Uso: ${program.usage}${program.features ? `; tarefa: ${program.features}` : ""}.`,
      ...rows,
    ];
  });
}

function generateEtpDraft() {
  const programs = collectPrograms().filter((program) => program.name)
    .map((program) => `- ${program.name}${program.version ? ` (${program.version})` : ""}: ${withoutTrailingPunctuation(program.usage)}${program.features ? `; tarefas/recursos: ${withoutTrailingPunctuation(program.features)}` : ""}.`).join("\n") || "[CONFIRMAR programas e atividades]";
  const quantity = readFormValue("peopleCount") || "[CONFIRMAR quantidade e memória de cálculo]";
  const workTitle = readFormValue("workTitle") || "[PREENCHER unidade requisitante]";
  const workDescription = readFormValue("workDescription") || "[PREENCHER necessidade e problema público]";
  const workload = readFormValue("workloadDetails") || "[CONFIRMAR simultaneidade, volume de arquivos e carga de trabalho]";
  const configuration = [
    `Processador: ${readFormValue("processor") || "[A DEFINIR, com justificativa e pesquisa de mercado]"}`,
    `Memória RAM: ${readFormValue("memory") ? `${readFormValue("memory")} GB` : "[A DEFINIR; justificar com carga real]"}`,
    `Armazenamento/capacidade total: ${readFormValue("storage") || "[A DEFINIR]"}`,
    `Espaço livre previsto: ${readFormValue("freeStorageGb") ? `${readFormValue("freeStorageGb")} GB` : "[CONFIRMAR; não inferido da capacidade total]"}`,
    `Sistema operacional: ${readFormValue("operatingSystem") || "[CONFIRMAR versão e ciclo de suporte]"}`,
    `Resolução de tela: ${readFormValue("displayResolution") || "[CONFIRMAR dimensões e escala necessárias]"}`,
    `Placa de vídeo: ${readFormValue("graphics") || "[A DEFINIR ou justificar ausência]"}`,
  ].map((line) => `- ${line}`).join("\n");
  const operational = [
    `Garantia/assistência: ${readFormValue("supportRequirements") || "[PESQUISAR SLA, cobertura, prazo e disponibilidade de mercado]"}`,
    `Compatibilidade/mobilidade: ${readFormValue("otherRequirements") || "[CONFIRMAR interfaces, sistemas e necessidade de transporte]"}`,
  ].map((line) => `- ${line}`).join("\n");
  const pending = [
    "Validar a versão e os requisitos oficiais de todos os programas e sistemas operacionais usados.",
    "Pesquisar mercado, fornecedores, alternativas, preços e disponibilidade; não inferir marca ou modelo.",
    "Justificar cada requisito acima do mínimo de referência e cada requisito que possa restringir a competição.",
    "Confirmar quantitativos, memória de cálculo, PCA, contratações relacionadas e solução escolhida.",
    "Verificar compatibilidade com normas locais e a aplicabilidade da IN SEGES nº 58/2022.",
  ].map((item) => `- [ ] ${item}`).join("\n");
  return [
    "ESTUDO TÉCNICO PRELIMINAR — RASCUNHO PARA REVISÃO",
    `Gerado em ${new Date().toLocaleDateString("pt-BR")}.`,
    "Documento de apoio editável; não é aprovação, parecer ou documento oficial.",
    "",
    "1. Descrição da necessidade da contratação",
    `Unidade/atividade: ${workTitle}.`,
    `Necessidade informada: ${workDescription}`,
    `Contexto: frequência ${readFormValue("useFrequency") || "[CONFIRMAR]"}; impacto da indisponibilidade ${readFormValue("workImpact") || "[CONFIRMAR]"}; local ${readFormValue("workLocation") || "[CONFIRMAR]"}; tarefas e arquivos: ${workload}.`,
    "",
    "2. Requisitos da contratação e justificativas",
    "Programas e tarefas:",
    programs,
    "Proposta de configuração registrada (não validada):",
    configuration,
    "Requisitos operacionais informados:",
    operational,
    "Justificar os requisitos em função da necessidade, desempenho esperado, sustentabilidade e competitividade; não tratar mínimos de fabricante como recomendação de compra.",
    "",
    "3. Levantamento de mercado e comparação com referências",
    ...comparisonSummaryLines(),
    "[PESQUISA DE MERCADO PENDENTE: alternativas de solução, contratações comparáveis, fornecedores, preços e disponibilidade. Referências de software documentam mínimos, não comprovam que a especificação seja competitiva ou adequada à carga real.]",
    "",
    "4. Descrição da solução como um todo",
    "[DEFINIR solução, implantação, garantia, assistência técnica, suporte, compatibilidade e ciclo de vida com base na pesquisa de mercado.]",
    "",
    "5. Estimativa das quantidades e memória de cálculo",
    `Pessoas/quantidade informada: ${quantity}. [CONFIRMAR equipamentos por pessoa/unidade, memória de cálculo e interdependências.]`,
    "",
    "6. Estimativa do valor da contratação",
    "[PESQUISAR preços e registrar fontes, data, método, memória de cálculo e análise crítica. Nenhum preço foi estimado por este sistema.]",
    "",
    "7. Justificativa para parcelamento ou não",
    "[ANALISAR parcelamento, lotes e efeitos sobre competição e economia de escala.]",
    "",
    "8. Contratações correlatas ou interdependentes",
    "[CONFIRMAR contratos, licenças, infraestrutura e serviços relacionados.]",
    "",
    "9. Alinhamento com o Plano de Contratações Anual",
    "[CONFIRMAR previsão no PCA e instrumentos de planejamento aplicáveis.]",
    "",
    "10. Resultados pretendidos",
    "[DEFINIR resultados mensuráveis, economicidade e melhor aproveitamento de recursos, sem prometer ganhos ainda não medidos.]",
    "",
    "11. Providências prévias à contratação",
    "[CONFIRMAR infraestrutura, licenças, capacitação, integração, recebimento, fiscalização e gestão contratual.]",
    "",
    "12. Possíveis impactos ambientais e medidas mitigadoras",
    "[AVALIAR consumo de energia, durabilidade, logística reversa, reciclagem e requisitos de sustentabilidade aplicáveis.]",
    "",
    "13. Posicionamento conclusivo",
    "[PREENCHER após validação técnica, pesquisa de mercado, estimativa de valor e análise de viabilidade. Não concluir automaticamente pela contratação.]",
    "",
    "14. Premissas, fontes e pontos a confirmar",
    "Premissas: informações de uso e configuração foram fornecidas pelo solicitante; campos em aberto não foram inferidos. Comparações são mecânicas e limitadas aos critérios documentados abaixo.",
    "Fontes documentais:",
    ...citationLines(),
    "Pontos pendentes:",
    pending,
    "",
    "Limites e revisão: o modelo da IN SEGES nº 58/2022 se aplica ao âmbito descrito na própria norma; confirmar regras do órgão, alterações posteriores e legislação local. A pessoa/equipe responsável deve revisar e editar este rascunho antes de utilizá-lo.",
  ].join("\n");
}

function downloadText(filename, content) {
  const blob = new Blob(["\uFEFF", content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function validateEtpEditor() {
  if (etpEditor.value.trim()) return true;
  showError(5, "O rascunho está vazio. Use “Atualizar a partir do levantamento” para gerar uma versão inicial.");
  etpEditor.focus();
  return false;
}

function resetNewDraft() {
  const existing = getSavedDraft();
  if (existing && !window.confirm("Começar um novo levantamento? O rascunho atual será substituído neste navegador.")) return;
  openWorkspace();
}

document.querySelector("#start-button").addEventListener("click", resetNewDraft);
document.querySelector("#resume-button").addEventListener("click", () => {
  const draft = getSavedDraft();
  if (draft) openWorkspace(draft);
});
document.querySelector("#new-button").addEventListener("click", resetNewDraft);
document.querySelector("#home-button").addEventListener("click", showHome);
document.querySelector("#home-link").addEventListener("click", (event) => {
  event.preventDefault();
  if (!workspace.hidden) showHome();
});
addSoftwareButton.addEventListener("click", () => {
  showError(2);
  addSoftware();
  softwareList.lastElementChild.querySelector('[name="softwareName"]').focus();
  saveDraft();
});
document.querySelector("#add-reference").addEventListener("click", addReferenceFromForm);
document.querySelector("#fill-reference").addEventListener("click", fillFromMinimumReference);
document.querySelector("#regenerate-etp").addEventListener("click", () => {
  etpEditor.value = generateEtpDraft();
  showError(5);
  saveDraft();
});
document.querySelector("#download-etp").addEventListener("click", () => {
  if (validateEtpEditor()) downloadText(`rascunho-etp-${new Date().toISOString().slice(0, 10)}.txt`, etpEditor.value);
});
finishButton.addEventListener("click", showHome);
backButton.addEventListener("click", () => {
  const previousStep = currentStep - 1;
  renderStep(previousStep);
  if (previousStep === 4) renderComparison();
  saveDraft();
});
nextButton.addEventListener("click", () => {
  if (!validateStep(currentStep)) return;
  if (currentStep === 3) renderComparison();
  if (currentStep === 4 && !etpEditor.value.trim()) etpEditor.value = generateEtpDraft();
  renderStep(currentStep + 1);
  saveDraft();
});

form.addEventListener("input", (event) => {
  if (event.target.matches("input, textarea")) event.target.removeAttribute("aria-invalid");
  if (event.target.id === "etp-draft") showError(5);
  if (currentStep === 4 && !event.target.matches("[name^='reference']")) renderComparison();
  saveDraft();
});
form.addEventListener("change", (event) => {
  if (currentStep === 4 && !event.target.matches("[name^='reference']")) renderComparison();
  saveDraft();
});

customReferences = loadCustomReferences();
updateMinimumReferenceOptions();
updateHomeActions();
