import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { TOPICS } from '../data';
import { selectOverallStats } from '../store/progressSlice';
import HowItWorks from '../components/HowItWorks';
import TopicCard from '../components/TopicCard';
import DailyChallengeCard from '../components/DailyChallengeCard';

export default function HomePage() {
  const stats = useSelector(selectOverallStats);

  return (
    <div className="home-content">
      <header className="home-header">
        <div className="home-title-row">
          <div>
            <h1>AlgoForge</h1>
            <p className="home-subtitle">Forge Your Problem-Solving Skills.</p>
          </div>
          <Link to="/problems" className="home-explorer-link">
            <span>⌕</span> Explore All Problems
          </Link>
        </div>
        <div className="hero-stats">
          <div className="hs-card">
            <div className="hs-num">{stats.solved}</div>
            <div className="hs-label">Problems solved</div>
          </div>
          <div className="hs-card">
            <div className="hs-num">{stats.mastered}</div>
            <div className="hs-label">Topics mastered</div>
          </div>
          <div className="hs-card">
            <div className="hs-num">{TOPICS.length - stats.mastered}</div>
            <div className="hs-label">Topics remaining</div>
          </div>
        </div>
      </header>

      <DailyChallengeCard />

      <HowItWorks />

      <div className="topics-grid">
        {TOPICS.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
}
