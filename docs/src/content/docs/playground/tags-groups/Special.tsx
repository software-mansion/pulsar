import Tags from '../components/Tags';

export default function TagsGroup() {
  return (
    <div className="not-content">
      <div className='not-content badgeLegendItem'>
        <div className='badge badge-group6'>{Tags.group6[0]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Triumphant haptic feedback celebrating victories, competitions won, or successful outcomes.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Perfect for game victories, contest wins, successful challenges, or achieving competitive goals.</div>
      </div>
      <div className='not-content badgeLegendItem'>
        <div className='badge badge-group6'>{Tags.group6[1]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Fresh, initiating haptic patterns that mark the start of new experiences, journeys, or processes.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Ideal for onboarding flows, app launches, new user experiences, or starting new activities.</div>
      </div>
      <div className='not-content badgeLegendItem'>
        <div className='badge badge-group6'>{Tags.group6[2]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Satisfying completion haptic that signals the successful finish of tasks, projects, or goals.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Great for productivity apps, project management, task lists, or any completion-based features.</div>
      </div>
      <div className='not-content badgeLegendItem'>
        <div className='badge badge-group6'>{Tags.group6[3]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Attention-grabbing haptic patterns designed to broadcast important information or updates.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Perfect for news apps, important updates, system announcements, or broadcasting features.</div>
      </div>
      <div className='not-content badgeLegendItem'>
        <div className='badge badge-group6'>{Tags.group6[4]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Tactile haptic feedback that simulates physical sensations or real-world material interactions.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Excellent for AR/VR applications, material design feedback, or creating realistic touch sensations.</div>
      </div>
    </div>
  );
}