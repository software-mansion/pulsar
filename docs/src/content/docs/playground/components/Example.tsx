'use client'
import { useRef, useState } from 'react';
import Modal from './Modal';
import { TagsInfo } from './Tags';

function ModalContent({ tagInfo }: { tagInfo: { name: string, description: string, usage: string } }) {
  return <div>
    <b>📖 Description</b>
    <div className='desc'>{tagInfo.description}</div>
    <b>🔧 Usage</b>
    <div className='desc'>{tagInfo.usage}</div>
  </div>;
}

export default function Example(
  props: {
    name: string,
    description: string,
    presetName: string,
    data: string,
    duration: number,
    children: any,
    config: Record<string, number>,
  }
) {
  const [modal, setModal] = useState(<></>);
  const indicator = useRef<HTMLElement>(null);

  function handleAudioClick() {
    const component = indicator.current;
    if (!component) {
      return;
    }
    component.style.animationDuration = `${props.duration}s`
    var audio = new Audio(`../../src/assets/presets/${props.presetName}/pattern.wav`);
    audio.play();
    component.classList.remove('indicator-inactive')
    component.classList.add('indicator-active')
    component.onanimationend = () => {
      component.classList.remove('indicator-active')
      component.classList.add('indicator-inactive')
    }
  }

  function handleDeviceClick() {
    const channel = localStorage.getItem('hapticsChannel');
    const token = localStorage.getItem('hapticsBroadcastToken');
    fetch(`https://haptics-server.onrender.com/broadcast?channel=${channel}&token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: props.data,
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then(data => {
      console.log('Success:', data);
    }).catch((error) => {
      console.error('Error:', error);
    });
  }

  const badges = [];
  for (const [group, option] of Object.entries(props.config)) {
    const tagInfo = TagsInfo[group as keyof typeof TagsInfo][option];
    badges.push(
      <div 
        key={group}
        className={`badge badge-${group}`}
        data-group={group}
        data-option={tagInfo.name}
        onClick={() => setModal(<Modal reset={() => setModal(<></>)} title={tagInfo.name}>
          <ModalContent tagInfo={tagInfo} />
        </Modal>)}
      >{tagInfo.name}</div>
    );
  }

  return <div className='exampleBorder'>
    {modal}
    <div className='not-content badgeBar'>
      {badges}
    </div>
    <div>{props.description}</div>

    <div className='not-content player'>
      <div className='controls'>
        <div className='iconWrapper' onClick={handleAudioClick}>
          <svg className='icon-button' viewBox="0 0 122.88 122.88"><g><path className='svgIcon' d="M61.44,0c33.93,0,61.44,27.51,61.44,61.44s-27.51,61.44-61.44,61.44S0,95.37,0,61.44S27.51,0,61.44,0L61.44,0z M84.91,65.52c3.41-2.2,3.41-4.66,0-6.61L49.63,38.63c-2.78-1.75-5.69-0.72-5.61,2.92l0.11,40.98c0.24,3.94,2.49,5.02,5.8,3.19 L84.91,65.52L84.91,65.52z"/></g></svg>
        </div>
        <div className='iconWrapper' onClick={handleDeviceClick}>
          <svg className='icon-button shakeAnimation' viewBox="0 0 490 512.27"><path className='svgIcon' d="m227.05 1.9 160.1 42.9c14.56 3.9 26.26 13.4 33.17 25.48 7.03 12.19 9.35 26.98 5.46 41.46l-96.46 360c-3.9 14.58-13.39 26.27-25.46 33.18-12.2 7.05-26.97 9.35-41.46 5.47l-160.11-42.9c-14.57-3.9-26.27-13.39-33.17-25.47-7.04-12.18-9.36-26.96-5.47-41.47l96.48-360.07c3.9-14.57 13.39-26.27 25.47-33.18 12.18-7.03 26.88-9.31 41.45-5.4zM440.5 206.79c-3.38-5.64-1.54-12.96 4.11-16.34 5.64-3.37 12.95-1.53 16.33 4.11l27.37 45.64c3.38 5.64 1.54 12.96-4.11 16.33l-34.18 17.36L470.76 303c3.81 5.36 2.56 12.8-2.8 16.62-.53.37-1.08.7-1.64.97l-34.24 17.03 20.74 35.54c3.29 5.7 1.35 12.99-4.35 16.29l-47.01 27.95c-5.64 3.35-12.94 1.49-16.29-4.15-3.35-5.65-1.49-12.95 4.15-16.29l36.95-22-21.59-37.06c-2.91-5.9-.49-13.05 5.41-15.96l33.15-16.49-20.54-28.84c-.4-.53-.76-1.11-1.07-1.72-2.96-5.88-.6-13.04 5.28-16.01l34.38-17.42-20.79-34.67zM88.26 94.7c5.75-3.2 13-1.13 16.2 4.62 3.19 5.75 1.12 13-4.63 16.19l-35.34 19.63 21.1 32.33c3.58 5.51 2.01 12.89-3.5 16.47-.62.4-1.27.74-1.93 1.02l-32.03 14.61 20.5 30.9c3.64 5.49 2.13 12.89-3.36 16.52l-37.14 21.28 20.99 37.5c3.22 5.75 1.18 13.02-4.57 16.25-5.75 3.22-13.02 1.17-16.24-4.58L1.58 269.7c-3.27-5.73-1.29-13.02 4.43-16.29l35.69-20.4-21.16-31.89c-.32-.52-.62-1.07-.88-1.64-2.73-5.97-.1-13.04 5.88-15.77l32.52-14.84-20.94-32.14c-3.19-5.75-1.13-13 4.62-16.19L88.26 94.7zm109.31 337.44c11.94 3.2 19.12 15.43 15.88 27.51-3.2 11.96-15.43 19.14-27.52 15.9-7.42-1.98-13-7.46-15.39-14.21-1.46-4.13-1.73-8.73-.51-13.32 3.2-11.93 15.43-19.13 27.54-15.88zM82.23 383.52l239.51 64.18 89.68-334.69-239.51-64.17-89.68 334.68z"/></svg>
        </div>
      </div>
      <div className='imageHolder'>
        <div ref={indicator as any} className='indicator'>
          <div className='verticalLine'></div>
        </div>
        <img src={`../../src/assets/presets/${props.presetName}/pattern.png`} />
      </div>
    </div>

    <details>
      <summary>
        <b>Usage ⬇️</b>
      </summary>
      {props.children}
    </details>
  </div>
}