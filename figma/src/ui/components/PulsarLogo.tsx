// Inline copy of docs/src/assets/logo.svg, simplified to a single path the
// React renderer can ship without a bundler asset pipeline. Matches the public
// Pulsar mark used on docs.swmansion.com.
export default function PulsarLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M25.7252 7.76367C26.8297 7.76381 27.7252 8.65919 27.7252 9.76367V16.7109H31.7906C32.8952 16.7109 33.7906 17.6064 33.7906 18.7109C33.7906 19.8155 32.8952 20.7109 31.7906 20.7109H25.7252C24.6207 20.7109 23.7252 19.8155 23.7252 18.7109V11.7637H22.1901V30.2363C22.19 31.3407 21.2945 32.2362 20.1901 32.2363H14.4274C13.3229 32.2363 12.4275 31.3408 12.4274 30.2363V24.1992H8.20959C7.10516 24.1992 6.20981 23.3036 6.20959 22.1992C6.20959 21.0946 7.10503 20.1992 8.20959 20.1992H14.4274C15.5318 20.1993 16.4274 21.0947 16.4274 22.1992V28.2363H18.1901V9.76367C18.1901 8.6591 19.0855 7.76367 20.1901 7.76367H25.7252Z"
        fill="#E1F3FA"
        stroke="#38ACDD"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
