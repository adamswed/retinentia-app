import Image from 'next/image';
import logo from '@/assets/logo.svg';
import styles from './footer.module.scss';
const Footer = () => {
  return (
    <footer className={styles.footer}>
      <Image className={styles.logo} src={logo} alt={'Retinentia Logo'} />
    </footer>
  );
};
export default Footer;