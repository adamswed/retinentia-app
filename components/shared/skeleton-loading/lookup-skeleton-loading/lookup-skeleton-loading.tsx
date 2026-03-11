import styles from './lookup-skeleton-loading.module.scss';

const LookupSkeletonLoading = () => {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeleton_text}></div>
      <div className={styles.skeleton_text}></div>
      <div className={styles.skeleton_text}></div>
      <div className={styles.skeleton_text}></div>
    </div>
  );
};

export default LookupSkeletonLoading;
