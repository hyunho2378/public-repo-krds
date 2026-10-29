// Figma: KRDS button. 속성 Type(primary, secondary, tertiary, text), Size(small, medium, large)
import { Link } from 'react-router-dom';

export function Button({ children, Type = 'primary', Size = 'medium', type = 'button', ...props }) {
  return (
    <button className={`krds-btn ${Size} ${Type}`} type={type} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({ children, Type = 'primary', Size = 'medium', to, ...props }) {
  return (
    <Link className={`krds-btn ${Size} ${Type}`} to={to} {...props}>
      {children}
    </Link>
  );
}
