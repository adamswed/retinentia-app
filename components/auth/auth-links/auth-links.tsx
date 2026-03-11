import { useAuth } from '@/context/auth-context';
import styles from './auth-links.module.scss';
import Link from 'next/link';
interface Props {
  emailSignInLinks?: boolean;
  emailSignUpLinks?: boolean;
  forgotPasswordLinks?: boolean;
  updatePasswordLinks?: boolean;
  deleteAccountLinks?: boolean;
}
const AuthLinks: React.FC<Props> = ({
  emailSignInLinks,
  emailSignUpLinks,
  forgotPasswordLinks,
  updatePasswordLinks,
  deleteAccountLinks,
}) => {
  const auth = useAuth();
  const user = auth?.currentUser;

  const isPasswordProvider = user?.providerData.find(
    (provider) => provider.providerId === 'password'
  );
  return (
    <nav className={styles.auth_links_wrapper}>
      {emailSignInLinks && (
        <>
          <Link className={styles.auth_link} href='/sign-in'>
            Go back
          </Link>
          <span> | </span>
          <Link className={styles.auth_link} href='/forgot-password'>
            Forgot Password
          </Link>
        </>
      )}
      {emailSignUpLinks && (
        <>
          <Link className={styles.auth_link} href='/email-sign-in'>
            Sign In
          </Link>
        </>
      )}
      {forgotPasswordLinks && (
        <>
          <Link className={styles.auth_link} href='/sign-in'>
            Go back
          </Link>
        </>
      )}
      {updatePasswordLinks && (
        <>
          <Link className={styles.auth_link} href='/account/main'>
            Main Account
          </Link>{' '}
          <span> | </span>
          <Link className={styles.auth_link} href='/account/delete'>
            Delete Account
          </Link>
        </>
      )}
      {deleteAccountLinks && (
        <>
          <Link className={styles.auth_link} href='/account/main'>
            Main Account
          </Link>{' '}
        </>
      )}
      {deleteAccountLinks && isPasswordProvider && (
        <>
          <span> | </span>
          <Link className={styles.auth_link} href='/account/update-password'>
            Update Password
          </Link>
        </>
      )}
    </nav>
  );
};

export default AuthLinks;
