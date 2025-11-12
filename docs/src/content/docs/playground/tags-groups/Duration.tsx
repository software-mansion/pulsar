import Tags from '../components/Tags';

export default function TagsGroup() {
  return (
    <div className="not-content">
      <div className='badgeLegendItem'>
        <div className='badge badge-group1'>{Tags.group1[0]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Very short haptics pattern with duration less than 100 ms.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Good as a reaction for tap events.</div>
      </div>
      <div className='badgeLegendItem'>
        <div className='badge badge-group1'>{Tags.group1[1]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Short haptic feedback lasting between 100-500ms. Provides clear tactile response without being overwhelming.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Perfect for button presses, toggle switches, or confirming user actions. Commonly used in UI interactions.</div>
      </div>
      <div className='badgeLegendItem'>
        <div className='badge badge-group1'>{Tags.group1[2]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Medium-length haptic patterns lasting 500ms to 2 seconds. Allows for more complex feedback sequences.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Ideal for notifications, progress indicators, or multi-step interactions. Good for drawing user attention.</div>
      </div>
      <div className='badgeLegendItem'>
        <div className='badge badge-group1'>{Tags.group1[3]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Extended haptic experiences lasting over 2 seconds. Can include complex patterns and variations.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Best for immersive experiences, gaming effects, or elaborate feedback sequences that tell a story.</div>
      </div>
    </div>
  );
}