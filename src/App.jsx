import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Loader2, Building2, CalendarDays, LayoutGrid, Users, ListChecks, Contact, Briefcase } from "lucide-react";
import { STORAGE_MEMBERS, STORAGE_EVENTS, STORAGE_MEETINGS, STORAGE_PARTNERS, STORAGE_ROTINA, STORAGE_CONTACTS, STORAGE_SERVICES, ESTADOS, STATUS_MEMBER } from "./constants";
import { SEED_SERVICES, FORCE_SERVICE_UPDATES, SEED_CONTACTS, SEED_ROTINA_TASKS, SEED_EVENTS, FORCE_EVENT_UPDATES, FORCE_MEMBER_UPDATES, SEED_MEMBERS, ENSURE_MEMBERS } from "./data/seeds";
import { SEED_MEETINGS } from "./data/seedMeetings";
import { blankContact, blankService, blankMeeting, blankPartner, blankMember, blankEvent } from "./lib/factories";
import { useGoogleFonts } from "./lib/useGoogleFonts";
import LOGO_URL from "./assets/logo-ccib.png";
import { storage } from "./lib/storage";
import { callMcpForJson, MCP_HUBSPOT, MCP_MICROSOFT_365 } from "./lib/claude";
import RotinaTab from "./tabs/RotinaTab";
import VisaoGeralTab from "./tabs/VisaoGeralTab";
import EmpresasTab from "./tabs/EmpresasTab";
import ServicosTab from "./tabs/ServicosTab";
import ContatosTab from "./tabs/ContatosTab";
import ReunioesTab from "./tabs/ReunioesTab";
import EventosTab from "./tabs/EventosTab";
import "./styles.css";

export default function App() {
  useGoogleFonts();
  const [tab, setTab] = useState("visao");
  const hasAutoSyncedTeams = useRef(false);
  const [members, setMembers] = useState(null);
  const [events, setEvents] = useState(null);
  const [meetings, setMeetings] = useState(null);
  const [partners, setPartners] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [memberFilterEstado, setMemberFilterEstado] = useState("todos");
  const [memberFilterStatus, setMemberFilterStatus] = useState("todos");
  const [eventFilterStatus, setEventFilterStatus] = useState("todos");
  const [memberSearch, setMemberSearch] = useState("");
  const [expandedMembers, setExpandedMembers] = useState(new Set());
  const [expandedPartners, setExpandedPartners] = useState(new Set());
  const [expandedMeetings, setExpandedMeetings] = useState(new Set());
  // Agenda de reuniões: a partir de qual semana (0 = esta) e quantas semanas mostrar
  const [meetingWeeks, setMeetingWeeks] = useState({ offset: 0, count: 2 });
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [expandedEvents, setExpandedEvents] = useState(new Set());
  const [syncingTeams, setSyncingTeams] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [hubspotBusy, setHubspotBusy] = useState(null);
  const [hubspotError, setHubspotError] = useState(null);
  const [hubspotMessage, setHubspotMessage] = useState(null);
  const [contacts, setContacts] = useState(null);
  const [contactSearch, setContactSearch] = useState("");
  const [expandedContacts, setExpandedContacts] = useState(new Set());
  const [services, setServices] = useState(null);
  const [serviceFilterTipo, setServiceFilterTipo] = useState("todos");
  const [expandedServices, setExpandedServices] = useState(new Set());
  const [rotina, setRotina] = useState(null);
  const [newRotinaText, setNewRotinaText] = useState("");

  const persistMembers = useCallback(async (next) => {
    setSaving(true);
    try {
      await storage.set(STORAGE_MEMBERS, JSON.stringify(next), true);
    } catch (e) {
      console.error("Falha ao salvar associados", e);
      setLoadError("Não foi possível salvar as empresas. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, []);

  const persistEvents = useCallback(async (next) => {
    setSaving(true);
    try {
      await storage.set(STORAGE_EVENTS, JSON.stringify(next), true);
    } catch (e) {
      console.error("Falha ao salvar eventos", e);
      setLoadError("Não foi possível salvar os eventos. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, []);

  const persistMeetings = useCallback(async (next) => {
    setSaving(true);
    try {
      await storage.set(STORAGE_MEETINGS, JSON.stringify(next), true);
    } catch (e) {
      console.error("Falha ao salvar reuniões", e);
      setLoadError("Não foi possível salvar as reuniões. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, []);

  const persistPartners = useCallback(async (next) => {
    setSaving(true);
    try {
      await storage.set(STORAGE_PARTNERS, JSON.stringify(next), true);
    } catch (e) {
      console.error("Falha ao salvar parceiros", e);
      setLoadError("Não foi possível salvar os parceiros. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, []);

  const persistRotina = useCallback(async (next) => {
    setSaving(true);
    try {
      await storage.set(STORAGE_ROTINA, JSON.stringify(next), true);
    } catch (e) {
      console.error("Falha ao salvar rotina", e);
      setLoadError("Não foi possível salvar a rotina. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, []);

  const persistContacts = useCallback(async (next) => {
    setSaving(true);
    try {
      await storage.set(STORAGE_CONTACTS, JSON.stringify(next), true);
    } catch (e) {
      console.error("Falha ao salvar contatos", e);
      setLoadError("Não foi possível salvar os contatos. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, []);

  const persistServices = useCallback(async (next) => {
    setSaving(true);
    try {
      await storage.set(STORAGE_SERVICES, JSON.stringify(next), true);
    } catch (e) {
      console.error("Falha ao salvar serviços", e);
      setLoadError("Não foi possível salvar os serviços. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, []);

  const safeGet = async (key, shared) => {
    try {
      return await storage.get(key, shared);
    } catch (e) {
      return null;
    }
  };

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const r = await safeGet(STORAGE_MEMBERS, true);
      const parsedM = r && r.value ? JSON.parse(r.value) : [];
      const baseMembers = parsedM.length > 0 ? parsedM : SEED_MEMBERS;
      // Compara nomes sem diferenciar maiúsculas e espaços, para não duplicar empresas já cadastradas
      const normalizeName = (nome) => (nome || "").trim().toLowerCase();
      const existingMemberNames = new Set(baseMembers.map((m) => normalizeName(m.nome)));
      const missingMemberSeeds = ENSURE_MEMBERS.filter((s) => !existingMemberNames.has(normalizeName(s.nome)));
      const mergedMembers = missingMemberSeeds.length > 0 ? [...baseMembers, ...missingMemberSeeds] : baseMembers;
      let forcedChangedMembers = false;
      const withForcedMembers = mergedMembers.map((m) => {
        const force = FORCE_MEMBER_UPDATES[m.nome];
        if (!force) return m;
        const patch = {};
        Object.keys(force).forEach((k) => {
          if (m[k] !== force[k]) patch[k] = force[k];
        });
        if (Object.keys(patch).length === 0) return m;
        forcedChangedMembers = true;
        return { ...m, ...patch };
      });
      setMembers(withForcedMembers);
      if (parsedM.length === 0 || missingMemberSeeds.length > 0 || forcedChangedMembers) {
        await persistMembers(withForcedMembers);
      }
    } catch (e) {
      console.error("Falha ao carregar associados (provavelmente ainda não há dados salvos)", e);
      setMembers([]);
    }
    try {
      const r = await safeGet(STORAGE_EVENTS, true);
      const parsed = r && r.value ? JSON.parse(r.value) : [];
      const existingNames = new Set(parsed.map((e) => e.nome));
      const missingSeeds = SEED_EVENTS.filter((s) => !existingNames.has(s.nome));
      const withSeeds = missingSeeds.length > 0 ? [...parsed, ...missingSeeds] : parsed;
      let forcedChanged = false;
      const withForcedUpdates = withSeeds.map((e) => {
        const force = FORCE_EVENT_UPDATES[e.nome];
        if (!force) return e;
        const patch = {};
        Object.keys(force).forEach((k) => {
          if (e[k] !== force[k]) patch[k] = force[k];
        });
        if (Object.keys(patch).length === 0) return e;
        forcedChanged = true;
        return { ...e, ...patch };
      });
      const todayStrE = new Date().toISOString().slice(0, 10);
      let autoChangedE = false;
      const withAutoStatusE = withForcedUpdates.map((e) => {
        if (e.data && e.data < todayStrE && (e.status === "planejado" || e.status === "confirmado")) {
          autoChangedE = true;
          return { ...e, status: "realizado" };
        }
        return e;
      });
      setEvents(withAutoStatusE);
      if (missingSeeds.length > 0 || autoChangedE || forcedChanged) {
        await persistEvents(withAutoStatusE);
      }
    } catch (e) {
      console.error("Falha ao carregar eventos (provavelmente ainda não há dados salvos)", e);
      setEvents([]);
    }
    try {
      const r = await safeGet(STORAGE_MEETINGS, true);
      const parsed = r && r.value ? JSON.parse(r.value) : [];
      const existingNames = new Set(parsed.map((m) => m.nome));
      const missingSeeds = SEED_MEETINGS.filter((s) => !existingNames.has(s.nome));
      const withSeeds = missingSeeds.length > 0 ? [...parsed, ...missingSeeds] : parsed;
      const todayStr = new Date().toISOString().slice(0, 10);
      let autoChanged = false;
      const withAutoStatus = withSeeds.map((m) => {
        if (m.data && m.data < todayStr && (m.status === "agendada" || m.status === "confirmada")) {
          autoChanged = true;
          return { ...m, status: "realizada" };
        }
        return m;
      });
      setMeetings(withAutoStatus);
      if (missingSeeds.length > 0 || autoChanged) {
        await persistMeetings(withAutoStatus);
      }
    } catch (e) {
      console.error("Falha ao carregar reuniões (provavelmente ainda não há dados salvos)", e);
      setMeetings([]);
    }
    try {
      const r = await safeGet(STORAGE_PARTNERS, true);
      setPartners(r && r.value ? JSON.parse(r.value) : []);
    } catch (e) {
      console.error("Falha ao carregar parceiros (provavelmente ainda não há dados salvos)", e);
      setPartners([]);
    }
    try {
      const r = await safeGet(STORAGE_ROTINA, true);
      const parsed = r && r.value ? JSON.parse(r.value) : { tasks: [], completions: {} };
      const tasks = parsed.tasks || [];
      const completions = parsed.completions || {};
      const existingTexts = new Set(tasks.map((t) => t.text));
      const missingSeeds = SEED_ROTINA_TASKS.filter((s) => !existingTexts.has(s.text));
      const mergedTasks = missingSeeds.length > 0 ? [...tasks, ...missingSeeds] : tasks;
      const mergedRotina = { tasks: mergedTasks, completions };
      setRotina(mergedRotina);
      if (missingSeeds.length > 0 || !r || !r.value) {
        await persistRotina(mergedRotina);
      }
    } catch (e) {
      console.error("Falha ao carregar rotina (provavelmente ainda não há dados salvos)", e);
      setRotina({ tasks: SEED_ROTINA_TASKS, completions: {} });
    }
    try {
      const r = await safeGet(STORAGE_CONTACTS, true);
      const parsedContacts = r && r.value ? JSON.parse(r.value) : [];
      const existingEmails = new Set(parsedContacts.map((c) => c.email));
      const missingContactSeeds = SEED_CONTACTS.filter((s) => !existingEmails.has(s.email));
      const mergedContacts = missingContactSeeds.length > 0 ? [...parsedContacts, ...missingContactSeeds] : parsedContacts;
      setContacts(mergedContacts);
      if (missingContactSeeds.length > 0) {
        await persistContacts(mergedContacts);
      }
    } catch (e) {
      console.error("Falha ao carregar contatos (provavelmente ainda não há dados salvos)", e);
      setContacts(SEED_CONTACTS);
    }
    try {
      const r = await safeGet(STORAGE_SERVICES, true);
      const parsed = r && r.value ? JSON.parse(r.value) : [];
      const existingKeys = new Set(parsed.map((s) => `${s.empresa}__${s.servico}`));
      const missingSeeds = SEED_SERVICES.filter((s) => !existingKeys.has(`${s.empresa}__${s.servico}`));
      const withSeeds = missingSeeds.length > 0 ? [...parsed, ...missingSeeds] : parsed;
      let forcedChangedServices = false;
      const withForcedUpdates = withSeeds.map((s) => {
        const force = FORCE_SERVICE_UPDATES[`${s.empresa}__${s.servico}`];
        if (!force) return s;
        const patch = {};
        Object.keys(force).forEach((k) => {
          if (s[k] !== force[k]) patch[k] = force[k];
        });
        if (Object.keys(patch).length === 0) return s;
        forcedChangedServices = true;
        return { ...s, ...patch };
      });
      setServices(withForcedUpdates);
      if (missingSeeds.length > 0 || forcedChangedServices) {
        await persistServices(withForcedUpdates);
      }
    } catch (e) {
      console.error("Falha ao carregar serviços (provavelmente ainda não há dados salvos)", e);
      setServices(SEED_SERVICES);
    }
  }, [persistMembers, persistEvents, persistMeetings, persistPartners, persistRotina, persistContacts, persistServices]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateMembers = (next) => {
    setMembers(next);
    persistMembers(next);
  };

  const updateEvents = (next) => {
    setEvents(next);
    persistEvents(next);
  };

  const updateMeetings = (next) => {
    setMeetings(next);
    persistMeetings(next);
  };

  const addMember = (status) => {
    const novo = blankMember();
    if (status) novo.status = status;
    updateMembers([...(members || []), novo]);
    setExpandedMembers((prev) => new Set([...prev, novo.id]));
  };
  const patchMember = (id, patch) =>
    updateMembers((members || []).map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const removeMember = (id) => updateMembers((members || []).filter((m) => m.id !== id));
  const toggleMemberExpand = (id) =>
    setExpandedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const makeToggle = (setFn) => (id) =>
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const togglePartnerExpand = makeToggle(setExpandedPartners);
  const toggleMeetingExpand = makeToggle(setExpandedMeetings);
  const toggleContactExpand = makeToggle(setExpandedContacts);
  const toggleEventExpand = makeToggle(setExpandedEvents);

  const addEvent = (status) => {
    const novo = blankEvent();
    if (status) novo.status = status;
    updateEvents([...(events || []), novo]);
    setExpandedEvents((prev) => new Set([...prev, novo.id]));
  };
  const patchEvent = (id, patch) =>
    updateEvents((events || []).map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeEvent = (id) => updateEvents((events || []).filter((e) => e.id !== id));

  const addMeeting = (status) => {
    const novo = blankMeeting();
    if (status) novo.status = status;
    // Nasce com a data de hoje e já aberta para edição, para aparecer na agenda da semana
    const hoje = new Date();
    novo.data = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
    updateMeetings([...(meetings || []), novo]);
    setExpandedMeetings((prev) => new Set([...prev, novo.id]));
    setMeetingWeeks((w) => ({ offset: 0, count: Math.max(w.count, 2) }));
    setSelectedMeetingId(novo.id);
  };
  const patchMeeting = (id, patch) =>
    updateMeetings((meetings || []).map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const removeMeeting = (id) => updateMeetings((meetings || []).filter((m) => m.id !== id));

  const syncTeamsCalendar = async () => {
    setSyncingTeams(true);
    setSyncError(null);
    try {
      const now = new Date();
      const y = now.getFullYear();
      const mo = now.getMonth();
      const startDate = new Date(y, mo, 1).toISOString().slice(0, 10);
      const endDate = new Date(y, mo + 1, 0).toISOString().slice(0, 10);

      const prompt = `Liste todos os compromissos/reuniões do meu calendário do Microsoft 365 / Outlook / Teams entre ${startDate} e ${endDate} (inclusive). Responda APENAS com um array JSON, sem markdown, sem explicação, sem texto antes ou depois. Cada item deve ter exatamente este formato: {"nome": "título do compromisso", "data": "AAAA-MM-DD", "horario": "HH:MM – HH:MM ou vazio se não souber", "local": "local ou link da reunião, ou vazio", "participantes": "nomes ou e-mails separados por vírgula, ou vazio"}. Se não houver nenhum compromisso no período, responda [].`;
      const parsedEvents = await callMcpForJson(prompt, MCP_MICROSOFT_365);

      const existingKeys = new Set((meetings || []).map((m) => `${m.nome}__${m.data}`));
      const novasReunioes = parsedEvents
        .filter((ev) => ev && ev.nome && !existingKeys.has(`${ev.nome}__${ev.data || ""}`))
        .map((ev) => ({
          id: `teams-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          nome: ev.nome || "",
          data: ev.data || "",
          horario: ev.horario || "",
          participantes: ev.participantes || "",
          local: ev.local || "",
          responsavel: "ambos",
          status: "confirmada",
          notas: "Importado do Teams/Outlook",
          origem: "teams",
          createdAt: Date.now(),
        }));

      if (novasReunioes.length > 0) {
        updateMeetings([...(meetings || []), ...novasReunioes]);
      }
      setLastSyncedAt(new Date());
    } catch (e) {
      console.error("Falha ao sincronizar com o Teams", e);
      setSyncError("Não foi possível sincronizar com o Teams/Outlook agora. Tente novamente.");
    } finally {
      setSyncingTeams(false);
    }
  };

  useEffect(() => {
    if (tab === "reunioes" && !hasAutoSyncedTeams.current && meetings !== null) {
      hasAutoSyncedTeams.current = true;
      syncTeamsCalendar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, meetings]);

  const pullDealsFromHubspot = async () => {
    setHubspotBusy("pull-deals");
    setHubspotError(null);
    setHubspotMessage(null);
    try {
      const prompt = `Usando o HubSpot conectado, liste todos os meus negócios (deals) no CRM. Para cada um, retorne: nome (nome do negócio, ou da empresa associada se o negócio não tiver nome próprio), valor (amount formatado como texto, ex: "R$ 1.200,00", ou vazio se não houver), etapa (nome da etapa/dealstage) e status_sugerido (use exatamente "ativo" se a etapa for closed won/ganho, "inativo" se for closed lost/perdido, e "prospeccao" para qualquer outra etapa em andamento). Responda APENAS com um array JSON, sem markdown, sem texto antes ou depois, neste formato: [{"nome": "...", "valor": "... ou vazio", "etapa": "... ou vazio", "status_sugerido": "ativo, prospeccao ou inativo"}]. Se não houver negócios, responda [].`;
      const pulled = await callMcpForJson(prompt, MCP_HUBSPOT);
      const existingNames = new Set((members || []).map((m) => m.nome));
      const validStatus = new Set(Object.keys(STATUS_MEMBER));
      const novas = pulled
        .filter((d) => d && d.nome && !existingNames.has(d.nome))
        .map((d) => ({
          ...blankMember(),
          id: `hubspot-deal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          nome: d.nome,
          valor: d.valor || "",
          tipoVinculo: d.etapa ? `Negócio HubSpot (${d.etapa})` : "Negócio HubSpot",
          status: validStatus.has(d.status_sugerido) ? d.status_sugerido : "prospeccao",
          notas: "Importado do HubSpot (negócio)",
        }));
      if (novas.length > 0) {
        updateMembers([...(members || []), ...novas]);
      }
      setHubspotMessage(`${novas.length} negócio${novas.length === 1 ? "" : "s"} importado${novas.length === 1 ? "" : "s"} do HubSpot para Empresas.`);
    } catch (e) {
      console.error("Falha ao puxar negócios do HubSpot", e);
      setHubspotError("Não foi possível puxar os negócios do HubSpot agora.");
    } finally {
      setHubspotBusy(null);
    }
  };

  const pullContactsFromHubspot = async () => {
    setHubspotBusy("pull-contacts");
    setHubspotError(null);
    setHubspotMessage(null);
    try {
      const prompt = `Usando o HubSpot conectado, liste meus contatos no CRM. Para cada um, retorne: nome (nome completo), empresa (nome da empresa associada, se houver), email, telefone e cargo (jobtitle), quando disponíveis. Responda APENAS com um array JSON, sem markdown, sem texto antes ou depois, neste formato: [{"nome": "...", "empresa": "... ou vazio", "email": "... ou vazio", "telefone": "... ou vazio", "cargo": "... ou vazio"}]. Se não houver contatos, responda [].`;
      const pulled = await callMcpForJson(prompt, MCP_HUBSPOT);
      const existingKeys = new Set((contacts || []).map((c) => `${c.nome}__${c.email || ""}`));
      const novos = pulled
        .filter((c) => c && c.nome && !existingKeys.has(`${c.nome}__${c.email || ""}`))
        .map((c) => ({
          ...blankContact(),
          id: `hubspot-contact-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          nome: c.nome,
          empresa: c.empresa || "",
          email: c.email || "",
          telefone: c.telefone || "",
          cargo: c.cargo || "",
        }));
      if (novos.length > 0) {
        updateContacts([...(contacts || []), ...novos]);
      }
      setHubspotMessage(`${novos.length} contato${novos.length === 1 ? "" : "s"} importado${novos.length === 1 ? "" : "s"} do HubSpot.`);
    } catch (e) {
      console.error("Falha ao puxar contatos do HubSpot", e);
      setHubspotError("Não foi possível puxar os contatos do HubSpot agora.");
    } finally {
      setHubspotBusy(null);
    }
  };

  const updatePartners = (next) => {
    setPartners(next);
    persistPartners(next);
  };
  const addPartner = (status) => {
    const novo = blankPartner();
    if (status) novo.status = status;
    updatePartners([...(partners || []), novo]);
    setExpandedPartners((prev) => new Set([...prev, novo.id]));
  };
  const patchPartner = (id, patch) =>
    updatePartners((partners || []).map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const removePartner = (id) => updatePartners((partners || []).filter((p) => p.id !== id));

  const updateRotina = (next) => {
    setRotina(next);
    persistRotina(next);
  };
  const addRotinaTask = () => {
    const text = newRotinaText.trim();
    if (!text || !rotina) return;
    const novaTask = { id: `rot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text };
    updateRotina({ ...rotina, tasks: [...rotina.tasks, novaTask] });
    setNewRotinaText("");
  };
  const removeRotinaTask = (id) => {
    if (!rotina) return;
    const { [id]: _removed, ...restCompletions } = rotina.completions;
    updateRotina({ tasks: rotina.tasks.filter((t) => t.id !== id), completions: restCompletions });
  };
  const toggleRotinaToday = (id) => {
    if (!rotina) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    const isDoneToday = rotina.completions[id] === todayStr;
    const nextCompletions = { ...rotina.completions };
    if (isDoneToday) {
      delete nextCompletions[id];
    } else {
      nextCompletions[id] = todayStr;
    }
    updateRotina({ ...rotina, completions: nextCompletions });
  };

  const updateContacts = (next) => {
    setContacts(next);
    persistContacts(next);
  };
  const addContact = () => updateContacts([...(contacts || []), blankContact()]);
  const patchContact = (id, patch) =>
    updateContacts((contacts || []).map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const removeContact = (id) => updateContacts((contacts || []).filter((c) => c.id !== id));

  const updateServices = (next) => {
    setServices(next);
    persistServices(next);
  };
  const addService = (servico) => {
    const novo = blankService(servico);
    updateServices([...(services || []), novo]);
    setExpandedServices((prev) => new Set([...prev, novo.id]));
  };
  const patchService = (id, patch) =>
    updateServices((services || []).map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const removeService = (id) => updateServices((services || []).filter((s) => s.id !== id));

  const modalidadeSuggestions = useMemo(() => {
    if (!members) return [];
    return [...new Set(members.map((m) => m.modalidade).filter(Boolean))];
  }, [members]);

  const tipoVinculoSuggestions = useMemo(() => {
    if (!members) return [];
    return [...new Set(members.map((m) => m.tipoVinculo).filter(Boolean))];
  }, [members]);

  const memberNameSuggestions = useMemo(() => {
    if (!members) return [];
    return [...new Set(members.map((m) => m.nome).filter(Boolean))];
  }, [members]);

  const tipoParceriaSuggestions = useMemo(() => {
    if (!partners) return [];
    return [...new Set(partners.map((p) => p.tipoParceria).filter(Boolean))];
  }, [partners]);

  const loading = members === null || events === null || meetings === null || partners === null || rotina === null || contacts === null || services === null;

  if (loading) {
    return (
      <div
        style={{
          background: "#FFFFFF",
          minHeight: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'IBM Plex Sans', sans-serif",
          color: "#8992A6",
        }}
      >
        <Loader2 className="animate-spin" size={20} style={{ marginRight: 10 }} />
        Carregando plataforma...
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = events
    .filter((e) => e.status !== "cancelado" && (!e.data || e.data >= today))
    .sort((a, b) => (a.data || "9999").localeCompare(b.data || "9999"))
    .slice(0, 5);

  const upcomingMeetings = meetings
    .filter((m) => m.status !== "cancelada" && (!m.data || m.data >= today))
    .sort((a, b) => (a.data || "9999").localeCompare(b.data || "9999"))
    .slice(0, 5);

  const pastEvents = events
    .filter((e) => e.status === "realizado")
    .sort((a, b) => (b.data || "0000").localeCompare(a.data || "0000"))
    .slice(0, 5);

  const byEstado = ESTADOS.map((uf) => ({
    uf,
    count: members.filter((m) => m.estado === uf).length,
  }));

  const ativos = members.filter((m) => m.status === "ativo").length;
  const prospeccao = members.filter((m) => m.status === "prospeccao").length;
  const inativos = members.filter((m) => m.status === "inativo").length;

  const TABS = [
    { id: "visao", label: "Visão Geral", icon: LayoutGrid },
    { id: "associados", label: "Empresas", icon: Building2 },
    { id: "servicos", label: "Serviços", icon: Briefcase },
    { id: "contatos", label: "Contatos", icon: Contact },
    { id: "reunioes", label: "Reuniões", icon: Users },
    { id: "eventos", label: "Eventos", icon: CalendarDays },
    { id: "rotina", label: "Rotina", icon: ListChecks },
  ];

  return (
    <div
      style={{
        background: "#FFFFFF",
        minHeight: "600px",
        fontFamily: "'IBM Plex Sans', sans-serif",
        color: "#1B2438",
      }}
    >
      <div style={{ background: "#0B2545", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ height: 4, width: "100%", background: "linear-gradient(to right, #FF9933 0%, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0E7C3A 66.66%, #0E7C3A 100%)" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {LOGO_URL ? (
              <img src={LOGO_URL} alt="CCIB" style={{ height: 44, width: "auto", display: "block", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 13, color: "#FF9933", flexShrink: 0 }}>RS</div>
            )}
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#FF9933" }}>CCIB · Regional Sul</div>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 20, color: "#FFFFFF", margin: 0, lineHeight: 1.2 }}>Plataforma CCIB Regional Sul</h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
              {saving ? "salvando…" : `${members.length} empresas · ${meetings.length} reuniões · ${events.length} eventos`}
            </div>
            <button
              onClick={loadData}
              title="Recarregar dados salvos"
              className="ccib-btn"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "5px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.55)", cursor: "pointer" }}
            >
              Recarregar
            </button>
          </div>
        </div>
        <div style={{ height: 3, background: "linear-gradient(to right, #FF9933, #0E7C3A)" }} />
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 80px)" }}>
        <nav
          style={{
            width: 200,
            flexShrink: 0,
            background: "#0E1B2E",
            padding: "12px 0",
            position: "sticky",
            top: 80,
            height: "calc(100vh - 80px)",
            overflowY: "auto",
          }}
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="ccib-sidebar-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  background: active ? "rgba(255,255,255,0.08)" : "transparent",
                  color: active ? "#FFFFFF" : "rgba(255,255,255,0.45)",
                  border: "none",
                  borderLeft: active ? "3px solid #FF9933" : "3px solid transparent",
                  padding: "10px 16px",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ padding: "28px 32px 48px" }}>
            <div style={{ maxWidth: 1020, margin: "0 auto 32px" }}>

        {loadError && (
          <div
            style={{
              background: "#FDF2F0",
              border: "1px solid #C1502E",
              color: "#C1502E",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {loadError}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1020, margin: "0 auto" }}>
        {tab === "rotina" && (
          <RotinaTab
            addRotinaTask={addRotinaTask}
            newRotinaText={newRotinaText}
            removeRotinaTask={removeRotinaTask}
            rotina={rotina}
            setNewRotinaText={setNewRotinaText}
            toggleRotinaToday={toggleRotinaToday}
          />
        )}

        {tab === "visao" && (
          <VisaoGeralTab
            ativos={ativos}
            byEstado={byEstado}
            members={members}
            pastEvents={pastEvents}
            prospeccao={prospeccao}
            upcomingEvents={upcomingEvents}
            upcomingMeetings={upcomingMeetings}
          />
        )}

        {tab === "associados" && (
          <EmpresasTab
            addMember={addMember}
            expandedMembers={expandedMembers}
            hubspotBusy={hubspotBusy}
            hubspotError={hubspotError}
            hubspotMessage={hubspotMessage}
            memberFilterEstado={memberFilterEstado}
            memberFilterStatus={memberFilterStatus}
            memberSearch={memberSearch}
            members={members}
            modalidadeSuggestions={modalidadeSuggestions}
            patchMember={patchMember}
            pullDealsFromHubspot={pullDealsFromHubspot}
            removeMember={removeMember}
            setMemberFilterEstado={setMemberFilterEstado}
            setMemberFilterStatus={setMemberFilterStatus}
            setMemberSearch={setMemberSearch}
            tipoVinculoSuggestions={tipoVinculoSuggestions}
            toggleMemberExpand={toggleMemberExpand}
          />
        )}

        {tab === "servicos" && (
          <ServicosTab
            addService={addService}
            expandedServices={expandedServices}
            memberNameSuggestions={memberNameSuggestions}
            patchService={patchService}
            removeService={removeService}
            serviceFilterTipo={serviceFilterTipo}
            services={services}
            setExpandedServices={setExpandedServices}
            setServiceFilterTipo={setServiceFilterTipo}
          />
        )}

        {tab === "contatos" && (
          <ContatosTab
            addContact={addContact}
            contactSearch={contactSearch}
            contacts={contacts}
            expandedContacts={expandedContacts}
            hubspotBusy={hubspotBusy}
            hubspotError={hubspotError}
            hubspotMessage={hubspotMessage}
            memberNameSuggestions={memberNameSuggestions}
            patchContact={patchContact}
            pullContactsFromHubspot={pullContactsFromHubspot}
            removeContact={removeContact}
            setContactSearch={setContactSearch}
            toggleContactExpand={toggleContactExpand}
          />
        )}

        {tab === "reunioes" && (
          <ReunioesTab
            addMeeting={addMeeting}
            lastSyncedAt={lastSyncedAt}
            meetingWeeks={meetingWeeks}
            meetings={meetings}
            patchMeeting={patchMeeting}
            removeMeeting={removeMeeting}
            selectedMeetingId={selectedMeetingId}
            setMeetingWeeks={setMeetingWeeks}
            setSelectedMeetingId={setSelectedMeetingId}
            syncError={syncError}
            syncTeamsCalendar={syncTeamsCalendar}
            syncingTeams={syncingTeams}
          />
        )}

        {tab === "eventos" && (
          <EventosTab
            addEvent={addEvent}
            eventFilterStatus={eventFilterStatus}
            events={events}
            expandedEvents={expandedEvents}
            patchEvent={patchEvent}
            removeEvent={removeEvent}
            setEventFilterStatus={setEventFilterStatus}
            toggleEventExpand={toggleEventExpand}
          />
        )}
      </div>

      <div style={{ maxWidth: 1020, margin: "40px auto 0", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8992A6", textAlign: "center" }}>
        Plataforma Regional Sul · CCIB 2026
      </div>
      </div>
      </div>
      </div>
    </div>
  );
}
