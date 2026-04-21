    const STORAGE_KEY = 'literatureSurveyPortal_v1';
    const TABLE_PAGE_SIZE_OPTIONS = [25, 50, 100];
    const DEFAULT_TABLE_PAGE_SIZE = 25;
    const STATUS_ORDER = { 'To Read': 0, 'Reading': 1, 'Reviewed': 2, 'Cited': 3 };
    const PRIORITY_ORDER = { Low: 0, Medium: 1, High: 2, Critical: 3 };
    const PAPER_FIELDS = ['title','authors','journal','year','project','status','priority','articleType','starred','doi','pmid','url','tags','abstract','notes','addedAt','updatedAt'];
    const ARTICLE_TYPES = ['Research Article','Review Article','Systematic Review','Meta-Analysis','Case Report','Editorial','Letter','Preprint','Book Chapter','Other'];
    const DEFAULT_TABLE_SORT = { key: 'updatedAt', direction: 'desc' };
    const navigationEntry = performance.getEntriesByType?.('navigation')?.[0];
    const isReloadNavigation = navigationEntry?.type === 'reload';
    const SORT_DEFAULT_DIRECTION = {
      starred: 'desc',
      title: 'asc',
      authors: 'asc',
      year: 'desc',
      project: 'asc',
      journal: 'asc',
      status: 'asc',
      priority: 'desc',
      articleType: 'asc',
      addedAt: 'desc',
      updatedAt: 'desc'
    };
    if ('scrollRestoration' in history) {
      history.scrollRestoration = isReloadNavigation ? 'manual' : 'auto';
    }

    const demoPapers = [
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+1),
        title: 'Single-cell immune atlas reveals dynamic host responses during fungal infection',
        authors: 'L. Chen; A. Kumar; R. Singh',
        journal: 'Nature Communications',
        year: 2024,
        project: 'Single-cell',
        status: 'Reading',
        priority: 'High',
        starred: true,
        doi: '',
        pmid: '',
        url: '',
        tags: ['single-cell','host response','fungal infection'],
        abstract: 'Example record for onboarding and demo purposes.',
        notes: 'Check immune signaling pathways and candidate receptor proteins.',
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+2),
        title: 'Benchmarking deep learning models for protein subcellular localization prediction',
        authors: 'M. Patel; S. Walker',
        journal: 'Bioinformatics',
        year: 2023,
        project: 'Protein subcellular localization',
        status: 'To Read',
        priority: 'Critical',
        starred: true,
        doi: '',
        pmid: '',
        url: '',
        tags: ['deep learning','CNN','benchmark'],
        abstract: 'Example record for productivity walkthroughs.',
        notes: 'Compare input encodings and class imbalance handling.',
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+3),
        title: 'Integrating docking and MD simulation to prioritize antifungal leads',
        authors: 'P. Alvarez; H. Brooks; T. Nguyen',
        journal: 'Journal of Chemical Information and Modeling',
        year: 2025,
        project: 'Docking and simulation',
        status: 'Reviewed',
        priority: 'Medium',
        starred: false,
        doi: '',
        pmid: '',
        url: '',
        tags: ['docking','MD','lead prioritization'],
        abstract: 'Example record with post-docking analysis context.',
        notes: 'Useful for structuring results section around RMSD, RMSF, Rg, SASA, and MM/PBSA.',
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+4),
        title: 'Long-read metagenomics improves strain-level resolution in complex microbiomes',
        authors: 'J. Owens; C. Park',
        journal: 'Genome Biology',
        year: 2024,
        project: 'Metagenomics',
        status: 'To Read',
        priority: 'High',
        starred: false,
        doi: '',
        pmid: '',
        url: '',
        tags: ['metagenomics','strain resolution'],
        abstract: 'Example record for review article collection.',
        notes: 'Potential comparison point for assembly and binning tools.',
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    let state = loadState();
    let selectedIds = new Set();
    let confirmResolver = null;
    let tableSort = { ...DEFAULT_TABLE_SORT };
    let tablePage = 1;
    let projectOptions = [];
    const projectMenuState = { items: [], activeIndex: -1 };

    function stabilizeReloadScroll() {
      if (!isReloadNavigation) return;
      const scrollRoot = document.scrollingElement || document.documentElement;
      if (scrollRoot) scrollRoot.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    const els = {
      body: document.body,
      tabs: [...document.querySelectorAll('.tab-btn')],
      views: [...document.querySelectorAll('.view')],
      globalSearch: document.getElementById('globalSearch'),
      themeToggle: document.getElementById('themeToggle'),
      themeLabel: document.getElementById('themeLabel'),
      paperModal: document.getElementById('paperModal'),
      paperDetailsModal: document.getElementById('paperDetailsModal'),
      paperForm: document.getElementById('paperForm'),
      modalTitle: document.getElementById('modalTitle'),
      paperId: document.getElementById('paperId'),
      paperTitle: document.getElementById('paperTitle'),
      paperAuthors: document.getElementById('paperAuthors'),
      paperJournal: document.getElementById('paperJournal'),
      paperYear: document.getElementById('paperYear'),
      paperProject: document.getElementById('paperProject'),
      projectCombobox: document.getElementById('projectCombobox'),
      projectMenu: document.getElementById('projectMenu'),
      paperDoi: document.getElementById('paperDoi'),
      paperPmid: document.getElementById('paperPmid'),
      paperUrl: document.getElementById('paperUrl'),
      paperStatus: document.getElementById('paperStatus'),
      paperPriority: document.getElementById('paperPriority'),
      paperArticleType: document.getElementById('paperArticleType'),
      paperTags: document.getElementById('paperTags'),
      paperAbstract: document.getElementById('paperAbstract'),
      paperNotes: document.getElementById('paperNotes'),
      paperStarred: document.getElementById('paperStarred'),
      detailsTitle: document.getElementById('detailsTitle'),
      detailsSubtitle: document.getElementById('detailsSubtitle'),
      paperDetailsContent: document.getElementById('paperDetailsContent'),
      detailsMetaText: document.getElementById('detailsMetaText'),
      detailsOpenLinkBtn: document.getElementById('detailsOpenLinkBtn'),
      detailsEditBtn: document.getElementById('detailsEditBtn'),
      tableBody: document.getElementById('papersTableBody'),
      projectFilter: document.getElementById('projectFilter'),
      yearFilter: document.getElementById('yearFilter'),
      statusFilter: document.getElementById('statusFilter'),
      priorityFilter: document.getElementById('priorityFilter'),
      articleTypeFilter: document.getElementById('articleTypeFilter'),
      starredOnlyFilter: document.getElementById('starredOnlyFilter'),
      sortHeaders: [...document.querySelectorAll('.sort-header')],
      resultsCount: document.getElementById('resultsCount'),
      selectedCountText: document.getElementById('selectedCountText'),
      selectAllVisible: document.getElementById('selectAllVisible'),
      tablePageSize: document.getElementById('tablePageSize'),
      pageSummary: document.getElementById('pageSummary'),
      prevPageBtn: document.getElementById('prevPageBtn'),
      nextPageBtn: document.getElementById('nextPageBtn'),
      exportSelectedJsonBtn: document.getElementById('exportSelectedJsonBtn'),
      exportSelectedCsvBtn: document.getElementById('exportSelectedCsvBtn'),
      deleteSelectedBtn: document.getElementById('deleteSelectedBtn'),
      statTotal: document.getElementById('statTotal'),
      statStarred: document.getElementById('statStarred'),
      statToRead: document.getElementById('statToRead'),
      statHigh: document.getElementById('statHigh'),
      statProjects: document.getElementById('statProjects'),
      storagePortal: document.getElementById('storagePortal'),
      storagePapers: document.getElementById('storagePapers'),
      storageSelected: document.getElementById('storageSelected'),
      storageOrigin: document.getElementById('storageOrigin'),
      importFile: document.getElementById('importFile'),
      importMode: document.getElementById('importMode'),
      replaceWithDemo: document.getElementById('replaceWithDemo'),
      toastWrap: document.getElementById('toastWrap'),
      shortcutsModal: document.getElementById('shortcutsModal'),
      confirmModal: document.getElementById('confirmModal'),
      confirmTitle: document.getElementById('confirmTitle'),
      confirmMessage: document.getElementById('confirmMessage')
    };

    function normalizeSettings(settings = {}) {
      return {
        theme: settings.theme === 'light' ? 'light' : 'dark',
        tablePageSize: TABLE_PAGE_SIZE_OPTIONS.includes(Number(settings.tablePageSize)) ? Number(settings.tablePageSize) : DEFAULT_TABLE_PAGE_SIZE
      };
    }

    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { papers: [], settings: normalizeSettings() };
        const parsed = JSON.parse(raw);
        parsed.papers = Array.isArray(parsed.papers) ? parsed.papers.map(normalizePaper) : [];
        parsed.settings = normalizeSettings(parsed.settings);
        return parsed;
      } catch (error) {
        console.error(error);
        return { papers: [], settings: normalizeSettings() };
      }
    }

    function saveState() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      updateStorageUsage();
    }

    function normalizeTimestampValue(value) {
      if (!value) return '';
      if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? '' : value.toISOString();
      }
      const str = String(value).trim();
      if (!str) return '';

      const localMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
      if (localMatch && !/(z|[+-]\d{2}:?\d{2})$/i.test(str)) {
        const [, year, month, day, hour, minute, second = '00'] = localMatch;
        const localDate = new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour),
          Number(minute),
          Number(second)
        );
        return Number.isNaN(localDate.getTime()) ? '' : localDate.toISOString();
      }

      const parsed = new Date(str);
      return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
    }

    function formatExportTimestamp(value) {
      const iso = normalizeTimestampValue(value);
      if (!iso) return '';
      const d = new Date(iso);
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    function formatExportFilenameTimestamp(value = new Date()) {
      return formatExportTimestamp(value).replace(' ', '_').replace(/:/g, '-');
    }

    function serializePaperForExport(paper) {
      return {
        ...paper,
        addedAt: formatExportTimestamp(paper.addedAt),
        updatedAt: formatExportTimestamp(paper.updatedAt)
      };
    }

    function serializeStateForExport() {
      return {
        ...state,
        papers: state.papers.map(serializePaperForExport)
      };
    }

    function normalizePaper(input = {}) {
      return {
        id: input.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
        title: String(input.title || '').trim(),
        authors: String(input.authors || '').trim(),
        journal: String(input.journal || '').trim(),
        year: input.year ? Number(input.year) : '',
        project: String(input.project || '').trim(),
        status: ['To Read','Reading','Reviewed','Cited'].includes(input.status) ? input.status : 'To Read',
        priority: ['Low','Medium','High','Critical'].includes(input.priority) ? input.priority : 'Medium',
        articleType: ARTICLE_TYPES.includes(input.articleType) ? input.articleType : '',
        starred: Boolean(input.starred),
        doi: normalizeDOI(String(input.doi || '').trim()),
        pmid: String(input.pmid || '').trim(),
        url: String(input.url || '').trim(),
        tags: Array.isArray(input.tags) ? input.tags.filter(Boolean).map(String) : String(input.tags || '').split(',').map(t => t.trim()).filter(Boolean),
        abstract: stripHtml(String(input.abstract || '').trim()),
        notes: String(input.notes || '').trim(),
        addedAt: normalizeTimestampValue(input.addedAt) || new Date().toISOString(),
        updatedAt: normalizeTimestampValue(input.updatedAt) || new Date().toISOString()
      };
    }

    function stripHtml(text) {
      return String(text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function normalizeDOI(value) {
      let doi = String(value || '').trim();
      doi = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
      doi = doi.replace(/^doi:\s*/i, '');
      const match = doi.match(/10\.\S+/i);
      if (match) doi = match[0];
      return doi.replace(/[)>.,;\]]+$/g, '').trim();
    }

    function humanBytes(bytes) {
      if (!Number.isFinite(bytes)) return '—';
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    function paperToSearchText(p) {
      return [p.title, p.authors, p.journal, p.project, p.doi, p.pmid, p.notes, p.abstract, (p.tags || []).join(' ')].join(' ').toLowerCase();
    }

    function getPaperLink(p) {
      return p.url || (p.doi ? `https://doi.org/${encodeURIComponent(p.doi)}` : (p.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(p.pmid)}/` : ''));
    }

    function compareStrings(a, b) {
      return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
    }

    function getTableSortValue(paper, key) {
      if (key === 'starred') return Number(paper.starred);
      if (key === 'title') return paper.title || '';
      if (key === 'authors') return paper.authors || '';
      if (key === 'year') return Number(paper.year) || 0;
      if (key === 'project') return paper.project || '';
      if (key === 'journal') return paper.journal || '';
      if (key === 'status') return STATUS_ORDER[paper.status] ?? -1;
      if (key === 'priority') return PRIORITY_ORDER[paper.priority] ?? -1;
      if (key === 'articleType') return paper.articleType || '';
      if (key === 'addedAt') return new Date(paper.addedAt).getTime() || 0;
      if (key === 'updatedAt') return new Date(paper.updatedAt).getTime() || 0;
      return '';
    }

    function comparePapers(a, b) {
      let result = 0;
      const direction = tableSort.direction === 'asc' ? 1 : -1;
      const { key } = tableSort;
      const aValue = getTableSortValue(a, key);
      const bValue = getTableSortValue(b, key);

      if (['title', 'authors', 'project', 'journal', 'articleType'].includes(key)) {
        result = compareStrings(aValue, bValue);
      } else {
        result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }

      return (result * direction)
        || ((new Date(b.updatedAt) - new Date(a.updatedAt)) || 0)
        || compareStrings(a.title, b.title);
    }

    function setTableSort(key) {
      if (tableSort.key === key) {
        tableSort = { key, direction: tableSort.direction === 'asc' ? 'desc' : 'asc' };
      } else {
        tableSort = { key, direction: SORT_DEFAULT_DIRECTION[key] || 'asc' };
      }
      resetTablePage();
      renderTable();
    }

    function resetTableSort() {
      tableSort = { ...DEFAULT_TABLE_SORT };
    }

    function resetTablePage() {
      tablePage = 1;
    }

    function getTablePageSize() {
      return TABLE_PAGE_SIZE_OPTIONS.includes(Number(state.settings.tablePageSize)) ? Number(state.settings.tablePageSize) : DEFAULT_TABLE_PAGE_SIZE;
    }

    function getPagedPapers(papers) {
      const pageSize = getTablePageSize();
      const totalPages = Math.max(1, Math.ceil(papers.length / pageSize));
      tablePage = Math.min(Math.max(tablePage, 1), totalPages);
      const startIndex = papers.length ? (tablePage - 1) * pageSize : 0;
      const endIndex = Math.min(startIndex + pageSize, papers.length);

      return {
        papers: papers.slice(startIndex, endIndex),
        totalPages,
        startIndex,
        endIndex
      };
    }

    function updateSortHeaders() {
      els.sortHeaders.forEach(button => {
        const isActive = button.dataset.sortKey === tableSort.key;
        const indicator = button.querySelector('.sort-indicator');
        const th = button.closest('th');
        button.classList.toggle('active', isActive);
        if (indicator) indicator.textContent = isActive ? (tableSort.direction === 'asc' ? '↑' : '↓') : '↕';
        if (th) th.setAttribute('aria-sort', isActive ? (tableSort.direction === 'asc' ? 'ascending' : 'descending') : 'none');
      });
    }

    function getFilteredPapers() {
      const q = els.globalSearch.value.trim().toLowerCase();
      const project = els.projectFilter.value;
      const year = els.yearFilter.value;
      const status = els.statusFilter.value;
      const priority = els.priorityFilter.value;
      const articleType = els.articleTypeFilter.value;
      const starredOnly = els.starredOnlyFilter.checked;

      let papers = state.papers.filter(p => {
        if (q && !paperToSearchText(p).includes(q)) return false;
        if (project && p.project !== project) return false;
        if (year && String(p.year) !== String(year)) return false;
        if (status && p.status !== status) return false;
        if (priority && p.priority !== priority) return false;
        if (articleType && p.articleType !== articleType) return false;
        if (starredOnly && !p.starred) return false;
        return true;
      });

      papers.sort(comparePapers);

      return papers;
    }

    function pruneSelectedIds() {
      const valid = new Set(state.papers.map(p => p.id));
      selectedIds = new Set([...selectedIds].filter(id => valid.has(id)));
    }

    function renderAll() {
      pruneSelectedIds();
      renderTheme();
      populateFilterOptions();
      renderTable();
      renderDashboard();
      syncDetailsPanel();
      updateStorageUsage();
    }

    function renderTheme() {
      const theme = state.settings.theme || 'dark';
      els.body.setAttribute('data-theme', theme);
      els.themeToggle.checked = theme === 'light';
      els.themeLabel.textContent = theme === 'light' ? 'Light' : 'Dark';
    }

    function switchView(viewId) {
      els.tabs.forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewId));
      els.views.forEach(v => v.classList.toggle('active', v.id === viewId));
    }

    function populateFilterOptions() {
      const projects = [...new Set(state.papers.map(p => p.project).filter(Boolean))].sort();
      const years = [...new Set(state.papers.map(p => p.year).filter(Boolean))].sort((a,b) => b-a);
      fillSelect(els.projectFilter, ['All projects', ...projects], '', 'All projects');
      fillSelect(els.yearFilter, ['All years', ...years.map(String)], '', 'All years');
      projectOptions = projects;
      if (!els.projectMenu.classList.contains('hidden')) refreshProjectMenu();
    }

    function getProjectMenuItems(query = '') {
      const q = String(query || '').trim().toLowerCase();
      return projectOptions.filter(name => !q || name.toLowerCase().includes(q));
    }

    function renderProjectMenu() {
      els.projectMenu.replaceChildren();

      if (!projectOptions.length || !projectMenuState.items.length) {
        const empty = document.createElement('div');
        empty.className = 'project-empty';
        empty.textContent = projectOptions.length ? 'No matching projects.' : 'No saved projects yet. Type a new project name.';
        els.projectMenu.appendChild(empty);
      } else {
        projectMenuState.items.forEach((name, index) => {
          const option = document.createElement('button');
          option.type = 'button';
          option.id = `project-option-${index}`;
          option.className = `project-option${index === projectMenuState.activeIndex ? ' active' : ''}`;
          option.setAttribute('role', 'option');
          option.setAttribute('aria-selected', index === projectMenuState.activeIndex ? 'true' : 'false');
          option.textContent = name;
          option.addEventListener('mousedown', (event) => {
            event.preventDefault();
            selectProjectMenuItem(name);
          });
          els.projectMenu.appendChild(option);
        });
      }

      els.projectMenu.classList.remove('hidden');
      els.paperProject.setAttribute('aria-expanded', 'true');

      if (projectMenuState.activeIndex >= 0 && projectMenuState.items[projectMenuState.activeIndex]) {
        els.paperProject.setAttribute('aria-activedescendant', `project-option-${projectMenuState.activeIndex}`);
      } else {
        els.paperProject.removeAttribute('aria-activedescendant');
      }
    }

    function refreshProjectMenu(resetActive = true) {
      projectMenuState.items = getProjectMenuItems(els.paperProject.value);
      if (resetActive) {
        projectMenuState.activeIndex = -1;
      } else if (projectMenuState.activeIndex >= projectMenuState.items.length) {
        projectMenuState.activeIndex = projectMenuState.items.length - 1;
      }
      renderProjectMenu();
    }

    function openProjectMenu(resetActive = true) {
      refreshProjectMenu(resetActive);
    }

    function closeProjectMenu() {
      projectMenuState.items = [];
      projectMenuState.activeIndex = -1;
      els.projectMenu.replaceChildren();
      els.projectMenu.classList.add('hidden');
      els.paperProject.setAttribute('aria-expanded', 'false');
      els.paperProject.removeAttribute('aria-activedescendant');
    }

    function selectProjectMenuItem(value) {
      els.paperProject.value = value;
      closeProjectMenu();
      els.paperProject.focus();
    }

    function moveProjectMenuActive(delta) {
      if (els.projectMenu.classList.contains('hidden')) openProjectMenu(false);
      if (!projectMenuState.items.length) return;

      const lastIndex = projectMenuState.items.length - 1;
      if (projectMenuState.activeIndex < 0) {
        projectMenuState.activeIndex = delta > 0 ? 0 : lastIndex;
      } else {
        projectMenuState.activeIndex = (projectMenuState.activeIndex + delta + projectMenuState.items.length) % projectMenuState.items.length;
      }

      renderProjectMenu();
      document.getElementById(`project-option-${projectMenuState.activeIndex}`)?.scrollIntoView({ block: 'nearest' });
    }

    function fillSelect(select, options, currentValue, blankLabel) {
      const values = options.map((opt, i) => ({ value: i === 0 ? '' : String(opt), label: i === 0 ? blankLabel : String(opt) }));
      const previous = currentValue ?? select.value;
      select.innerHTML = values.map(o => `<option value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</option>`).join('');
      select.value = previous && values.some(v => v.value === previous) ? previous : '';
    }

    function renderTable() {
      const papers = getFilteredPapers();
      const { papers: pagePapers, totalPages, startIndex, endIndex } = getPagedPapers(papers);
      const hasSelection = selectedIds.size > 0;
      els.resultsCount.textContent = papers.length
        ? `${papers.length} result${papers.length === 1 ? '' : 's'} · Showing ${startIndex + 1}-${endIndex}`
        : '0 results';
      els.selectedCountText.textContent = `${selectedIds.size} selected`;
      els.storageSelected.textContent = String(selectedIds.size);
      els.tablePageSize.value = String(getTablePageSize());
      els.pageSummary.textContent = `Page ${tablePage} of ${totalPages}`;
      els.prevPageBtn.disabled = tablePage <= 1;
      els.nextPageBtn.disabled = papers.length === 0 || tablePage >= totalPages;
      els.exportSelectedJsonBtn.disabled = !hasSelection;
      els.exportSelectedCsvBtn.disabled = !hasSelection;
      els.deleteSelectedBtn.disabled = !hasSelection;
      els.exportSelectedJsonBtn.classList.toggle('good', hasSelection);
      els.exportSelectedCsvBtn.classList.toggle('good', hasSelection);
      els.deleteSelectedBtn.classList.toggle('bad', hasSelection);
      updateSortHeaders();

      els.tableBody.innerHTML = pagePapers.length ? pagePapers.map(p => {
        const tags = (p.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
        return `
          <tr data-id="${p.id}">
            <td class="center"><input type="checkbox" class="row-select" data-id="${p.id}" ${selectedIds.has(p.id) ? 'checked' : ''}></td>
            <td class="center"><button class="star-btn ${p.starred ? 'on' : ''}" data-action="star" data-id="${p.id}" title="Star/unstar">${p.starred ? '★' : '☆'}</button></td>
            <td class="title-cell">
              <button class="paper-open" type="button" data-action="details" data-id="${p.id}" title="Open paper details">
                <span class="title-main"><span class="ellipsis-2">${escapeHtml(p.title || '(Untitled paper)')}</span></span>
                <span class="abstract-preview">${escapeHtml(p.abstract || p.notes || 'No abstract or notes yet.')}</span>
                ${tags ? `<span class="chip-row paper-tags">${tags}</span>` : ''}
              </button>
            </td>
            <td>${escapeHtml(p.authors || '—')}</td>
            <td>${escapeHtml(p.year || '—')}</td>
            <td>${escapeHtml(p.project || '—')}</td>
            <td>${escapeHtml(p.journal || '—')}</td>
            <td><span class="chip status-${escapeHtml(p.status).replace(/\s+/g,'-')}">${escapeHtml(p.status)}</span></td>
            <td><span class="chip pri-${escapeHtml(p.priority)}">${escapeHtml(p.priority)}</span></td>
            <td>${p.articleType ? `<span class="chip">${escapeHtml(p.articleType)}</span>` : '<span class="muted">—</span>'}</td>
            <td>
              <div class="toolbar-left">
                <button class="btn icon" data-action="edit" data-id="${p.id}" title="Edit">✎</button>
                <button class="btn icon bad" data-action="delete" data-id="${p.id}" title="Delete">🗑</button>
              </div>
            </td>
          </tr>`;
      }).join('') : `<tr><td colspan="11" class="muted" style="padding:18px;">No papers match the current search/filter set.</td></tr>`;

      const selectedVisibleCount = pagePapers.filter(p => selectedIds.has(p.id)).length;
      const allVisibleSelected = pagePapers.length > 0 && selectedVisibleCount === pagePapers.length;
      els.selectAllVisible.indeterminate = selectedVisibleCount > 0 && !allVisibleSelected;
      els.selectAllVisible.checked = allVisibleSelected;
    }

    function renderDashboard() {
      const total = state.papers.length;
      const starred = state.papers.filter(p => p.starred).length;
      const toRead = state.papers.filter(p => p.status === 'To Read').length;
      const high = state.papers.filter(p => ['High','Critical'].includes(p.priority)).length;
      const projects = new Set(state.papers.map(p => p.project).filter(Boolean)).size;

      els.statTotal.textContent = total;
      els.statStarred.textContent = starred;
      els.statToRead.textContent = toRead;
      els.statHigh.textContent = high;
      els.statProjects.textContent = projects;

    }

    function formatDateTimeLong(iso) {
      if (!iso) return '—';
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '—';
      return d.toLocaleString([], { year:'numeric', month:'short', day:'numeric', hour:'numeric', minute:'2-digit' });
    }

    function renderDetailSection(label, value, isHtml = false) {
      const content = isHtml ? value : escapeHtml(value || '—');
      return `
        <div class="details-section">
          <div class="details-label">${escapeHtml(label)}</div>
          <div class="details-value">${content || '—'}</div>
        </div>`;
    }

    function renderPaperDetails(paper) {
      const link = getPaperLink(paper);
      const doiLink = paper.doi ? `<a href="https://doi.org/${encodeURIComponent(paper.doi)}" target="_blank" rel="noopener">${escapeHtml(paper.doi)}</a>` : '—';
      const pmidLink = paper.pmid ? `<a href="https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(paper.pmid)}/" target="_blank" rel="noopener">${escapeHtml(paper.pmid)}</a>` : '—';
      const urlLink = link ? `<a href="${escapeAttribute(link)}" target="_blank" rel="noopener">${escapeHtml(link)}</a>` : '—';
      const tagsMarkup = paper.tags?.length ? `<div class="chip-row">${paper.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>` : '<div class="details-value muted">No tags</div>';

      els.paperDetailsModal.dataset.paperId = paper.id;
      els.detailsTitle.textContent = paper.title || '(Untitled paper)';
      els.detailsSubtitle.textContent = [paper.project || 'No project', paper.journal || 'No journal', paper.year || 'No year'].join(' · ');
      els.detailsMetaText.textContent = `Added ${formatDateTimeLong(paper.addedAt)} · Updated ${formatDateTimeLong(paper.updatedAt)}`;
      els.detailsOpenLinkBtn.href = link || '#';
      els.detailsOpenLinkBtn.classList.toggle('hidden', !link);
      els.paperDetailsContent.innerHTML = `
        <div class="details-topline">
          <span class="chip">${paper.starred ? '★ Starred' : '☆ Not starred'}</span>
          <span class="chip status-${escapeHtml(paper.status).replace(/\s+/g,'-')}">${escapeHtml(paper.status)}</span>
          <span class="chip pri-${escapeHtml(paper.priority)}">${escapeHtml(paper.priority)}</span>
          ${paper.articleType ? `<span class="chip">${escapeHtml(paper.articleType)}</span>` : ''}
        </div>
        <div class="details-grid">
          ${renderDetailSection('Authors', paper.authors || '—')}
          ${renderDetailSection('Project', paper.project || '—')}
          ${renderDetailSection('Journal', paper.journal || '—')}
          ${renderDetailSection('Year', paper.year || '—')}
          ${renderDetailSection('DOI', doiLink, true)}
          ${renderDetailSection('PubMed ID', pmidLink, true)}
          ${renderDetailSection('URL', urlLink, true)}
          ${renderDetailSection('Status', paper.status || '—')}
          ${renderDetailSection('Priority', paper.priority || '—')}
          ${renderDetailSection('Article Type', paper.articleType || '—')}
        </div>
        ${renderDetailSection('Tags', tagsMarkup, true)}
        ${renderDetailSection('Abstract', paper.abstract || '—')}
        ${renderDetailSection('Notes', paper.notes || '—')}
      `;
    }

    function openDetails(paper) {
      renderPaperDetails(paper);
      els.paperDetailsModal.classList.add('open');
    }

    function closeDetails() {
      els.paperDetailsModal.classList.remove('open');
      delete els.paperDetailsModal.dataset.paperId;
    }

    function syncDetailsPanel() {
      if (!els.paperDetailsModal.classList.contains('open')) return;
      const id = els.paperDetailsModal.dataset.paperId;
      const paper = state.papers.find(p => p.id === id);
      if (!paper) closeDetails();
      else renderPaperDetails(paper);
    }

    async function updateStorageUsage() {
      const bytes = new TextEncoder().encode(localStorage.getItem(STORAGE_KEY) || '').length;
      els.storagePortal.textContent = humanBytes(bytes);
      els.storagePapers.textContent = String(state.papers.length);
      els.storageSelected.textContent = String(selectedIds.size);
      if (navigator.storage && navigator.storage.estimate) {
        try {
          const estimate = await navigator.storage.estimate();
          els.storageOrigin.textContent = `${humanBytes(estimate.usage || 0)} / ${humanBytes(estimate.quota || 0)}`;
        } catch {
          els.storageOrigin.textContent = 'Unavailable';
        }
      } else {
        els.storageOrigin.textContent = 'Unsupported';
      }
    }

    function openModal(paper = null, focusField = 'title') {
      els.paperForm.reset();
      closeProjectMenu();
      els.paperId.value = paper?.id || '';
      els.modalTitle.textContent = paper ? 'Edit Paper' : 'Add Paper';
      els.paperTitle.value = paper?.title || '';
      els.paperAuthors.value = paper?.authors || '';
      els.paperJournal.value = paper?.journal || '';
      els.paperYear.value = paper?.year || '';
      els.paperProject.value = paper?.project || '';
      els.paperDoi.value = paper?.doi || '';
      els.paperPmid.value = paper?.pmid || '';
      els.paperUrl.value = paper?.url || '';
      els.paperStatus.value = paper?.status || 'To Read';
      els.paperPriority.value = paper?.priority || 'Medium';
      els.paperArticleType.value = paper?.articleType || '';
      els.paperTags.value = (paper?.tags || []).join(', ');
      els.paperAbstract.value = paper?.abstract || '';
      els.paperNotes.value = paper?.notes || '';
      els.paperStarred.checked = Boolean(paper?.starred);
      els.paperModal.classList.add('open');
      setTimeout(() => {
        if (focusField === 'doi') els.paperDoi.focus();
        else els.paperTitle.focus();
      }, 40);
    }

    function closeModal() {
      closeProjectMenu();
      els.paperModal.classList.remove('open');
    }

    function readFormPaper() {
      const existing = state.papers.find(p => p.id === els.paperId.value);
      const paper = normalizePaper({
        id: els.paperId.value || undefined,
        title: els.paperTitle.value,
        authors: els.paperAuthors.value,
        journal: els.paperJournal.value,
        year: els.paperYear.value,
        project: els.paperProject.value,
        doi: els.paperDoi.value,
        pmid: els.paperPmid.value,
        url: els.paperUrl.value,
        status: els.paperStatus.value,
        priority: els.paperPriority.value,
        articleType: els.paperArticleType.value,
        tags: els.paperTags.value,
        abstract: els.paperAbstract.value,
        notes: els.paperNotes.value,
        starred: els.paperStarred.checked,
        addedAt: existing?.addedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return paper;
    }

    function upsertPaper(paper) {
      const idx = state.papers.findIndex(p => p.id === paper.id);
      if (idx >= 0) state.papers[idx] = paper;
      else state.papers.unshift(paper);
      saveState();
      renderAll();
    }

    function deletePaperById(id) {
      state.papers = state.papers.filter(p => p.id !== id);
      selectedIds.delete(id);
      saveState();
      renderAll();
    }

    function deleteSelectedPapers() {
      if (!selectedIds.size) {
        toast('No selected papers to delete.', 'info');
        return;
      }
      state.papers = state.papers.filter(p => !selectedIds.has(p.id));
      selectedIds.clear();
      saveState();
      renderAll();
      toast('Selected papers deleted.', 'success');
    }

    function exportData(items, format, filenamePrefix) {
      if (!items.length) {
        toast('Nothing to export.', 'info');
        return;
      }
      const exportItems = items.map(serializePaperForExport);
      const filename = `${filenamePrefix}-${formatExportFilenameTimestamp()}.${format}`;
      if (format === 'json') {
        downloadFile(JSON.stringify(exportItems, null, 2), filename, 'application/json');
      } else {
        downloadFile(convertToCSV(exportItems), filename, 'text/csv');
      }
    }

    function convertToCSV(items) {
      const headers = ['title','authors','journal','year','project','status','priority','articleType','starred','doi','pmid','url','tags','abstract','notes','addedAt','updatedAt'];
      const lines = [headers.join(',')];
      for (const p of items) {
        const row = headers.map(key => {
          const value = key === 'tags' ? (p.tags || []).join('; ') : p[key] ?? '';
          return csvEscape(value);
        });
        lines.push(row.join(','));
      }
      return lines.join('\n');
    }

    function csvEscape(value) {
      const str = String(value ?? '');
      if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
      return str;
    }

    function parseCSV(text) {
      const rows = [];
      let row = [];
      let value = '';
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const next = text[i + 1];
        if (inQuotes) {
          if (ch === '"' && next === '"') {
            value += '"';
            i++;
          } else if (ch === '"') {
            inQuotes = false;
          } else {
            value += ch;
          }
        } else {
          if (ch === '"') inQuotes = true;
          else if (ch === ',') { row.push(value); value = ''; }
          else if (ch === '\n') { row.push(value); rows.push(row); row = []; value = ''; }
          else if (ch === '\r') { /* ignore */ }
          else value += ch;
        }
      }
      row.push(value);
      rows.push(row);
      const [header, ...dataRows] = rows.filter(r => r.length && r.some(v => String(v).trim() !== ''));
      if (!header) return [];
      return dataRows.map(cols => {
        const obj = {};
        header.forEach((h, idx) => obj[h.trim()] = cols[idx] ?? '');
        return normalizePaper({
          title: obj.title,
          authors: obj.authors,
          journal: obj.journal,
          year: obj.year,
          project: obj.project,
          status: obj.status,
          priority: obj.priority,
          articleType: obj.articleType,
          starred: String(obj.starred).toLowerCase() === 'true',
          doi: obj.doi,
          pmid: obj.pmid,
          url: obj.url,
          tags: obj.tags,
          abstract: obj.abstract,
          notes: obj.notes,
          addedAt: obj.addedAt,
          updatedAt: obj.updatedAt
        });
      });
    }

    function downloadFile(content, filename, type) {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    function formatDateTime(iso) {
      if (!iso) return '—';
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '—';
      return d.toLocaleDateString([], { year:'numeric', month:'short', day:'numeric' });
    }

    function escapeHtml(str) {
      return String(str ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
    }

    function escapeAttribute(str) {
      return escapeHtml(str).replace(/`/g, '&#96;');
    }

    async function fetchFromDOI() {
      const doi = normalizeDOI(els.paperDoi.value);
      if (!doi) {
        toast('Enter a DOI or DOI URL first.', 'error');
        return;
      }
      try {
        toast('Fetching DOI metadata…', 'info', 1400);
        const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`Crossref request failed (${res.status})`);
        const data = await res.json();
        const m = data.message || {};
        const authors = (m.author || []).map(a => [a.given, a.family].filter(Boolean).join(' ')).join('; ');
        const year = m.issued?.['date-parts']?.[0]?.[0] || m.published?.['date-parts']?.[0]?.[0] || '';
        els.paperDoi.value = doi;
        if (m.title?.[0]) els.paperTitle.value = stripHtml(m.title[0]);
        if (authors) els.paperAuthors.value = authors;
        if (m['container-title']?.[0]) els.paperJournal.value = stripHtml(m['container-title'][0]);
        if (year) els.paperYear.value = year;
        if (m.abstract) els.paperAbstract.value = stripHtml(m.abstract);
        if (m.URL) els.paperUrl.value = m.URL;
        toast('DOI metadata loaded.', 'success');
      } catch (error) {
        console.error(error);
        toast(`DOI fetch failed: ${error.message}`, 'error', 2800);
      }
    }

    async function fetchFromPMID() {
      const pmid = String(els.paperPmid.value || '').trim();
      if (!pmid) {
        toast('Enter a PubMed ID first.', 'error');
        return;
      }
      try {
        toast('Fetching PubMed metadata…', 'info', 1400);
        const res = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${encodeURIComponent(pmid)}&retmode=xml`);
        if (!res.ok) throw new Error(`NCBI request failed (${res.status})`);
        const xmlText = await res.text();
        const xml = new DOMParser().parseFromString(xmlText, 'text/xml');
        if (xml.querySelector('parsererror')) throw new Error('Could not parse PubMed XML response');
        const article = xml.querySelector('PubmedArticle');
        if (!article) throw new Error('PubMed article not found');

        const text = (selector, root = article) => root.querySelector(selector)?.textContent?.trim() || '';
        const authors = [...article.querySelectorAll('AuthorList > Author')].map(a => {
          const collective = text('CollectiveName', a);
          if (collective) return collective;
          return [text('ForeName', a), text('LastName', a)].filter(Boolean).join(' ');
        }).filter(Boolean).join('; ');

        const abstractTexts = [...article.querySelectorAll('AbstractText')].map(node => {
          const label = node.getAttribute('Label');
          const t = node.textContent.trim();
          return label ? `${label}: ${t}` : t;
        }).filter(Boolean);

        let year = text('ArticleDate > Year') || text('PubDate > Year');
        if (!year) {
          const medlineDate = text('PubDate > MedlineDate');
          const match = medlineDate.match(/(19|20)\d{2}/);
          year = match ? match[0] : '';
        }
        const doiNode = [...article.querySelectorAll('ArticleId')].find(n => n.getAttribute('IdType') === 'doi');
        const doi = doiNode?.textContent?.trim() || '';

        els.paperPmid.value = pmid;
        if (text('ArticleTitle')) els.paperTitle.value = text('ArticleTitle');
        if (authors) els.paperAuthors.value = authors;
        if (text('Journal > Title')) els.paperJournal.value = text('Journal > Title');
        if (year) els.paperYear.value = year;
        if (abstractTexts.length) els.paperAbstract.value = abstractTexts.join('\n\n');
        if (doi) els.paperDoi.value = normalizeDOI(doi);
        els.paperUrl.value = `https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(pmid)}/`;
        toast('PubMed metadata loaded.', 'success');
      } catch (error) {
        console.error(error);
        toast(`PMID fetch failed: ${error.message}`, 'error', 3200);
      }
    }

    function toast(message, type = 'info', timeout = 2200) {
      const div = document.createElement('div');
      div.className = `toast ${type}`;
      div.textContent = message;
      els.toastWrap.appendChild(div);
      setTimeout(() => {
        div.style.opacity = '0';
        div.style.transform = 'translateY(6px)';
        div.style.transition = '.18s ease';
        setTimeout(() => div.remove(), 180);
      }, timeout);
    }

    function askConfirm(title, message) {
      els.confirmTitle.textContent = title;
      els.confirmMessage.textContent = message;
      els.confirmModal.classList.add('open');
      return new Promise(resolve => { confirmResolver = resolve; });
    }

    function closeConfirm(result) {
      els.confirmModal.classList.remove('open');
      if (confirmResolver) confirmResolver(Boolean(result));
      confirmResolver = null;
    }

    function selectedPapers() {
      return state.papers.filter(p => selectedIds.has(p.id));
    }

    function mergePapers(newPapers, mode = 'merge') {
      const normalized = newPapers.map(normalizePaper);
      if (mode === 'replace') {
        state.papers = normalized;
      } else {
        const merged = [...state.papers];
        normalized.forEach(p => {
          const key = p.doi || p.pmid || `${p.title.toLowerCase()}|${p.year}|${p.project.toLowerCase()}`;
          const idx = merged.findIndex(x => (x.doi || x.pmid || `${x.title.toLowerCase()}|${x.year}|${x.project.toLowerCase()}`) === key);
          if (idx >= 0) merged[idx] = { ...merged[idx], ...p, id: merged[idx].id, updatedAt: new Date().toISOString() };
          else merged.unshift(p);
        });
        state.papers = merged;
      }
      saveState();
      renderAll();
    }

    function bindEvents() {
      const rerenderFromFirstPage = () => {
        resetTablePage();
        renderTable();
      };

      document.getElementById('addPaperBtn2').addEventListener('click', () => openModal());
      document.getElementById('closeModalBtn').addEventListener('click', closeModal);
      document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
      document.getElementById('closeDetailsTopBtn').addEventListener('click', closeDetails);
      document.getElementById('detailsCloseBtn').addEventListener('click', closeDetails);
      els.detailsEditBtn.addEventListener('click', () => {
        const paper = state.papers.find(p => p.id === els.paperDetailsModal.dataset.paperId);
        if (!paper) return;
        closeDetails();
        openModal(paper);
      });
      els.paperDetailsModal.addEventListener('click', (e) => {
        if (e.target === els.paperDetailsModal) closeDetails();
      });
      document.getElementById('savePaperBtn').addEventListener('click', () => {
        const paper = readFormPaper();
        if (!paper.title.trim()) {
          toast('Title is required.', 'error');
          els.paperTitle.focus();
          return;
        }
        upsertPaper(paper);
        closeModal();
        toast('Paper saved.', 'success');
      });

      document.getElementById('fetchDoiBtn').addEventListener('click', fetchFromDOI);
      document.getElementById('fetchPmidBtn').addEventListener('click', fetchFromPMID);
      els.paperProject.addEventListener('focus', () => openProjectMenu());
      els.paperProject.addEventListener('click', () => openProjectMenu());
      els.paperProject.addEventListener('input', () => openProjectMenu());
      els.paperProject.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          moveProjectMenuActive(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          moveProjectMenuActive(-1);
        } else if (e.key === 'Enter' && !els.projectMenu.classList.contains('hidden') && projectMenuState.activeIndex >= 0) {
          e.preventDefault();
          selectProjectMenuItem(projectMenuState.items[projectMenuState.activeIndex]);
        } else if (e.key === 'Escape' && !els.projectMenu.classList.contains('hidden')) {
          e.preventDefault();
          closeProjectMenu();
        }
      });
      els.projectCombobox.addEventListener('focusout', () => {
        requestAnimationFrame(() => {
          if (!els.projectCombobox.contains(document.activeElement)) closeProjectMenu();
        });
      });
      document.addEventListener('pointerdown', (e) => {
        if (!els.projectCombobox.contains(e.target)) closeProjectMenu();
      });

      els.themeToggle.addEventListener('change', () => {
        state.settings.theme = els.themeToggle.checked ? 'light' : 'dark';
        saveState();
        renderTheme();
      });

      els.tabs.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));

      [els.globalSearch, els.projectFilter, els.yearFilter, els.statusFilter, els.priorityFilter, els.articleTypeFilter].forEach(el => {
        el.addEventListener('input', rerenderFromFirstPage);
        el.addEventListener('change', rerenderFromFirstPage);
      });
      els.sortHeaders.forEach(button => {
        button.addEventListener('click', () => setTableSort(button.dataset.sortKey));
      });
      els.globalSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') switchView('dashboardView');
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          els.globalSearch.blur();
        }
      });
      els.starredOnlyFilter.addEventListener('change', rerenderFromFirstPage);
      els.tablePageSize.addEventListener('change', () => {
        state.settings.tablePageSize = TABLE_PAGE_SIZE_OPTIONS.includes(Number(els.tablePageSize.value)) ? Number(els.tablePageSize.value) : DEFAULT_TABLE_PAGE_SIZE;
        saveState();
        resetTablePage();
        renderTable();
      });
      els.prevPageBtn.addEventListener('click', () => {
        if (tablePage <= 1) return;
        tablePage -= 1;
        renderTable();
      });
      els.nextPageBtn.addEventListener('click', () => {
        tablePage += 1;
        renderTable();
      });

      document.getElementById('clearFiltersBtn').addEventListener('click', () => {
        els.globalSearch.value = '';
        els.projectFilter.value = '';
        els.yearFilter.value = '';
        els.statusFilter.value = '';
        els.priorityFilter.value = '';
        els.articleTypeFilter.value = '';
        els.starredOnlyFilter.checked = false;
        resetTableSort();
        resetTablePage();
        renderTable();
      });

      els.tableBody.addEventListener('click', async (e) => {
        const row = e.target.closest('tr[data-id]');
        if (!row) return;
        const paper = state.papers.find(p => p.id === row.dataset.id);
        if (!paper) return;
        const actionEl = e.target.closest('[data-action]');
        if (!actionEl) return;
        const action = actionEl.dataset.action;
        if (action === 'details') openDetails(paper);
        if (action === 'edit') openModal(paper);
        if (action === 'star') {
          paper.starred = !paper.starred;
          paper.updatedAt = new Date().toISOString();
          saveState();
          renderAll();
        }
        if (action === 'delete') {
          const ok = await askConfirm('Delete paper', `Delete “${paper.title || 'Untitled paper'}”? This action cannot be undone in the current browser.`);
          if (ok) {
            deletePaperById(paper.id);
            toast('Paper deleted.', 'success');
          }
        }
      });

      els.tableBody.addEventListener('change', (e) => {
        if (!e.target.classList.contains('row-select')) return;
        const id = e.target.dataset.id;
        if (e.target.checked) selectedIds.add(id);
        else selectedIds.delete(id);
        renderTable();
      });

      els.selectAllVisible.addEventListener('change', () => {
        const visibleIds = getPagedPapers(getFilteredPapers()).papers.map(p => p.id);
        if (els.selectAllVisible.checked) visibleIds.forEach(id => selectedIds.add(id));
        else visibleIds.forEach(id => selectedIds.delete(id));
        renderTable();
      });

      document.getElementById('clearSelectionBtn').addEventListener('click', () => {
        selectedIds.clear();
        renderTable();
      });

      els.exportSelectedJsonBtn.addEventListener('click', () => exportData(selectedPapers(), 'json', 'selected_papers'));
      els.exportSelectedCsvBtn.addEventListener('click', () => exportData(selectedPapers(), 'csv', 'selected_papers'));
      els.deleteSelectedBtn.addEventListener('click', async () => {
        if (!selectedIds.size) return toast('Select paper(s) first.', 'info');
        const ok = await askConfirm('Delete selected papers', `Delete ${selectedIds.size} selected paper(s)? This action cannot be undone in the current browser.`);
        if (ok) deleteSelectedPapers();
      });

      document.getElementById('exportAllJsonBtn').addEventListener('click', () => downloadFile(JSON.stringify(serializeStateForExport(), null, 2), `literature_survey_backup-${formatExportFilenameTimestamp()}.json`, 'application/json'));
      document.getElementById('exportAllCsvBtn').addEventListener('click', () => exportData(state.papers, 'csv', 'literature_survey_papers'));

      document.getElementById('demoBtn').addEventListener('click', async () => {
        const replace = els.replaceWithDemo.checked;
        if (replace) {
          const ok = await askConfirm('Replace with demo data', 'Replace current portal data with demo data?');
          if (!ok) return;
        }
        mergePapers(demoPapers, replace ? 'replace' : 'merge');
        toast('Demo data loaded.', 'success');
      });

      document.getElementById('resetBtn').addEventListener('click', async () => {
        const ok = await askConfirm('Reset portal', 'Reset all portal data stored by this app in this browser?');
        if (!ok) return;
        state = { papers: [], settings: normalizeSettings(state.settings) };
        selectedIds.clear();
        resetTablePage();
        saveState();
        renderAll();
        toast('Portal reset complete.', 'success');
      });

      document.getElementById('importBtn').addEventListener('click', async () => {
        const file = els.importFile.files?.[0];
        if (!file) return toast('Choose a JSON or CSV file first.', 'error');
        try {
          const text = await file.text();
          let papers = [];
          if (file.name.toLowerCase().endsWith('.json')) {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) papers = parsed;
            else if (Array.isArray(parsed.papers)) papers = parsed.papers;
            else throw new Error('JSON must contain an array or an object with a papers array.');
          } else if (file.name.toLowerCase().endsWith('.csv')) {
            papers = parseCSV(text);
          } else {
            throw new Error('Unsupported file type.');
          }
          if (!papers.length) throw new Error('No papers found in the file.');
          const mode = els.importMode.value;
          if (mode === 'replace') {
            const ok = await askConfirm('Replace current data', `Replace current data with ${papers.length} imported paper(s)?`);
            if (!ok) return;
          }
          mergePapers(papers, mode);
          els.importFile.value = '';
          toast(`Imported ${papers.length} paper(s).`, 'success');
        } catch (error) {
          console.error(error);
          toast(`Import failed: ${error.message}`, 'error', 3200);
        }
      });

      document.getElementById('openShortcutsBtn').addEventListener('click', () => els.shortcutsModal.classList.add('open'));
      document.getElementById('closeShortcutsBtn').addEventListener('click', () => els.shortcutsModal.classList.remove('open'));

      document.getElementById('confirmCancelBtn').addEventListener('click', () => closeConfirm(false));
      document.getElementById('confirmOkBtn').addEventListener('click', () => closeConfirm(true));

      window.addEventListener('beforeunload', () => {
        const active = document.activeElement;
        if (active instanceof HTMLElement) active.blur();
      });

      document.addEventListener('keydown', async (e) => {
        const activeTag = document.activeElement?.tagName;
        const typing = ['INPUT','TEXTAREA','SELECT'].includes(activeTag);
        const shortcutsOpen = els.shortcutsModal.classList.contains('open');
        const paperModalOpen = els.paperModal.classList.contains('open');
        const detailsOpen = els.paperDetailsModal.classList.contains('open');
        const confirmOpen = els.confirmModal.classList.contains('open');
        const overlayOpen = shortcutsOpen || paperModalOpen || detailsOpen || confirmOpen;
        const key = e.key.toLowerCase();

        if (e.key === 'Escape') {
          e.preventDefault();
          if (confirmOpen) {
            closeConfirm(false);
            return;
          }
          if (paperModalOpen) {
            closeModal();
            return;
          }
          if (detailsOpen) {
            closeDetails();
            return;
          }
          if (shortcutsOpen) {
            els.shortcutsModal.classList.remove('open');
            return;
          }
          let changed = false;
          if (els.globalSearch.value) {
            els.globalSearch.value = '';
            resetTablePage();
            changed = true;
          }
          if (selectedIds.size) {
            selectedIds.clear();
            changed = true;
          }
          if (changed) renderTable();
          return;
        }

        if (overlayOpen) return;

        if (e.key === '/' && !typing) {
          e.preventDefault();
          els.globalSearch.focus();
          switchView('dashboardView');
          return;
        }
        if (key === 'n' && !typing) {
          e.preventDefault();
          switchView('dashboardView');
          openModal(null, 'doi');
          return;
        }
        if (e.key === '?' && !typing) {
          e.preventDefault();
          els.shortcutsModal.classList.add('open');
          return;
        }
        if (key === 's' && !typing) {
          e.preventDefault();
          switchView('dashboardView');
          els.starredOnlyFilter.checked = !els.starredOnlyFilter.checked;
          resetTablePage();
          renderTable();
          return;
        }
        if (key === 'p' && !typing) {
          e.preventDefault();
          switchView('dashboardView');
          return;
        }
        if (key === 'd' && !typing) {
          e.preventDefault();
          switchView('dataView');
        }
      });
    }

    bindEvents();
    renderAll();
    requestAnimationFrame(stabilizeReloadScroll);
    window.addEventListener('load', stabilizeReloadScroll, { once: true });