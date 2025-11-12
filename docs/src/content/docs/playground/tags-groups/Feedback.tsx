import Tags from '../components/Tags';

export default function TagsGroup() {
  return (
    <div className="not-content">
      <div className='not-content badgeLegendItem'>
        <div className='badge badge-group4'>{Tags.group4[0]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Positive confirmation haptic indicating successful completion of an action or positive outcome.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Use for successful form submissions, completed purchases, achievements unlocked, or tasks finished.</div>
      </div>
      <div className='not-content badgeLegendItem'>
        <div className='badge badge-group4'>{Tags.group4[1]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Cautionary haptic feedback alerting users to potential issues or important information requiring attention.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Perfect for form validation errors, low battery alerts, or when user action might have consequences.</div>
      </div>
      <div className='not-content badgeLegendItem'>
        <div className='badge badge-group4'>{Tags.group4[2]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Strong negative feedback indicating errors, failures, or critical issues that need immediate attention.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Use for error messages, failed operations, security alerts, or when something goes wrong.</div>
      </div>
      <div className='not-content badgeLegendItem'>
        <div className='badge badge-group4'>{Tags.group4[3]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>General informational haptic feedback for delivering neutral messages or updates to the user.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Ideal for incoming messages, app updates, reminders, or general information delivery.</div>
      </div>
      <div className='not-content badgeLegendItem'>
        <div className='badge badge-group4'>{Tags.group4[4]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Positive haptic feedback for rewarding user behavior, achievements, or milestone completion.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Great for gamification elements, streak completions, level ups, or positive reinforcement.</div>
      </div>
      <div className='not-content badgeLegendItem'>
        <div className='badge badge-group4'>{Tags.group4[5]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Pleasant, delightful haptic feedback designed to enhance user experience and create positive emotions.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Perfect for app interactions that should feel fun, engaging animations, or brand experience moments.</div>
      </div>
      <div className='not-content badgeLegendItem'>
        <div className='badge badge-group4'>{Tags.group4[6]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Responsive haptic feedback for direct user interactions like taps, swipes, or button presses.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Essential for UI element interactions, providing immediate feedback for user touch events.</div>
      </div>
    </div>
  );
}