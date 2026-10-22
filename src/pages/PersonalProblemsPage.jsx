import { useState, useMemo } from 'react';
import { TOPICS } from '../data';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Select from '../components/Select';
import ConfirmDialog from '../components/ConfirmDialog';
import DropdownMenu from '../components/DropdownMenu';
import Tabs from '../components/Tabs';

const DIFFICULTY_OPTIONS = [
  { value: 'Easy', label: 'Easy' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Hard', label: 'Hard' },
];

const PLATFORM_OPTIONS = [
  { value: 'LeetCode', label: 'LeetCode' },
  { value: 'Codeforces', label: 'Codeforces' },
  { value: 'GeeksforGeeks', label: 'GeeksforGeeks' },
  { value: 'HackerRank', label: 'HackerRank' },
  { value: 'CodeChef', label: 'CodeChef' },
  { value: 'InterviewBit', label: 'InterviewBit' },
  { value: 'Other', label: 'Other Platform' },
];

const STATUS_OPTIONS = [
  { value: 'Unsolved', label: 'Unsolved' },
  { value: 'Attempted', label: 'Attempted' },
  { value: 'Solved', label: 'Solved' },
];

function isValidHttpUrl(string) {
  if (!string || !string.trim()) return true;
  try {
    const url = new URL(string.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

export default function PersonalProblemsPage() {
  const { toast } = useToast();
  const [problems, setProblems] = useLocalStorage('dsa_custom_problems', []);
  const [activeTab, setActiveTab] = useState('all');

  // Topic options derived from predefined topics + custom option
  const topicOptions = [
    ...TOPICS.map((t) => ({ value: t.name, label: t.name })),
    { value: 'Other / Custom', label: 'Other / Custom' },
  ];

  // ─── CREATE FORM STATE ────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title: '',
    topic: TOPICS[0]?.name || 'Arrays & Strings',
    difficulty: 'Medium',
    platform: 'LeetCode',
    url: '',
    status: 'Unsolved',
  });
  const [createErrors, setCreateErrors] = useState({});

  // ─── EDIT FORM STATE ──────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  // ─── DELETION CONFIRMATION STATE ──────────────────────────────────────────
  const [deleteProblemId, setDeleteProblemId] = useState(null);

  // ─── VALIDATION ───────────────────────────────────────────────────────────
  function validateProblem(values) {
    const errs = {};
    if (!values.title || !values.title.trim()) {
      errs.title = 'Title is required';
    }
    if (!values.topic || !values.topic.trim()) {
      errs.topic = 'Topic is required';
    }
    if (!['Easy', 'Medium', 'Hard'].includes(values.difficulty)) {
      errs.difficulty = 'Difficulty must be Easy, Medium, or Hard';
    }
    if (!values.platform || !values.platform.trim()) {
      errs.platform = 'Platform is required';
    }
    if (values.url && values.url.trim() && !isValidHttpUrl(values.url)) {
      errs.url = 'Must be a valid HTTP or HTTPS URL (e.g. https://leetcode.com/...)';
    }
    return errs;
  }

  // ─── CREATE HANDLER ───────────────────────────────────────────────────────
  function handleCreate(e) {
    e.preventDefault();
    const validationErrors = validateProblem(formData);
    if (Object.keys(validationErrors).length > 0) {
      setCreateErrors(validationErrors);
      return;
    }

    const newProblem = {
      id: Date.now(),
      title: formData.title.trim(),
      topic: formData.topic.trim(),
      difficulty: formData.difficulty,
      platform: formData.platform.trim(),
      url: formData.url.trim(),
      status: formData.status,
      createdAt: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
    };

    setProblems((prev) => [newProblem, ...prev]);
    setFormData({
      title: '',
      topic: TOPICS[0]?.name || 'Arrays & Strings',
      difficulty: 'Medium',
      platform: 'LeetCode',
      url: '',
      status: 'Unsolved',
    });
    setCreateErrors({});
    toast.success('Custom problem added successfully.');
  }

  // ─── EDIT HANDLERS ────────────────────────────────────────────────────────
  function startEditing(prob) {
    setEditingId(prob.id);
    setEditFormData({
      title: prob.title,
      topic: prob.topic,
      difficulty: prob.difficulty,
      platform: prob.platform,
      url: prob.url || '',
      status: prob.status || 'Unsolved',
    });
    setEditErrors({});
  }

  function cancelEditing() {
    setEditingId(null);
    setEditFormData(null);
    setEditErrors({});
  }

  function handleSaveEdit(id) {
    if (!editFormData) return;
    const validationErrors = validateProblem(editFormData);
    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      return;
    }

    setProblems((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              title: editFormData.title.trim(),
              topic: editFormData.topic.trim(),
              difficulty: editFormData.difficulty,
              platform: editFormData.platform.trim(),
              url: editFormData.url.trim(),
              status: editFormData.status,
              updatedAt: new Date().toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              }),
            }
          : p
      )
    );

    cancelEditing();
    toast.success('Custom problem updated successfully.');
  }

  // ─── QUICK STATUS TOGGLE ──────────────────────────────────────────────────
  function handleStatusToggle(id, nextStatus) {
    setProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
    );
    toast.info(`Status updated to "${nextStatus}".`);
  }

  // ─── DELETE HANDLER ───────────────────────────────────────────────────────
  function handleConfirmDelete() {
    if (deleteProblemId) {
      setProblems((prev) => prev.filter((p) => p.id !== deleteProblemId));
      if (editingId === deleteProblemId) {
        cancelEditing();
      }
      setDeleteProblemId(null);
      toast.info('Custom problem deleted successfully.');
    }
  }

  // Summary counts
  const solvedCount = problems.filter((p) => p.status === 'Solved').length;
  const attemptedCount = problems.filter((p) => p.status === 'Attempted').length;
  const unsolvedCount = problems.filter((p) => p.status === 'Unsolved').length;

  // Tabs definition (Task 4)
  const statusTabs = [
    { id: 'all', label: 'All Problems', count: problems.length },
    { id: 'Unsolved', label: 'Unsolved', count: unsolvedCount },
    { id: 'Attempted', label: 'Attempted', count: attemptedCount },
    { id: 'Solved', label: 'Solved', count: solvedCount },
  ];

  // Filtered view by active tab
  const displayedProblems = useMemo(() => {
    if (activeTab === 'all') return problems;
    return problems.filter((p) => p.status === activeTab);
  }, [problems, activeTab]);

  return (
    <div className="home-content">
      <header className="home-header">
        <div className="home-title-row">
          <h1>Personal Problems</h1>
          <p className="home-subtitle">
            Track custom problems from LeetCode, Codeforces, and contests separately from the core roadmap.
          </p>
        </div>
        <div className="hero-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="hs-card">
            <div className="hs-num">{problems.length}</div>
            <div className="hs-label">Total Custom</div>
          </div>
          <div className="hs-card">
            <div className="hs-num" style={{ color: 'var(--c-green)' }}>{solvedCount}</div>
            <div className="hs-label">Solved</div>
          </div>
          <div className="hs-card">
            <div className="hs-num" style={{ color: 'var(--c-amber)' }}>{attemptedCount}</div>
            <div className="hs-label">Attempted</div>
          </div>
        </div>
      </header>

      {/* CREATE FORM */}
      <section className="form-card" aria-labelledby="add-custom-problem-heading">
        <h2 id="add-custom-problem-heading" className="card-heading">Add a custom problem</h2>
        <form onSubmit={handleCreate} noValidate>
          <div className="form-grid">
            <Input
              id="custom-title"
              label="Problem Title"
              name="title"
              placeholder="e.g. Next Greater Element II"
              value={formData.title}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, title: e.target.value }));
                if (createErrors.title) setCreateErrors((prev) => ({ ...prev, title: null }));
              }}
              error={createErrors.title}
              required
            />

            <Select
              id="custom-topic"
              label="Topic"
              name="topic"
              value={formData.topic}
              options={topicOptions}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, topic: e.target.value }));
                if (createErrors.topic) setCreateErrors((prev) => ({ ...prev, topic: null }));
              }}
              error={createErrors.topic}
              required
            />
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <Select
              id="custom-difficulty"
              label="Difficulty"
              name="difficulty"
              value={formData.difficulty}
              options={DIFFICULTY_OPTIONS}
              onChange={(e) => setFormData((prev) => ({ ...prev, difficulty: e.target.value }))}
              error={createErrors.difficulty}
              required
            />

            <Select
              id="custom-platform"
              label="Platform"
              name="platform"
              value={formData.platform}
              options={PLATFORM_OPTIONS}
              onChange={(e) => setFormData((prev) => ({ ...prev, platform: e.target.value }))}
              error={createErrors.platform}
              required
            />

            <Select
              id="custom-status"
              label="Initial Status"
              name="status"
              value={formData.status}
              options={STATUS_OPTIONS}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
            />
          </div>

          <Input
            id="custom-url"
            label="Problem Link (Optional)"
            name="url"
            type="url"
            placeholder="https://leetcode.com/problems/..."
            value={formData.url}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, url: e.target.value }));
              if (createErrors.url) setCreateErrors((prev) => ({ ...prev, url: null }));
            }}
            error={createErrors.url}
          />

          <button type="submit" className="primary-btn">
            Add Problem
          </button>
        </form>
      </section>

      {/* READ / DISPLAY CUSTOM PROBLEMS WITH TABS */}
      <section aria-labelledby="custom-problems-list-heading">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <h2 id="custom-problems-list-heading" className="section-title" style={{ margin: 0 }}>
            Your Problem List ({problems.length})
          </h2>
          <Tabs
            tabs={statusTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            ariaLabel="Filter custom problems by status"
          />
        </div>

        {displayedProblems.length === 0 ? (
          <p className="empty-state">
            {problems.length === 0
              ? 'No custom problems added yet. Use the form above to log one.'
              : `No custom problems matching status "${activeTab}".`}
          </p>
        ) : (
          <div className="records-list">
            {displayedProblems.map((prob) => {
              const isEditing = editingId === prob.id;

              if (isEditing) {
                return (
                  <div key={prob.id} className="record-card record-card-editing">
                    <h3 className="card-heading">Edit Custom Problem</h3>
                    <div className="form-grid">
                      <Input
                        id={`edit-custom-title-${prob.id}`}
                        label="Problem Title"
                        name="title"
                        value={editFormData.title}
                        onChange={(e) => {
                          setEditFormData((prev) => ({ ...prev, title: e.target.value }));
                          if (editErrors.title) setEditErrors((prev) => ({ ...prev, title: null }));
                        }}
                        error={editErrors.title}
                        required
                      />

                      <Select
                        id={`edit-custom-topic-${prob.id}`}
                        label="Topic"
                        name="topic"
                        value={editFormData.topic}
                        options={topicOptions}
                        onChange={(e) => setEditFormData((prev) => ({ ...prev, topic: e.target.value }))}
                        error={editErrors.topic}
                        required
                      />
                    </div>

                    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                      <Select
                        id={`edit-custom-diff-${prob.id}`}
                        label="Difficulty"
                        name="difficulty"
                        value={editFormData.difficulty}
                        options={DIFFICULTY_OPTIONS}
                        onChange={(e) => setEditFormData((prev) => ({ ...prev, difficulty: e.target.value }))}
                        error={editErrors.difficulty}
                        required
                      />

                      <Select
                        id={`edit-custom-plat-${prob.id}`}
                        label="Platform"
                        name="platform"
                        value={editFormData.platform}
                        options={PLATFORM_OPTIONS}
                        onChange={(e) => setEditFormData((prev) => ({ ...prev, platform: e.target.value }))}
                        error={editErrors.platform}
                        required
                      />

                      <Select
                        id={`edit-custom-status-${prob.id}`}
                        label="Status"
                        name="status"
                        value={editFormData.status}
                        options={STATUS_OPTIONS}
                        onChange={(e) => setEditFormData((prev) => ({ ...prev, status: e.target.value }))}
                      />
                    </div>

                    <Input
                      id={`edit-custom-url-${prob.id}`}
                      label="Problem Link (Optional)"
                      name="url"
                      type="url"
                      value={editFormData.url}
                      onChange={(e) => {
                        setEditFormData((prev) => ({ ...prev, url: e.target.value }));
                        if (editErrors.url) setEditErrors((prev) => ({ ...prev, url: null }));
                      }}
                      error={editErrors.url}
                    />

                    <div className="card-actions-row">
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => handleSaveEdit(prob.id)}
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="qa-btn"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              const diffTag = prob.difficulty ? prob.difficulty.toLowerCase() : 'medium';

              return (
                <article key={prob.id} className="record-card">
                  <div className="record-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 className="record-title">{prob.title}</h3>
                      <span className={`q-tag t-${diffTag}`}>{prob.difficulty}</span>
                      <span className="platform-tag">{prob.platform}</span>
                      <span className="topic-badge">{prob.topic}</span>
                    </div>
                    {prob.createdAt && <span className="record-meta">{prob.createdAt}</span>}
                  </div>

                  <div className="record-footer" style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="status-label">Status:</span>
                      <button
                        type="button"
                        className={`qa-btn qa-solve ${prob.status === 'Solved' ? 'active' : ''}`}
                        onClick={() => handleStatusToggle(prob.id, 'Solved')}
                      >
                        Solved
                      </button>
                      <button
                        type="button"
                        className={`qa-btn qa-attempt ${prob.status === 'Attempted' ? 'active' : ''}`}
                        onClick={() => handleStatusToggle(prob.id, 'Attempted')}
                      >
                        Attempted
                      </button>
                      <button
                        type="button"
                        className={`qa-btn ${prob.status === 'Unsolved' ? 'active' : ''}`}
                        onClick={() => handleStatusToggle(prob.id, 'Unsolved')}
                      >
                        Unsolved
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                      {prob.url && (
                        <a
                          className="qa-btn qa-lc"
                          href={prob.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open Link ↗
                        </a>
                      )}
                      <button
                        type="button"
                        className="qa-btn"
                        onClick={() => startEditing(prob)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="qa-btn qa-reset"
                        onClick={() => setDeleteProblemId(prob.id)}
                      >
                        Delete
                      </button>
                      <DropdownMenu
                        ariaLabel={`Options for ${prob.title}`}
                        trigger={<span className="qa-btn" style={{ padding: '4px 8px' }}>•••</span>}
                        items={[
                          { label: 'Edit problem', icon: '✎', onClick: () => startEditing(prob) },
                          { label: 'Mark Solved', icon: '✓', onClick: () => handleStatusToggle(prob.id, 'Solved') },
                          { label: 'Mark Attempted', icon: '⏳', onClick: () => handleStatusToggle(prob.id, 'Attempted') },
                          { label: 'Mark Unsolved', icon: '○', onClick: () => handleStatusToggle(prob.id, 'Unsolved') },
                          { label: 'Delete problem', icon: '✕', isDanger: true, onClick: () => setDeleteProblemId(prob.id) },
                        ]}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* CONFIRMATION DIALOG (replaces window.confirm) */}
      <ConfirmDialog
        isOpen={Boolean(deleteProblemId)}
        title="Delete Custom Problem"
        message="Are you sure you want to delete this custom problem? This action cannot be undone."
        confirmText="Yes, Delete Problem"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteProblemId(null)}
      />
    </div>
  );
}
