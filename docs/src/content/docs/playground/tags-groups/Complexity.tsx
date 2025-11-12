import Tags from '../components/Tags';

export default function TagsGroup() {
  return (
    <div className="not-content">
      <div className='badgeLegendItem'>
        <div className='badge badge-group2'>{Tags.group2[0]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Basic single-pulse haptic feedback. Usually consists of a single vibration event or simple on/off pattern.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Great for basic confirmations, simple button taps, or minimalist feedback where subtlety is key.</div>
      </div>
      <div className='badgeLegendItem'>
        <div className='badge badge-group2'>{Tags.group2[1]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Multi-step haptic patterns with variations in intensity or timing. Contains 2-4 distinct haptic events.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Perfect for notifications with different urgency levels, scroll boundaries, or multi-state feedback.</div>
      </div>
      <div className='badgeLegendItem'>
        <div className='badge badge-group2'>{Tags.group2[2]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Sophisticated haptic sequences with multiple layers, varying intensities, and intricate timing patterns.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Ideal for immersive gaming experiences, elaborate notifications, or creating unique brand-specific feedback.</div>
      </div>
    </div>
  );
}