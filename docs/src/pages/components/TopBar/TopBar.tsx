import styles from './TopBar.module.scss';

import logo from '../../../assets/logo.svg';
import logoGitHub from '../../../assets/landing-page/logo-github.png';

export function TopBar() {
  return(<div className={styles.container}>
    <div className={styles.logoHolder}>
      <img src={logo.src} alt="Logo" />
      <span>Pulsar</span>
    </div>
    <div className={styles.menuItems}>
      <a href='presets'>Presets</a>
      <a href='#'>Live Preview</a>
      <a href='#'>Tutorials</a>
    </div>
    <img className={styles.gitLogo} src={logoGitHub.src} />
  </div>)
}
