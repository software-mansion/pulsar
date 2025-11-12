export default function LegendItem(
  {name, description, usage}: {name: string, description: string, usage: string}
) {
  return (
    <div className='badgeLegendItem'>
      <div className='badge badge-group2'>{name}</div>
      <br />
      <b className='additionalMargin'>📖 Description</b>
      <div className='desc'>{description}</div>
      <b>🔧 Usage</b>
      <div className='desc'>{usage}</div>
    </div>
  );
}