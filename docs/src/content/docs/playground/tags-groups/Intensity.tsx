import Tags from '../components/Tags';

export default function TagsGroup() {
  return (
    <div className="not-content">
      <div className='not-content badgeLegendItem'>
        <div className='badge badge-group3'>{Tags.group3[0]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Soft, subtle haptic feedback that's barely noticeable. Light vibration that doesn't interrupt user focus.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Perfect for background notifications, hover effects, or accessibility features where subtlety is important.</div>
      </div>
      <div className='not-content badgeLegendItem'>
        <div className='badge badge-group3'>{Tags.group3[1]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Moderate haptic strength that clearly communicates feedback without being disruptive or overwhelming.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Ideal for most UI interactions, form validation, menu navigation, and general app feedback.</div>
      </div>
      <div className='not-content badgeLegendItem'>
        <div className='badge badge-group3'>{Tags.group3[2]}</div>
        <br />
        <b className='additionalMargin'>📖 Description</b>
        <div className='desc'>Strong, attention-grabbing haptic feedback that demands immediate user attention and focus.</div>
        <b>🔧 Usage</b>
        <div className='desc'>Best for critical alerts, error messages, emergency notifications, or high-impact gaming effects.</div>
      </div>
    </div>
  );
}