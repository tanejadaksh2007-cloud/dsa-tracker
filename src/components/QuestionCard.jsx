import { useSelector, useDispatch } from 'react-redux';
import { selectQuestionStatus, setQuestionStatus } from '../store/progressSlice';
import { useToast } from '../context/ToastContext';

export default function QuestionCard({ topicId, question, cardKey, isOpen, onToggle }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const status = useSelector((state) => selectQuestionStatus(state, topicId, question.name));
  const link = question.link || question.leetcode;
  const linkLabel = question.linkLabel || 'LeetCode ↗';

  function mark(value, event) {
    event.stopPropagation();
    dispatch(setQuestionStatus({ topicId, qName: question.name, status: value }));
    if (value === 'solved') {
      toast.success(`"${question.name}" marked as solved!`);
    } else if (value === 'attempted') {
      toast.info(`"${question.name}" marked as attempted.`);
    } else {
      toast.info(`Reset status for "${question.name}".`);
    }
  }

  return (
    <div className={`q-card ${status}`} onClick={onToggle}>
      <div className="q-row">
        <div className={`q-dot ${status}`} />
        <div className="q-name">
          <span>{question.name}</span>
          {question.topicName && (
            <span className="q-topic-badge" title={`Topic: ${question.topicName}`}>
              {question.topicIcon || '◈'} {question.topicName}
            </span>
          )}
        </div>
        <span className={`q-tag t-${question.tag}`}>{question.tag}</span>
        <span className={`q-chevron ${isOpen ? 'open' : ''}`}>›</span>
      </div>
      <div className={`q-body ${isOpen ? 'open' : ''}`}>
        <div className="q-concept">{question.concept}</div>
        <div className="q-actions">
          <button
            type="button"
            className={`qa-btn qa-solve ${status === 'solved' ? 'active' : ''}`}
            onClick={(e) => mark('solved', e)}
          >
            Mark solved
          </button>
          <button
            type="button"
            className={`qa-btn qa-attempt ${status === 'attempted' ? 'active' : ''}`}
            onClick={(e) => mark('attempted', e)}
          >
            Attempted
          </button>
          <button type="button" className="qa-btn qa-reset" onClick={(e) => mark('none', e)}>
            Reset
          </button>
          {link && (
            <a
              className="qa-btn qa-lc"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {linkLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
