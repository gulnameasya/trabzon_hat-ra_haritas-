// "Nasıl Çalışır?" adımları için sade, tek renkli çizgisel ikonlar.
// Ek bir ikon kütüphanesine bağımlı kalmamak için basit SVG'ler olarak yazıldı.

export function CameraIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M4 8.5C4 7.67157 4.67157 7 5.5 7H8L9.2 5H14.8L16 7H18.5C19.3284 7 20 7.67157 20 8.5V17.5C20 18.3284 19.3284 19 18.5 19H5.5C4.67157 19 4 18.3284 4 17.5V8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <circle cx="12" cy="13" r="3.4" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

export function PinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 21C12 21 18 14.6 18 10C18 6.68629 15.3137 4 12 4C8.68629 4 6 6.68629 6 10C6 14.6 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

export function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8.5 12.3L10.8 14.6L15.5 9.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function PeopleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="9" cy="9" r="2.6" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M4 19C4 15.9 6.24 14 9 14C11.76 14 14 15.9 14 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="16.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M14.8 14.2C15.5 14.07 16 14 16.5 14C18.99 14 20.5 15.6 20.5 18.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export function HeartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 20C12 20 4 15.2 4 9.6C4 6.8 6.1 4.8 8.6 4.8C10.1 4.8 11.3 5.5 12 6.6C12.7 5.5 13.9 4.8 15.4 4.8C17.9 4.8 20 6.8 20 9.6C20 15.2 12 20 12 20Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  );
}
