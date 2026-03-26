import { useState } from 'react';
import styles from './TopBar.module.scss';

import logo from '../../../assets/logo.svg';
import logoGitHub from '../../../assets/landing-page/logo-github.png';
import menuIcon from '../../../assets/landing-page/menu.svg';
import closeIcon from '../../../assets/landing-page/x.svg';

export function TopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.logoHolder}>
          <img src={logo.src} alt="Logo" />
          <span>Pulsar</span>
        </div>
        <div className={styles.menuItems}>
          <a href="/presets-playground">Presets</a>
          <a href="/getting-started">Getting started</a>
          <a href="/sdk">Docs</a>
        </div>
        <a href="https://github.com/software-mansion-labs/pulsar" target="_blank">
          <img className={styles.gitLogo} src={logoGitHub.src} alt="GitHub" />
        </a>
        <button className={styles.hamburger} onClick={toggleMenu} aria-label="Toggle menu">
          <img src={menuIcon.src} alt="Menu" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className={styles.mobileMenuOverlay} onClick={closeMenu}>
          <div className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileMenuHeader}>
              <div className={styles.logoHolder}>
                <img src={logo.src} alt="Logo" />
                <span>Pulsar</span>
              </div>
              <img
                src={closeIcon.src}
                className={styles.closeButton}
                onClick={closeMenu}
                aria-label="Close menu"
              />
            </div>
            <nav className={styles.mobileMenuItems}>
              <a href="/presets-playground" onClick={closeMenu}>
                Presets
              </a>
              <a href="/getting-started" onClick={closeMenu}>
                Getting started
              </a>
              <a href="/sdk" onClick={closeMenu}>
                Docs
              </a>
            </nav>
            <div className={styles.mobileMenuFooter}>
              <a href="https://github.com/software-mansion-labs/pulsar" target="_blank">
                <img className={styles.gitLogo} src={logoGitHub.src} alt="GitHub" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
