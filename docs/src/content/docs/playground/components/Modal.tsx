import { useEffect } from "react";

export default function Modal(
  {title, children, reset}: {title: string, children?: any, reset: () => void},
) {
  useEffect(() => {
    let navStyle: string | null = null;
    let asideStyle: string | null = null;
    const nav = document.querySelector("nav");
    if (nav) {
      navStyle = nav.style.zIndex;
      nav.style.zIndex = "0";
    }
    const aside = document.querySelector("aside");
    if (aside) {
      asideStyle = aside.style.zIndex;
      aside.style.zIndex = "-1";
    }

    return () => {
      if (nav && navStyle !== null) {
        nav.style.zIndex = navStyle;
      }
      if (aside && asideStyle !== null) {
        aside.style.zIndex = asideStyle;
      }
    };
  }, []);

  return (
    <div className="not-content modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <span className="close-button" onClick={reset}>&times;</span>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
}
