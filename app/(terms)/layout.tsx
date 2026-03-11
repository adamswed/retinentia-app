import styles from '@/styles/privacy-and-terms.module.scss';
export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className={`${styles.privacy_and_terms_wrapper} terms-layout`}>{children}</div>
    </>
  );
}
