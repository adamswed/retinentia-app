import Image, { StaticImageData } from 'next/image';
import styles from './auth-button.module.scss';
import LoadingSpinner from '@/components/shared/loading-spinner/loading-spinner';
interface Props {
  children: React.ReactNode;
  loading: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  iconSrc?: string | StaticImageData;
  iconAlt?: string;
  glow?: boolean;
}
const AuthButton: React.FC<Props> = ({
  children,
  onClick,
  loading,
  iconSrc,
  iconAlt,
  glow,
}) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.auth_button}${glow ? ` ${styles.glow}` : ''}`}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {iconSrc && (
            <Image
              src={iconSrc}
              alt={iconAlt ?? ''}
              className={styles.icon}
              width={20}
              height={20}
            />
          )}
          {children}
        </>
      )}
    </button>
  );
};

export default AuthButton;
