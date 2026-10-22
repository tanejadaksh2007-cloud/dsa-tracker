import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectTopicScore, selectTopicSolvedCount } from '../store/progressSlice';
import { totalQuestions } from '../utils/scoring';

// Syllabus: props + conditional rendering
export default function NavItem({ topic }) {
  const score = useSelector((state) => selectTopicScore(state, topic));
  const isMastered = score >= 80;
  const solved = useSelector((state) => selectTopicSolvedCount(state, topic));
  const total = totalQuestions(topic);

  return (
    <NavLink
      to={`/topic/${topic.id}`}
      className={({ isActive }) =>
        `nav-item${isActive ? ' active' : ''}${isMastered ? ' mastered' : ''}`
      }
    >
      <span className="nav-icon">{topic.icon}</span>
      <span className="nav-label">
        <span className="nav-name">{topic.name}</span>
        <span className="nav-meta">{solved}/{total} solved</span>
      </span>
      <span className={`nav-score ${isMastered ? 'score-green' : score > 0 ? 'score-amber' : ''}`}>
        {score > 0 ? `${score}%` : ''}
      </span>
      {isMastered && <span className="nav-check">✓</span>}
    </NavLink>
  );
}
