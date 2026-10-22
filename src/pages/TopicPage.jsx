import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { TOPICS } from '../data';
import { calcScore, verdict, getQuestionStatus } from '../utils/scoring';
import { selectProgressState } from '../store/progressSlice';
import QuestionCard from '../components/QuestionCard';

export default function TopicPage() {
  const { topicId } = useParams();
  const state = useSelector(selectProgressState);
  const [openCards, setOpenCards] = useState({});
  const topRef = useRef(null);

  const topicIndex = TOPICS.findIndex((t) => t.id === topicId);
  const topic = topicIndex >= 0 ? TOPICS[topicIndex] : null;

  const score = useMemo(
    () => (topic ? calcScore(topic, state) : 0),
    [topic, state]
  );

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [topicId]);

  if (!topic) {
    return <Navigate to="/not-found" replace />;
  }

  const v = verdict(score);
  const prev = TOPICS[topicIndex - 1];
  const next = TOPICS[topicIndex + 1];
  const barColor = score >= 80 ? 'var(--c-green)' : score >= 50 ? 'var(--c-amber)' : 'var(--c-red)';

  function toggleCard(key) {
    setOpenCards((prevOpen) => ({ ...prevOpen, [key]: !prevOpen[key] }));
  }

  return (
    <div className="topic-content" ref={topRef}>
      <div className="topic-nav-row">
        <div className="topic-nav-left">
          <Link to="/" className="back-btn">← All topics</Link>
          <Link to={`/problems?topic=${topic.id}`} className="back-btn" title="Open this topic in Problem Explorer">
            ⌕ Search & Filter
          </Link>
        </div>
        <div className="topic-pager">
          {prev && <Link to={`/topic/${prev.id}`} className="pager-btn">← {prev.name}</Link>}
          {next && <Link to={`/topic/${next.id}`} className="pager-btn">{next.name} →</Link>}
        </div>
      </div>

      <div className="topic-hero">
        <div className="th-left">
          <div className="th-icon">{topic.icon}</div>
          <div>
            <h1 className="th-title">{topic.name}</h1>
            <p className="th-why">{topic.why}</p>
          </div>
        </div>
        <div className="th-score-block">
          <div className="th-pct" style={{ color: barColor }}>{score}%</div>
          <div className="th-pct-label">readiness</div>
        </div>
      </div>

      <div className="score-bar-wrap">
        <div className="score-bar-track">
          <div className="score-bar-fill" style={{ width: `${score}%`, background: barColor }} />
        </div>
      </div>

      <div className={`verdict-box ${v.cls}`}>
        <div className="vb-label">{v.label}</div>
        <div className="vb-msg">{v.msg}</div>
      </div>

      <div className="sections">
        {topic.sections.map((section, si) => (
          <div className="sec-block" key={section.title}>
            <div className="sec-header">
              <div className="sec-title">{section.title}</div>
              <div className="sec-prog">
                {section.questions.filter((q) => getQuestionStatus(state, topic.id, q.name) === 'solved').length}
                /{section.questions.length} solved
              </div>
            </div>
            {section.questions.map((q, qi) => {
              const cardKey = `${si}-${qi}`;
              return (
                <QuestionCard
                  key={q.name}
                  topicId={topic.id}
                  question={q}
                  cardKey={cardKey}
                  isOpen={!!openCards[cardKey]}
                  onToggle={() => toggleCard(cardKey)}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="bottom-nav">
        {prev ? <Link to={`/topic/${prev.id}`} className="pager-btn pager-lg">← {prev.name}</Link> : <div />}
        {next ? <Link to={`/topic/${next.id}`} className="pager-btn pager-lg">{next.name} →</Link> : <div />}
      </div>
    </div>
  );
}
