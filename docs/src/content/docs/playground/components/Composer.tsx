import { useEffect, useState, type ReactElement } from "react";
import Tags from './Tags';
import Modal from "./Modal";
import Duration from '../tags-groups/Duration';
import Complexity from '../tags-groups/Complexity';
import Intensity from '../tags-groups/Intensity';
import Feedback from '../tags-groups/Feedback';
import Emotions from '../tags-groups/Emotions';
import Special from '../tags-groups/Special';

const GroupTagsState: Record<string, Set<string>> = {
  group1: new Set<string>(),
  group2: new Set<string>(),
  group3: new Set<string>(),
  group4: new Set<string>(),
  group5: new Set<string>(),
  group6: new Set<string>(),
  group7: new Set<string>(),
};

function filterTags() {
  const examples = document.querySelectorAll('.badgeBar');
  let visibleCounter = 0;
  examples.forEach((bar) => {

    let shouldBeVisible = true;
    for (const groupName in GroupTagsState) {
      const groupState = GroupTagsState[groupName];
      if (groupState.size == 0) {
        continue
      }
      for (let i = 0; i < bar.children.length; i++) {
        const badge = bar.children[i] as HTMLElement;
        const badgeGroup = badge.dataset['group'];
        if (badgeGroup !== groupName) {
          continue;
        }
        const badgeOption = badge.dataset['option'] ?? '';
        if (!groupState.has(badgeOption)) {
          shouldBeVisible = false;
          break;
        }
      }
    }

    const example = bar?.parentElement?.parentElement as HTMLElement;
    const title = example?.previousElementSibling as HTMLElement;
    const sectionId = title.querySelector('h3')?.id;
    const link = document.querySelector(`.right-sidebar-panel a[href$="#${sectionId}"]`) as HTMLElement;
    if (shouldBeVisible) {
      title.style.display = 'block';
      example.style.display = 'block';
      link.style.display = 'block';
      visibleCounter++;
    } else {
      title.style.display = 'none';
      example.style.display = 'none';
      link.style.display = 'none';
    }

  });
  if (visibleCounter === 0) {
    const noResults = document.querySelector('.no-results') as HTMLElement;
    noResults.style.display = 'block';
  } else {
    const noResults = document.querySelector('.no-results') as HTMLElement;
    noResults.style.display = 'none';
  }
}

function Badge({initialState, option, group}: {initialState: boolean, option: string, group: string}) {
  const [toggle, setToggle] = useState(initialState);
  
  useEffect(() => {
    setToggle(initialState);
    if (initialState) {
      GroupTagsState[group].add(option);
    } else {
      GroupTagsState[group].delete(option);
    }
  }, [initialState]);

  function handleClick() {
    const newState = !toggle;
    setToggle(newState);
    if (newState) {
      GroupTagsState[group].add(option);
    } else {
      GroupTagsState[group].delete(option);
    }
    filterTags();
  }

  return (
    <div 
      className={`badge clickable badge-${group} ${toggle ? '' : 'badge-disable'}`}
      onClick={handleClick}
    >{option}</div>
  )
}

function SelectAll({onClick}: {onClick?: () => void}) {
  return <svg onClick={onClick} className='svgSelectAll' viewBox="0 0 122.88 120.79"><g><path d="M31.4,21.63h60.68V7.68c0-0.08-0.02-0.16-0.04-0.22c-0.03-0.07-0.08-0.14-0.13-0.19l-0.01-0.01 c-0.05-0.06-0.12-0.1-0.19-0.13c-0.07-0.03-0.15-0.04-0.23-0.04H7.68c-0.08,0-0.16,0.02-0.22,0.04C7.39,7.15,7.32,7.2,7.25,7.26 L7.23,7.28C7.19,7.33,7.15,7.39,7.12,7.46C7.09,7.53,7.08,7.6,7.08,7.68v83.8c0,0.08,0.02,0.16,0.05,0.22l0.01,0.03 c0.03,0.06,0.07,0.13,0.12,0.18c0.06,0.06,0.13,0.1,0.2,0.13l0.02,0.01c0.06,0.02,0.13,0.04,0.2,0.04h16.04V29.31 c0-1.03,0.21-2.03,0.58-2.93c0.39-0.94,0.96-1.79,1.67-2.5l0.04-0.04c0.7-0.69,1.54-1.25,2.46-1.63 C29.38,21.84,30.37,21.63,31.4,21.63L31.4,21.63z M51.99,75.95c-0.95-0.86-1.47-2.03-1.53-3.23c-0.06-1.19,0.34-2.4,1.2-3.35 c0.86-0.95,2.04-1.47,3.23-1.53c1.18-0.06,2.4,0.34,3.35,1.2l9.09,8.25l20.78-21.88c0.89-0.93,2.07-1.42,3.27-1.45 c1.19-0.03,2.4,0.4,3.33,1.28c0.93,0.89,1.42,2.07,1.45,3.27c0.03,1.19-0.4,2.4-1.28,3.33L69.84,88.19L69.59,88 c-0.58,0.28-1.21,0.43-1.85,0.46c-1.17,0.04-2.36-0.35-3.29-1.2L51.99,75.95L51.99,75.95z M99.15,21.63h16.04 c1.03,0,2.03,0.21,2.93,0.59c0.94,0.39,1.79,0.96,2.5,1.67l0.04,0.04c0.69,0.7,1.25,1.53,1.63,2.45c0.38,0.91,0.58,1.9,0.58,2.94 v83.8c0,1.04-0.21,2.03-0.58,2.93c-0.39,0.94-0.96,1.79-1.67,2.5c-0.71,0.71-1.55,1.28-2.5,1.67c-0.91,0.38-1.9,0.59-2.93,0.59 H31.4c-1.03,0-2.02-0.21-2.93-0.58c-0.94-0.39-1.79-0.96-2.5-1.67c-0.71-0.71-1.28-1.56-1.67-2.5c-0.38-0.91-0.58-1.9-0.58-2.93 V99.16H7.68c-1.03,0-2.03-0.21-2.93-0.59c-0.94-0.39-1.79-0.96-2.5-1.67c-0.71-0.71-1.28-1.56-1.67-2.5C0.21,93.5,0,92.51,0,91.48 V7.68c0-1.04,0.21-2.03,0.58-2.93c0.39-0.94,0.96-1.79,1.67-2.5c0.71-0.71,1.55-1.28,2.5-1.67C5.66,0.21,6.65,0,7.68,0h83.79 c1.04,0,2.03,0.21,2.93,0.58c0.94,0.39,1.79,0.96,2.5,1.67c1.4,1.4,2.26,3.31,2.26,5.43V21.63L99.15,21.63z M115.2,28.7H31.4 c-0.08,0-0.15,0.02-0.22,0.04c-0.08,0.03-0.15,0.08-0.2,0.14l-0.01,0.01c-0.06,0.05-0.1,0.12-0.13,0.19 c-0.03,0.07-0.04,0.14-0.04,0.22v83.8c0,0.08,0.02,0.16,0.04,0.22c0.03,0.07,0.08,0.14,0.14,0.2l0.02,0.02 c0.05,0.05,0.12,0.09,0.18,0.11c0.07,0.03,0.14,0.04,0.22,0.04h83.79c0.08,0,0.16-0.02,0.22-0.04l0.02-0.01 c0.07-0.03,0.13-0.07,0.18-0.13c0.05-0.06,0.1-0.12,0.13-0.19l0.01-0.02c0.02-0.06,0.03-0.13,0.03-0.21v-83.8 c0-0.08-0.02-0.15-0.04-0.22l-0.01-0.02c-0.03-0.06-0.07-0.12-0.12-0.17c-0.06-0.06-0.13-0.11-0.2-0.14 C115.35,28.72,115.28,28.7,115.2,28.7L115.2,28.7z"/></g></svg>
}

function UnselectAll({onClick}: {onClick?: () => void}) {
  return <svg onClick={onClick} className='svgSelectAll' viewBox="0 0 122.88 120.79"><path d="M31.4,21.63H92.08V7.68a.54.54,0,0,0,0-.22.64.64,0,0,0-.13-.19l0,0a.64.64,0,0,0-.19-.13.59.59,0,0,0-.23,0H7.68a.51.51,0,0,0-.22,0,.85.85,0,0,0-.21.14l0,0a.78.78,0,0,0-.11.18.54.54,0,0,0,0,.22v83.8a.54.54,0,0,0,0,.22v0a.94.94,0,0,0,.12.18.74.74,0,0,0,.21.13h0a.64.64,0,0,0,.2,0H23.73V29.31A7.66,7.66,0,0,1,26,23.88l0,0a7.6,7.6,0,0,1,2.46-1.63,7.68,7.68,0,0,1,2.92-.58ZM84.07,53.07a5.14,5.14,0,1,1,7.27,7.27l-10.8,10.8,10.8,10.79a5.14,5.14,0,0,1-7.27,7.28l-10.8-10.8L62.48,89.21a5.14,5.14,0,0,1-7.27-7.28L66,71.14,55.21,60.34a5.14,5.14,0,1,1,7.27-7.27l10.79,10.8,10.8-10.8ZM99.15,21.63h16a7.77,7.77,0,0,1,2.93.58,7.89,7.89,0,0,1,2.5,1.67l0,0a7.68,7.68,0,0,1,2.22,5.39v83.8a7.69,7.69,0,0,1-4.75,7.09,7.59,7.59,0,0,1-2.93.59H31.4a7.5,7.5,0,0,1-2.92-.59A7.7,7.7,0,0,1,24.31,116a7.5,7.5,0,0,1-.58-2.92v-14h-16a7.59,7.59,0,0,1-2.93-.59A7.66,7.66,0,0,1,0,91.48V7.68A7.77,7.77,0,0,1,.58,4.75a7.89,7.89,0,0,1,1.67-2.5A7.86,7.86,0,0,1,4.75.59,7.59,7.59,0,0,1,7.68,0H91.47A7.69,7.69,0,0,1,94.4.58a8.06,8.06,0,0,1,2.5,1.67,7.69,7.69,0,0,1,2.25,5.43v14Zm16,7.07H31.4a.5.5,0,0,0-.21.05.6.6,0,0,0-.21.14h0a.86.86,0,0,0-.13.2.51.51,0,0,0,0,.22v83.8a.54.54,0,0,0,0,.22.66.66,0,0,0,.14.2l0,0a.71.71,0,0,0,.18.12.85.85,0,0,0,.22,0h83.8a.78.78,0,0,0,.22,0h0a.75.75,0,0,0,.18-.13.8.8,0,0,0,.13-.19v0a.64.64,0,0,0,0-.2V29.31a.54.54,0,0,0,0-.22v0a.66.66,0,0,0-.12-.17.85.85,0,0,0-.21-.14.54.54,0,0,0-.22-.05Z"/></svg>
}

function BadgeGroup({names, group}: {names: string[], group: string}) {
  const [toggle, setToggle] = useState(false);
  const [checksum, setChecksum] = useState(0);
  function selector(state: boolean) {
    setChecksum(checksum + 1);
    setToggle(state);
    setTimeout(() => {
      filterTags();
    }, 0);
  }
  
  return (
    <div className="composer-badgeBar">
      {names.map((name) => 
        <Badge key={name + checksum} initialState={toggle} option={name} group={group} />
      )}
      <div style={{float: 'right', flexGrow: 1, textAlign: 'right'}}>
        <SelectAll onClick={() => selector(true)}/>
        <UnselectAll onClick={() => selector(false)}/>
      </div>
    </div>
  )
}

function Composer({refresh}: {refresh: () => void}) {
  const [modal, setModal] = useState<ReactElement>(<></>);
  return (
    <>
    {modal}
    <div id="composerButton" className="button" style={{marginTop: '30px'}} onClick={() => {
      const composer = document.getElementById("composerSurvey")
      if (!!composer) {
        composer.style.display = 'block';
      }
      const composerButton = document.getElementById("composerButton")
      if (!!composerButton) {
        composerButton.style.display = 'none';
      }
    }}>Open composer ♫</div>
    
    <div className="not-content" id="composerSurvey">

      <div className="composer-card">
        <span className="composer-help" onClick={() => {
          setModal(
            <Modal title="⏱️ Duration" reset={() => setModal(<></>)}>
              <Duration />
            </Modal>
          );
        }}>?</span>
        <div className="composer-question">
          1. How long your preset should be?
        </div>
        <BadgeGroup names={Tags.group1} group="group1" />
      </div>

      <div className="composer-card">
        <span className="composer-help" onClick={() => {
          setModal(
            <Modal title="🧮 Complexity" reset={() => setModal(<></>)}>
              <Complexity />
            </Modal>
          );
        }}>?</span>
        <div className="composer-question">
          2. How complex this pattern should be?
        </div>
        <BadgeGroup names={Tags.group2} group="group2" />
      </div>

      <div className="composer-card">
        <span className="composer-help" onClick={() => {
          setModal(
            <Modal title="🔥 Intensity" reset={() => setModal(<></>)}>
              <Intensity />
            </Modal>
          );
        }}>?</span>
        <div className="composer-question">
          3. How intense this pattern should be for a user?
        </div>
        <BadgeGroup names={Tags.group3} group="group3" />
      </div>

      <div className="composer-card">
        <span className="composer-help" onClick={() => {
          setModal(
            <Modal title="⚠️ Feedback type" reset={() => setModal(<></>)}>
              <Feedback />
            </Modal>
          );
        }}>?</span>
        <div className="composer-question">
          4. What type of feedback you want to convey?
        </div>
        <BadgeGroup names={Tags.group4} group="group4" />
      </div>

      <div className="composer-card">
        <span className="composer-help" onClick={() => {
          setModal(
            <Modal title="❤️ Emotions" reset={() => setModal(<></>)}>
              <Emotions />
            </Modal>
          );
        }}>?</span>
        <div className="composer-question">
          5. What emotions would you like to convey?
        </div>
        <BadgeGroup names={Tags.group5} group="group5" />
      </div>

      <div className="composer-card">
        <span className="composer-help" onClick={() => {
          setModal(
            <Modal title="🎉 Special occasions" reset={() => setModal(<></>)}>
              <Special />
            </Modal>
          );
        }}>?</span>
        <div className="composer-question">
          6. Looking for something for a special occasion?
        </div>
        <BadgeGroup names={Tags.group6} group="group6" />
      </div>

      <div className="button topMarginLarge" onClick={refresh}>Once again</div>

    </div>
    </>
  );
}

export default function ComposerWrapper() {
  const [key, setRefresh] = useState(0);
  return <Composer key={key} refresh={() => setRefresh(Math.random())} />
}